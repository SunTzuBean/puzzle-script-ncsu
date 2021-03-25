import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as exportHtml from '../../src/export-html';
import * as mocha from 'mocha';


mocha.suite('Extension Tests', () => {
	// Run the function
	mocha.describe('Export to HTML does not error', () => {
		mocha.it("Should be able to run Export to HTML", function (done) {
			vscode.commands.executeCommand("puzzlescript.exportHtml")
			      .then(done);
		});
	});

	mocha.test('Export to HTML Input Box Correct', () => {
		//let gp = gamePreview.getGamePreviewPanel('test');
		//assert(gp.viewType() === "gamePreview");
	});
});
