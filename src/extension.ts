// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as facades from './facades';
import * as gamePreview from "./game-preview";
import * as levelEditor from "./level-editor";
import { ENGINE_METHOD_PKEY_METHS } from 'constants';
import { PuzzleScriptCompletionItemProvider } from './completionProvider';

let fs = require("fs");



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "puzzlescript" is now active!');

	let pzConsole = vscode.window.createOutputChannel("PuzzleScript");
	pzConsole.appendLine(`=================================
   PuzzleScript Log V1.7.0 (build 1663)
=================================`);
	pzConsole.show();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "puzzlescript" is now active!');
	let disposable = vscode.commands.registerCommand('puzzlescript.helloWorld', () => {
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from PuzzleScript!');
	});

	context.subscriptions.push(disposable);

	// register a new CompletionItemProvider with extension. This provider will add custom code completion using vscode's intellisense.
	// this completion item provider will only provide completion suggestions when editing puzzlescript files. 
	let sel : vscode.DocumentSelector = { language : 'puzzlescript', scheme: 'file' };
	let codeCompletionDisposable = vscode.languages.registerCompletionItemProvider(sel, new PuzzleScriptCompletionItemProvider(), '');
	context.subscriptions.push(codeCompletionDisposable);

	/*
	 * WebView code adapted from VSCode
	 * WebView api sample:
	 * https://github.com/microsoft/vscode-extension-samples/tree/master/webview-sample
	 * Licensed under the MIT license.
	 */

        const sbpgPath = vscode.Uri.file(
            	path.join(context.extensionPath, 'media', 'sbpg.html')
        );

	let gp = gamePreview.getGamePreviewPanel(context.extensionPath);

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.gamePreview', () => {
		gp.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.toggleGamePreview', () => {
		gp.createOrShow(context.extensionUri);
	}));

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(gp.viewType(), {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				gp.revive(context.extensionUri);
			}
		});
	}

	let le = levelEditor.getLevelEditor(context.extensionPath);

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.levelEditor', () => {
		le.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.toggleLevelEditor', () => {
		le.createOrShow(context.extensionUri);
	}));

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(le.viewType(), {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				le.revive(context.extensionUri);
			}
		});
	}

}

export function poop(x : number, y : number) : number {
	return x + y + 1;
}