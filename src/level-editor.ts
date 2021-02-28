import * as vscode from 'vscode';
import * as path from 'path';
import * as facades from './facades';
import { Webview } from './facades/webview';
let fs = require("fs");

export function getLevelEditor(extensionPath: string) : facades.Webview {
    const levelEditorPath = vscode.Uri.file(
		path.join(extensionPath, 'media', 'lvled.html')
    );

    class LevelEditorPanel extends facades.WebviewPanel {
        public async content() : Promise<string> {
            return new Promise((resolve, reject) => {
                fs.readFile(levelEditorPath.fsPath, "utf8", (err : string, data : string) => {
                    resolve(data);
                });
            });
        }
        public title() {
            return "Level Editor";
        }
        public viewType() {
            return "levelEditor";
        }
    }

    return new facades.Webview(new LevelEditorPanel());
}
