// author : Luke Gostling
import * as vscode from 'vscode';

// custom implementation of CompletionItemProvider which generated intellisence completion items for puzzlescript files.
export class PuzzleScriptCompletionItemProvider implements vscode.CompletionItemProvider {

    public async provideCompletionItems(
        document : vscode.TextDocument,
        position : vscode.Position,
        token : vscode.CancellationToken
    ): Promise<vscode.CompletionItem[]> {
        const items = await this.getVsCodeCompletionItems(document, position, token);
        return items;
    }

    // helper method to create and populate list of completion items
    private async getVsCodeCompletionItems(
        document : vscode.TextDocument,
        position : vscode.Position,
        token : vscode.CancellationToken
    ) : Promise<vscode.CompletionItem[]> {

        const completionList : vscode.CompletionItem[] = [];
        //populate completion item list with each type of completion item
        this.generateColorCodeCompletions(document, position, completionList);
        // TODO : add remaining completion items. 
        return completionList;
    }

    // populate completion item list with color completions if appropriate 
    private generateColorCodeCompletions(
        document : vscode.TextDocument,
        position : vscode.Position,
        completionList : vscode.CompletionItem[]
    ) {
        let previousLine = document.lineAt(position.line - 1).text;
        if(previousLine.indexOf('color') != -1) {
            let colors = ['Orange', 'Blue', 'Black', 'Green', 'Yellow'];
            for(var i in colors) {
                const completionItem = new vscode.CompletionItem(colors[i]);
                completionItem.kind = vscode.CompletionItemKind.Value;
                completionList.push(completionItem);
            }
        }
    }
}