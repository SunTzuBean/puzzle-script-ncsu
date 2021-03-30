import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as levelEditor from '../../src/level-editor';
import * as mocha from 'mocha';
import * as path from 'path';

mocha.suite('Extension Tests', () => {
	// Tests code coverage functionality
	mocha.describe('Level Editor Does Not Error', () => {
		mocha.it("Should be able to run level editor", function (done) {
			vscode.commands.executeCommand("puzzlescript.levelEditor")
			      .then(done);
		});
		
		mocha.it("Should be callable more than once", function (done) {
			vscode.commands.executeCommand("puzzlescript.levelEditor").then(function () {
				vscode.commands.executeCommand("puzzlescript.levelEditor").then(done);
			});
		});
		
		mocha.it("Should be callable after closing", function (done) {
			vscode.commands.executeCommand("puzzlescript.levelEditor").then(function () {
				vscode.commands.executeCommand("workbench.action.closeAllEditors").then( function () {
					vscode.commands.executeCommand("puzzlescript.levelEditor").then(done);
				});
			});
		});
	});

	mocha.describe('Level Editor Correct Title', () => {
		let pzConsole = vscode.window.createOutputChannel("PuzzleScript");

		let le = levelEditor.getLevelEditor('test', pzConsole);
		mocha.it("Must be LevelEditor", function(done) {
			assert(le.viewType() === "levelEditor");
			let dir = path.resolve(__dirname, '../../..');
			le.createOrShow(vscode.Uri.file(dir));
			assert(le.viewType() === "levelEditor");
			done();
		});
	});
	
	mocha.test('Level Editors Reads File Without Crashing', () => {
		let pzConsole = vscode.window.createOutputChannel("PuzzleScript");
		let dir = path.resolve(__dirname, '../../..');
		let le = levelEditor.getLevelEditor(dir, pzConsole);
		assert(le.viewType() === "levelEditor");
	});
	
});
