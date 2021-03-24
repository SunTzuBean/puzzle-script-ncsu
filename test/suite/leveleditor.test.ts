import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as levelEditor from '../../src/level-editor';
import * as mocha from 'mocha';

suite('Extension Tests', () => {
	// Tests code coverage functionality
	mocha.describe("Level Editor Does Not Error", function () {
		mocha.it("Level editor not crash", function (done) {
			vscode.commands.executeCommand("puzzlescript.levelEditor").then(done);
		});
	});

	test('Test Level Editor Fields', () => {
		let le = levelEditor.getLevelEditor('test');
		assert(le.viewType() === "levelEditor");
		// Will reject because "test" is not a valid path
	});
});
