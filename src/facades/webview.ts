import * as vscode from 'vscode';
import * as path from 'path';

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

export abstract class WebviewPanel {
	public asWebviewUri(uri : vscode.Uri) : vscode.Uri | undefined {
		if (this.innerPanel) {
			return this.innerPanel.webview.asWebviewUri(uri);
		}
		return undefined;
	}
	private innerPanel : vscode.WebviewPanel | undefined;
	public setInnerPanel(panel : vscode.WebviewPanel | undefined) {
		this.innerPanel = panel;
	}
	abstract content() : Promise<string>;
	abstract viewType() : string;
	abstract title() : string;

	public afterInitialization() : void {
		// By default, do nothing
	};
	public postMessage(json: any) : void {
		if (this.innerPanel) {
			this.innerPanel.webview.postMessage(json);
		}
	}
}

/**
 * Manages game preview webview panels
 */
export class Webview {
	private _panel: vscode.WebviewPanel | undefined;
	private _options : WebviewPanel;
	private _disposables: vscode.Disposable[] = [];
	private _console: vscode.OutputChannel;
	private _gameData : string = "";

	public setGameData(str : string) {
		this._gameData = str;
	}

	public viewType() : string {
		return this._options.viewType();
	}

	
	public createOrShow(extensionUri: vscode.Uri) {
        if (this._panel) {
			const column = vscode.window.activeTextEditor
				? vscode.window.activeTextEditor.viewColumn
				: undefined;

			this._panel.reveal(column);
		} else {
			this._panel = vscode.window.createWebviewPanel(
				this._options.viewType(),
				this._options.title(),
				vscode.ViewColumn.Beside,
				getWebviewOptions(extensionUri),
			);
			this._options.setInnerPanel(this._panel);
			// Set the webview's initial html content
			this._update();

			// Listen for when the panel is disposed
			// This happens when the user closes the panel or when the panel is closed programatically
			this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

			// Update the content based on view changes
			this._panel.onDidChangeViewState(
				e => {
					if (this._panel) {
						if (this._panel.visible) {
							this._update();
						}
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
						case 'consoleLog':
							this._console.appendLine(message.text);
							return;
						case 'clearConsole':
							this._console.clear();
						case 'afterInitialization':
							this._panel?.webview.postMessage({command: "gameData", text: this._gameData});
							this._options.afterInitialization();
							return;
						default: 
							console.log("message unused", message);
							return;
					}
				},
				null,
				this._disposables
			);
			}
	}

	public revive(extensionUri: vscode.Uri) {
		this._panel = vscode.window.createWebviewPanel(
			this._options.viewType(),
			this._options.title(),
			vscode.ViewColumn.Beside,
			getWebviewOptions(extensionUri),
		);
	}

	public constructor(options : WebviewPanel, gameConsole: vscode.OutputChannel) {
		this._options = options;
		this._console = gameConsole;
	}

	public dispose() {
		// Clean up our resources
		if (this._panel) {
			this._panel.dispose();
		}

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}

		this._panel = undefined;
		this._options.setInnerPanel(undefined);
	}

	private _update() {
		if (this._panel) {
			this._panel.title = this._options.title();
			this._options.content().then((s : string) => {
				if (this._panel) {
					this._panel.webview.html = s;
				}
			});
		}
	}
}