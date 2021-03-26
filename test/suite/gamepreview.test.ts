import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as gamePreview from '../../src/game-preview';
import * as mocha from 'mocha';


mocha.suite('Extension Tests', () => {
	// Tests code coverage functionality
	mocha.describe('Game Preview Does Not Error', () => {
		mocha.it("Should be able to run game preview", function (done) {
			vscode.commands.executeCommand("puzzlescript.gamePreview")
			      .then(done);
		});

		mocha.it("Should be callable more than once", function (done) {
			vscode.commands.executeCommand("puzzlescript.gamePreview").then(function () {
				vscode.commands.executeCommand("puzzlescript.gamePreview").then(done);
			});
		});

		mocha.it("Should be callable after closing", function (done) {
			vscode.commands.executeCommand("puzzlescript.gamePreview").then(function () {
				vscode.commands.executeCommand("workbench.action.closeAllEditors").then( function () {
					vscode.commands.executeCommand("puzzlescript.gamePreview").then(done);
				});
			});
		});
	});

	mocha.test('Game Preview Correct Title', () => {
		let pzConsole = vscode.window.createOutputChannel("PuzzleScript");

		let gp = gamePreview.getGamePreviewPanel('test', pzConsole);
		assert(gp.viewType() === "gamePreview");
	});
});
