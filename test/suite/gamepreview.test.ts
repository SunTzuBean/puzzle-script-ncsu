import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as gamePreview from '../../src/game-preview';

suite('Extension Tests', () => {
	// Tests code coverage functionality
	test('Game Preview Does Not Error', () => {
		vscode.commands.executeCommand("puzzlescript.gamePreview");
	});

	test('Game Preview Correct Title', () => {
		let gp = gamePreview.getGamePreviewPanel('test');
		assert(gp.viewType() === "gamePreview");
	});
});