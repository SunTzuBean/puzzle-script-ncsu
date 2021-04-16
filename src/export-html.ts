//      AUTHOR: Andrew Bassett (apbasset)
// DESCRIPTION: Export to HTML feature

import * as vscode from "vscode";
import * as path from "path";
import { window, workspace } from "vscode";
import { fstat } from "fs";
import { TextEncoder, TextDecoder } from "util";
import { NONAME } from "dns";

export async function exportToHtml(extensionPath: string) {
  var editor = window.activeTextEditor;
  if (!editor) {
    return; // No open editor
  }

  // Get the uri of the active document
  let activeUri = editor.document.uri;

  // Get the intended export path/filename from the user
  var savedir: vscode.Uri = vscode.Uri.file(
    path.join(path.dirname(activeUri.path), await _askForPath())
  );

  // Get the source code as a string
  var sourceCode = editor.document.getText();

  // Stringify the source code
  sourceCode = JSON.stringify(sourceCode);

  // Get the directory to load the HTML file template from
  const htmlTemplateUri: vscode.Uri = vscode.Uri.file(
    path.join(extensionPath, "media/standalone_inlined.html")
  );

  var htmlString = new TextDecoder("utf-8").decode(
    await workspace.fs.readFile(htmlTemplateUri)
  );

  // Parse out the title and homepage
  var title = "My Game";
  var homepage = "puzzlescript.net";
  var matches = /title (.*?)\\r\\n/g.exec(sourceCode);
  if (matches) {
    title = matches[1];
  }
  matches = /homepage (.*?)\\r\\n/g.exec(sourceCode);
  if (matches) {
    homepage = matches[1];
  }

  sourceCode = sourceCode.split("\\r").join("");

  // Replace the vars in the HTML
  htmlString = htmlString.split("__GAMETITLE__").join(title);
  htmlString = htmlString.split("__HOMEPAGE__").join(homepage);
  htmlString = htmlString.split("__GAMEDAT__").join(sourceCode);

  // Save the file
  _saveToFile(htmlString, savedir);
}

async function _askForPath() {
  // Get a file path via VSCode InputBox; default to 'game.html' in the root dir
  const filepath: string =
    (await window.showInputBox({
      placeHolder: "game.html",
      prompt: "Specify the path + filename to export the game to",
    })) || "game.html";
  return filepath;
}

async function _saveToFile(content: string, path: vscode.Uri) {
  workspace.fs.writeFile(path, new TextEncoder().encode(content));
}
