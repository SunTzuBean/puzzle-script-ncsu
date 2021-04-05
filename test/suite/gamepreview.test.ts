import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as gamePreview from '../../src/game-preview';
import * as mocha from 'mocha';
import * as path from 'path';

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
		mocha.it("Should not crash when messaged", function (done) {
			vscode.commands.executeCommand("puzzlescript.gamePreview").then(function () {
				setTimeout(() => {
					console.log("view column is:",  vscode.window.activeTextEditor?.viewColumn);
					done();	
				}, 200);
			});
		});
	});

	mocha.describe('Game Preview Constructed Programatically', () => {
		let pzConsole = vscode.window.createOutputChannel("PuzzleScript");

		let dir = path.resolve(__dirname, '../../..');
		let gp = gamePreview.getGamePreviewPanel(dir, pzConsole);

		mocha.it("must be viewable", function (done) {
			gp.createOrShow(vscode.Uri.file(dir));
			done();
		});

		mocha.it("Must be GamePreview", function(done) {
			assert(gp.viewType() === "gamePreview");
			done();
		});

		mocha.it("Must be reviveable", function(done) {
			gp.revive(vscode.Uri.file(dir));
			done();
		});
	});
	
	mocha.test('Game Preview Reads File Without Crashing', () => {
		let pzConsole = vscode.window.createOutputChannel("PuzzleScript");
		let dir = path.resolve(__dirname, '../../..');
		let gp = gamePreview.getGamePreviewPanel(dir, pzConsole);
		assert(gp.viewType() === "gamePreview");
	});

	mocha.test('Game Preview Fails Read Without Crashing', () => {
		let pzConsole = vscode.window.createOutputChannel("PuzzleScript");

		let dir = path.resolve(__dirname, 'fooey');
		let gp = gamePreview.getGamePreviewPanel(dir, pzConsole);
		mocha.it("Must be GamePreview", function(done) {
			assert(gp.viewType() === "gamePreview");

			gp.createOrShow(vscode.Uri.file(dir));
			assert(gp.viewType() === "gamePreview");
			done();
		});
	});
});
