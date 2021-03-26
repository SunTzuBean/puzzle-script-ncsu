import * as vscode from 'vscode';
import * as path from 'path';
import * as facades from './facades';
import { Webview } from './facades/webview';
let fs = require("fs");

export function getGamePreviewPanel(extensionPath: string, gameConsole: vscode.OutputChannel) : facades.Webview {
    const sbpgPath = vscode.Uri.file(
        path.join(extensionPath, 'media', 'sbpg.html')
    );

    class GamePreviewPanel extends facades.WebviewPanel {
        public async content() : Promise<string> {
            return new Promise((resolve, reject) => {
                fs.readFile(sbpgPath.fsPath, "utf8", (err : string, data : string) => {
                    resolve(data);
                });
            });
        }
        public title() {
            return "Game Preview";
        }
        public viewType() {
            return "gamePreview";
        }
    }

    return new facades.Webview(new GamePreviewPanel(), gameConsole);
}
