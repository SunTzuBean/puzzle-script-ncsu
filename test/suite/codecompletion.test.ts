import * as assert from 'assert';
import * as vsc from 'vscode';
import { PuzzleScriptCompletionItemProvider } from "../../src/completionProvider"; 
// from '../../src/completionProvider';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

suite('Extension Tests', () => {
    test('Suggest Header', () => {
        let completionprovider = new PuzzleScriptCompletionItemProvider();
        console.log("1234");
        vsc.workspace.openTextDocument({ language: 'puzzlescript' }).then((doc) => {
            let position = new vsc.Position(1, 1);
            let source = new vsc.CancellationTokenSource();
            let token = source.token;
            completionprovider.provideCompletionItems(doc, position, token).then((completionItems) => {
                assert.strictEqual(1, completionItems.length);
                console.log("Code Completion Tests");
            });
        })
    });
});