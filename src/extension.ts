// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
let fs = require("fs");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "puzzlescript" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('puzzlescript.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from PuzzleScript!');
	});

	context.subscriptions.push(disposable);

	/*
	 * WebView code adapted from VSCode
	 * WebView api sample:
	 * https://github.com/microsoft/vscode-extension-samples/tree/master/webview-sample
	 * Licensed under the MIT license.
	 */

    const onDiskPath = vscode.Uri.file(
		path.join(context.extensionPath, 'media', 'sbpg.html')
    );
	context.subscriptions.push(vscode.commands.registerCommand('puzzlescript.gamePreview', () => {
		GamePreviewPanel.createOrShow(context.extensionUri, onDiskPath);
	}));

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(GamePreviewPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				GamePreviewPanel.revive(webviewPanel, context.extensionUri, onDiskPath);
			}
		});
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

/**
 * Manages game preview webview panels
 */
class GamePreviewPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: GamePreviewPanel | undefined;

	public static readonly viewType = 'gamePreview';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private _sbpg_uri: vscode.Uri;

	public static createOrShow(extensionUri: vscode.Uri, onDiskPath: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
		// If we already have a panel, show it.
		if (GamePreviewPanel.currentPanel) {
			GamePreviewPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			GamePreviewPanel.viewType,
			'Game Preview',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		GamePreviewPanel.currentPanel = new GamePreviewPanel(panel, extensionUri, onDiskPath);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, onDiskPath: vscode.Uri) {
		GamePreviewPanel.currentPanel = new GamePreviewPanel(panel, extensionUri, onDiskPath);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, sbpg: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._sbpg_uri = sbpg;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		GamePreviewPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;

		// Vary the webview's content based on where it is located in the editor.
		this._panel.title = "Game Preview";
		console.log("fspath is: ", this._sbpg_uri.fsPath);
		console.log("beginning readfile...");
		fs.readFile(this._sbpg_uri.fsPath, "utf8", (err : string, data : string) => {
			console.log("File read...");
			this._panel.webview.html = data;
		});
	}
}
