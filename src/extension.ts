// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as facades from "./facades";
import * as gamePreview from "./game-preview";
import * as levelEditor from "./level-editor";
import * as exportHtml from "./export-html";
import * as decorate from "./decorate";
import { ENGINE_METHOD_PKEY_METHS } from "constants";
import { PuzzleScriptCompletionItemProvider } from "./completionProvider";

let fs = require("fs");

const availableDecorators : Record<string, vscode.TextEditorDecorationType> = {};
const availableTextColorDecorators : Record<string, vscode.TextEditorDecorationType> = {};

const foreground = new vscode.ThemeColor("foreground");
for (const color of decorate.availableColors) {
	availableDecorators[color] = vscode.window.createTextEditorDecorationType({
		backgroundColor: {id: 'puzzlescript.' + color},
		color: foreground,
		opacity: '0.25',
	});
	availableTextColorDecorators[color] = vscode.window.createTextEditorDecorationType({
		// robbed from VSCode's source itself. See "colorDetector.ts"
		before: {
			contentText: ' ',
			border: "0.1em solid",
			borderColor: foreground,
			margin: '0.1em 0.2em 0 0.2em',
			width: '0.8em',
			height: '0.8em',
			backgroundColor: color
		},
		color: foreground
	});
}

class DecorateGrid extends decorate.GridProcessor {

    activeEditor : vscode.TextEditor;
    decorations : undefined | Record<string, vscode.DecorationOptions[]>;
	decorationsTextColor : undefined | Record<string, vscode.DecorationOptions[]>;
	literalTextColorDecorators : Record<string, vscode.TextEditorDecorationType> = {};

    constructor (activeEditor : vscode.TextEditor) {
        super();
        this.activeEditor = activeEditor;
    }

	processColor(color: string, line: number, colStart: number, colEnd: number): void {
		if (this.decorationsTextColor && this.decorationsTextColor[color]) {
            this.decorationsTextColor[color].push({range: new vscode.Range(new vscode.Position(line, colStart), new vscode.Position(line, colEnd))});
        }
	}

	processLiteralColor(color: string, line: number, colStart: number, colEnd: number): void {
		if (!this.literalTextColorDecorators[color]) {
			this.literalTextColorDecorators[color] = vscode.window.createTextEditorDecorationType({
				backgroundColor: color,
				color: foreground,
				opacity: '0.25'
			});
		}
		if (this.decorationsTextColor && !this.decorationsTextColor[color]) {
			this.decorationsTextColor[color] = [];
			this.processColor(color, line, colStart, colEnd);
		}
	}

    beforeProcess(): void {
        this.decorations = decorate.initializeDecorations();
		this.decorationsTextColor = decorate.initializeDecorations();
    }
    processGrid(color: string, line: number, col: number, lines: string[]): void {
        if (this.decorations && this.decorations[color]) {
            this.decorations[color].push({range: new vscode.Range(new vscode.Position(line, col), new vscode.Position(line, col + 1))});
        }
    }
    afterProcess(): void {
        for (const [colorname, decorator] of Object.entries(availableDecorators)) {
            if (this.decorations) {
                this.activeEditor.setDecorations(decorator, this.decorations[colorname]);
            }
        }
		for (const [colorname, decorator] of Object.entries(availableTextColorDecorators)) {
            if (this.decorationsTextColor) {
                this.activeEditor.setDecorations(decorator, this.decorationsTextColor[colorname]);
            }
        }
    }
    
}

function decorateText(doctext : string, activeEditor : vscode.TextEditor): void {
    decorate.processText(doctext, new DecorateGrid(activeEditor));
}

function activeText() : string {
	if (vscode.window.activeTextEditor) {
		let doc = vscode.window.activeTextEditor.document;
		if (doc.languageId === "puzzlescript") {
			return doc.getText();
		}
	}
	for (const editor of vscode.window.visibleTextEditors) {
		let doc = editor.document;
		if (doc.languageId === "puzzlescript") {
			return doc.getText();
		}
	}
	vscode.window.showErrorMessage("No editor containing puzzlescript code selected.");
	return "";
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
		gp.setGameData(activeText());
		gp.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.toggleGamePreview', () => {
		gp.setGameData(activeText());
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
		le.setGameData(activeText());
		le.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.toggleLevelEditor', () => {
		le.setGameData(activeText());
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
	console.log("voila voila");
	for (const editor of vscode.window.visibleTextEditors) {
		if (editor.document.languageId === "puzzlescript") {
			decorateText(editor.document.getText(), editor);
		}
	}
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor?.document.languageId === "puzzlescript") {
			decorateText(editor.document.getText(), editor);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (event.document.languageId === "puzzlescript") {
			let activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				decorateText(event.document.getText(), activeEditor);
			}

		}
	}, null, context.subscriptions);
	return;
}

export function poop(x: number, y: number): number {
  return x + y + 1;
}
