'use strict';

declare var global: any;

/* tslint:disable no-require-imports */

import * as fs from 'fs';
import * as paths from 'path';
import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';
import * as process from 'process';

const istanbul = require('istanbul');
const remapIstanbul = require('remap-istanbul');
const spawnSync = require("child_process").spawnSync;

function _mkDirIfExists(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function _readCoverOptions(testsRoot: string): ITestRunnerOptions | undefined {
    const coverConfigPath = paths.join(testsRoot, '..', '..', 'coverconfig.json');
    if (fs.existsSync(coverConfigPath)) {
        const configContent = fs.readFileSync(coverConfigPath, 'utf-8');
        return JSON.parse(configContent);
    }
    return undefined;
}

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
        "reporter": "mocha-jenkins-reporter",
        "reporterOptions": {
            "junit_report_name": "Tests",
            "junit_report_path": "report.xml",
            "junit_report_stack": 1
        }
	});

	const testsRoot = path.resolve(__dirname, '..');
    console.log("testsRoot is: " + testsRoot);

	return new Promise((c, e) => {
    const coverOptions = _readCoverOptions(testsRoot);
    let coverageRunner : CoverageRunner | undefined;
    if (coverOptions && coverOptions.enabled) {
        // Setup coverage pre-test, including post-test hook to report
        coverageRunner = new CoverageRunner(coverOptions, testsRoot);
        coverageRunner.setupCoverage();
    }
		glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
			if (err) {
				return e(err);
			}

			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test
                spawnSync('rm', ['success']);
                spawnSync('rm', ['failure']);
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
                        spawnSync('touch', ['failure']);
					} else {
                        coverageRunner?.reportCoverage();
                        spawnSync('touch', ['success']);
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			}
		});
	});
}

interface ITestRunnerOptions {
    enabled?: boolean;
    relativeCoverageDir: string;
    relativeSourcePath: string;
    ignorePatterns: string[];
    includePid?: boolean;
    reports?: string[];
    verbose?: boolean;
}


class CoverageRunner {

    private coverageVar: string = '$$cov_' + new Date().getTime() + '$$';
    private transformer: any = undefined;
    private matchFn: any = undefined;
    private instrumenter: any = undefined;

    constructor(private options: ITestRunnerOptions, private testsRoot: string) {
        if (!options.relativeSourcePath) {
            return;
        }
    }

    public setupCoverage(): void {
        // Set up Code Coverage, hooking require so that instrumented code is returned
        const self = this;
        self.instrumenter = new istanbul.Instrumenter({ coverageVariable: self.coverageVar });
        const sourceRoot = paths.join(self.testsRoot, self.options.relativeSourcePath);

        // Glob source files
        console.log('src root: ', sourceRoot);
        const srcFiles = glob.sync('**/**.js', {
            cwd: sourceRoot,
            ignore: self.options.ignorePatterns,
        });

        console.log("BEGIN COVERAGE TO BE GENERATED ON THE FOLLOWING FILES");
        srcFiles.splice(srcFiles.findIndex((x) => x === "extension.js"), 1);
        srcFiles.forEach(element => {
          console.log(element);
        });
        console.log("END COVERAGE TO BE GENERATED ON THE FOLLOWING FILES");

        // Create a match function - taken from the run-with-cover.js in istanbul.
        const decache = require('decache');
        const fileMap: any = {};
        srcFiles.forEach((file) => {
            const fullPath = paths.join(sourceRoot, file);
            fileMap[fullPath] = true;

            // On Windows, extension is loaded pre-test hooks and this mean we lose
            // our chance to hook the Require call. In order to instrument the code
            // we have to decache the JS file so on next load it gets instrumented.
            // This doesn't impact tests, but is a concern if we had some integration
            // tests that relied on VSCode accessing our module since there could be
            // some shared global state that we lose.
            decache(fullPath);
        });

        self.matchFn = (file: string): boolean => fileMap[file];
        self.matchFn.files = Object.keys(fileMap);

        // Hook up to the Require function so that when this is called, if any of our source files
        // are required, the instrumented version is pulled in instead. These instrumented versions
        // write to a global coverage variable with hit counts whenever they are accessed
        self.transformer = self.instrumenter.instrumentSync.bind(self.instrumenter);
        const hookOpts = { verbose: false, extensions: ['.js'] };
        istanbul.hook.hookRequire(self.matchFn, self.transformer, hookOpts);

        // initialize the global variable to stop mocha from complaining about leaks
        global[self.coverageVar] = {};

        // Hook the process exit event to handle reporting
        // Only report coverage if the process is exiting successfully
    }

    /**
     * Writes a coverage report.
     * Note that as this is called in the process exit callback, all calls must be synchronous.
     *
     * @returns {void}
     *
     * @memberOf CoverageRunner
     */
    public reportCoverage(): void {
        const self = this;
        istanbul.hook.unhookRequire();
        let cov: any;
        if (typeof global[self.coverageVar] === 'undefined' || Object.keys(global[self.coverageVar]).length === 0) {
            console.error('No coverage information was collected, exit without writing coverage information');
            return;
        } else {
            cov = global[self.coverageVar];
        }

        // TODO consider putting this under a conditional flag
        // Files that are not touched by code ran by the test runner is manually instrumented, to
        // illustrate the missing coverage.
        self.matchFn.files.forEach((file: any) => {
            if (cov[file]) {
                return;
            }
            self.transformer(fs.readFileSync(file, 'utf-8'), file);

            // When instrumenting the code, istanbul will give each FunctionDeclaration a value of 1 in coverState.s,
            // presumably to compensate for function hoisting. We need to reset this, as the function was not hoisted,
            // as it was never loaded.
            Object.keys(self.instrumenter.coverState.s).forEach((key) => {
                self.instrumenter.coverState.s[key] = 0;
            });

            cov[file] = self.instrumenter.coverState;
        });

        // TODO Allow config of reporting directory with
        const reportingDir = paths.join(self.testsRoot, self.options.relativeCoverageDir);
        const includePid = self.options.includePid;
        const pidExt = includePid ? ('-' + process.pid) : '';
        const coverageFile = paths.resolve(reportingDir, 'coverage' + pidExt + '.json');

        // yes, do this again since some test runners could clean the dir initially created
        _mkDirIfExists(reportingDir);

        fs.writeFileSync(coverageFile, JSON.stringify(cov), 'utf8');

        const remappedCollector = remapIstanbul.remap(cov, {
            warn: (warning: any) => {
                // We expect some warnings as any JS file without a typescript mapping will cause this.
                // By default, we'll skip printing these to the console as it clutters it up
                if (self.options.verbose) {
                    console.warn(warning);
                }
            }
        });

        const reporter = new istanbul.Reporter(undefined, reportingDir);
        const reportTypes = (self.options.reports instanceof Array) ? self.options.reports : ['lcov'];
        reporter.addAll(reportTypes);
        reporter.write(remappedCollector, true, () => {
            console.log(`reports written to ${reportingDir}`);
        });
    }
}