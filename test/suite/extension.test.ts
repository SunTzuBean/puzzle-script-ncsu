import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import * as myExtension from "../../src/extension";
import * as mocha from 'mocha';

mocha.suite('Extension Tests', () => {
	vscode.window.showInformationMessage('Start all tests.');
	mocha.describe('Test Extension Load', function () {
		mocha.it("Extension should not crash", function (done) {
			vscode.commands.executeCommand("puzzlescript.helloWorld").then(done);
		});
	});

	// Tests code coverage functionality
	test('Sample test', () => {
		myExtension.poop(2, 2);
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
