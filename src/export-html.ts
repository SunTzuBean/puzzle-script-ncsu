//      AUTHOR: Andrew Bassett (apbasset)
// DESCRIPTION: Export to HTML feature

import { window } from 'vscode';

export async function exportToHtml() {
    var path:string = await _askForPath();
}

export async function getRawHtml() {
    // TODO
    return
}

async function _askForPath() {
    // Get a file path via VSCode InputBox; default to 'game.html' in the root dir
    const filepath:string = await window.showInputBox({
        placeHolder: 'game.html',
        prompt: 'Specify the path + filename to export the game to'
    }) || 'game.html';
    return filepath
}