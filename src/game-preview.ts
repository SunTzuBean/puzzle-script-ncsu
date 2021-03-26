import * as vscode from 'vscode';
import * as path from 'path';
import * as facades from './facades';
import { Webview } from './facades/webview';
let fs = require("fs");

export function getGamePreviewPanel(extensionPath: string, gameConsole: vscode.OutputChannel) : facades.Webview {
    const standalonePath = vscode.Uri.file(
		path.join(extensionPath, 'media', 'standalone.html')
    );
    const loaddir = vscode.Uri.file(
        path.join(extensionPath, 'media')
    );

    class GamePreviewPanel extends facades.WebviewPanel {
        private textBeforeInit: string | undefined;
        public async content() : Promise<string> {
            return new Promise((resolve, reject) => {
                fs.readFile(standalonePath.fsPath, "utf8", (err : string, data : string) => {
                    if (data) {
                        const vscodeLoaddir = this.asWebviewUri(loaddir);

                        if (vscodeLoaddir === undefined) {
                            return reject(err);
                        }
                        return resolve(data.split("__LOADDIR__").join(vscodeLoaddir.toString()));
                    } else {
                        return reject(err);
                    }
                });
            });
        }
        public title() {
            return "Game Preview";
        }
        public viewType() {
            return "gamePreview";
        }

        /**
         * Runs after initialization, setting up the game data.
         */
        public afterInitialization() : void {
            this.postMessage({command: "gamePreview"});
        }
    }

    return new facades.Webview(new GamePreviewPanel(), gameConsole);
}
