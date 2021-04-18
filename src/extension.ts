// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as facades from "./facades";
import * as gamePreview from "./game-preview";
import * as levelEditor from "./level-editor";
import * as exportHtml from "./export-html";
import { ENGINE_METHOD_PKEY_METHS } from "constants";
import { PuzzleScriptCompletionItemProvider } from "./completionProvider";

let fs = require("fs");

const availableColors : string[] = [
	"black",
	"white",
	"grey",
	"darkgrey",
	"lightgrey",
	"gray",
	"darkgray",
	"lightgray",
	"red",
	"darkred",
	"lightred",
	"brown",
	"darkbrown",
	"lightbrown",
	"orange",
	"yellow",
	"green",
	"darkgreen",
	"lightgreen",
	"blue",
	"lightblue",
	"darkblue",
	"purple",
	"pink"
  ];

let availableDecorators : Record<string, vscode.TextEditorDecorationType> = {};

for (const color of availableColors) {
	availableDecorators[color] = vscode.window.createTextEditorDecorationType({
		cursor: 'crosshair',
		backgroundColor: {id: 'puzzlescript.' + color},
		opacity: '0.25',
	});
}


const sections = ['objects', 'legend', 'sounds', 'collisionlayers', 'rules', 'winconditions', 'levels'];

function decorateText(document : vscode.TextDocument, activeEditor : vscode.TextEditor): void {
	let doctext = document.getText();
	let objectsStart = -1;
	// Find line # of OBJECTS
	{
		let lowercaseLines = doctext.toLowerCase().split("\n");
		objectsStart = lowercaseLines.indexOf("objects");
	}
	if (objectsStart === -1) {
		return;
	}
	let objectsEnds = -1;
	// Find line # that objects ends
	{
		let lowercaseLines = doctext.toLowerCase().split("\n");
		let objectFree = sections.filter((x) => x !== "OBJECTS");
		let sectionLines = sections.map((sectionName) => lowercaseLines.indexOf(sectionName))
																	   .filter((line) => line > objectsStart);
		if (sectionLines.length > 0) {
			objectsEnds = sectionLines.reduceRight((x, y) => x < y ? x : y, Infinity);
		} else {
			if (objectsStart > -1) {
				objectsEnds = lowercaseLines.length;
			}
		}
	}

	const decorations: Record<string, Array<vscode.DecorationOptions>> = {};
	for (let color of availableColors) {
		decorations[color] = [];
	}

	// Find each bunch of objects
	{
		let lines = doctext.split("\n");
		for (var i = objectsStart + 1; i < objectsEnds; i++) {
			if (lines[i].length === 0) {
				continue;
			}
			if (lines[i].substr(0) === "=") {
				continue;
			}
			if (lines[i].match(/\$?[a-zA-Z_]+/)) {
				let colors = lines[i + 1].split(" ").map((s) => s.toLowerCase()).filter((s) => availableDecorators[s]);
				i += 2;
				while (i < lines.length && lines[i].match(/[.0-9]+/)) {
					for (let j = 0; j < lines[i].length; j++) {
						let referencedColor = colors[parseInt(lines[i].charAt(j))];
						if (lines[i].charAt(j) === '.') {
							// tokenDecorator = 'coloredGrey';
							// come back here
						}
						if (referencedColor) {
							decorations[referencedColor].push({range: new vscode.Range(new vscode.Position(i, j), new vscode.Position(i, j + 1))});
						}
					}
					i += 1;
				}
			}
		}
		for (const [colorname, decorator] of Object.entries(availableDecorators)) {
			activeEditor.setDecorations(decorator, decorations[colorname]);
		}
	}
}

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

	let gp = gamePreview.getGamePreviewPanel(context.extensionPath, pzConsole);

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.gamePreview', () => {
		gp.setGameData(vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.getText() : "");
		gp.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.toggleGamePreview', () => {
		gp.setGameData(vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.getText() : "");
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

	let le = levelEditor.getLevelEditor(context.extensionPath, pzConsole);

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.levelEditor', () => {
		le.setGameData(vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.getText() : "");
		le.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.toggleLevelEditor', () => {
		le.setGameData(vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.getText() : "");
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

	// Register the Export to HTML feature
	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.exportHtml', () => {
		Promise.all([exportHtml.exportToHtml(context.extensionPath)]);
	}));

	// Add text decorator for grid items
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor?.document.languageId === "puzzlescript") {
			decorateText(editor.document, editor);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (event.document.languageId === "puzzlescript") {
			let activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				decorateText(event.document, activeEditor);
			}

		}
	}, null, context.subscriptions);
	return;
}

export function poop(x: number, y: number): number {
  return x + y + 1;
}
