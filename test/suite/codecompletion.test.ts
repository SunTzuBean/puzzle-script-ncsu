import * as assert from 'assert';
import * as vsc from 'vscode';
import { PuzzleScriptCompletionItemProvider } from "../../src/completionProvider";
import * as path from 'path'; 
// from '../../src/completionProvider';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

suite('Extension Tests', () => {
    let completionprovider = new PuzzleScriptCompletionItemProvider();
    
    test('Suggest Headers', () => {
        let dir = path.resolve("../../workspace/puzzlescript/test-files/codeCompletion/empty.pzls");
        vsc.workspace.openTextDocument(dir).then((doc) => {
            let position = new vsc.Position(1, 0);
            let source = new vsc.CancellationTokenSource();
            let token = source.token;
            completionprovider.provideCompletionItems(doc, position, token).then((completionItems) => {
                assert.strictEqual(completionprovider.headerKeywords.length + 1, completionItems.length);
            });
        })
    });

    test("Suggest Colors", () => {
        let dir = path.resolve("../../workspace/puzzlescript/test-files/ez.pzls");
        vsc.workspace.openTextDocument(dir).then((doc) =>{
            let position = new vsc.Position(10,0);
            let source = new vsc.CancellationTokenSource();
            let token = source.token;
            completionprovider.provideCompletionItems(doc, position, token).then((completionItems) => {
                assert.strictEqual(completionprovider.colors.length, completionItems.length);
            });
        })
    })
});