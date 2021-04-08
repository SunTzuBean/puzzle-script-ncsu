// author : Luke Gostling
import * as vscode from 'vscode';

// custom implementation of CompletionItemProvider which generated intellisence completion items for puzzlescript files.
export class PuzzleScriptCompletionItemProvider implements vscode.CompletionItemProvider {

    colors : string[];
    sections : string[];
    headerKeywords : string[];

    constructor() {
        this.colors = ['BLACK', 'WHITE', 'LIGHTGRAY', 'GREYGRAY', 'GREY', 'DARKGRAY', 'GREY', 'RED', 'DARKRED', 'LIGHTRED','BROWN', 'DARKBROWN', 'LIGHTBROWN', 'ORANGE', 'YELLOW', 'GREEN', 'DARKGREEN', 'LIGHTGREEN', 'BLUE', 'LIGHTBLUE', 'DARKBLUE', 'PURPLE', 'PINK', 'TRANSPARENT'];
        this.sections = ['OBJECTS', 'LEGEND', 'SOUNDS', 'COLLISIONLAYERS', 'RULES', 'WINCONDITIONS', 'LEVELS'];
        this.headerKeywords = ['author', 'again_interval', 'background_color', 'color_palette', 'debug', 'flickscreen', 'homepage', 'key_repeat_interval', 'noaction', 'norepeat_action', 'noundo', 'norestart', 'realtime_interval', 'require_player_movement', 'run_rules_on_level_start', 'scanline', 'text_color', 'title', 'throttle_movement', 'verbose_logging', 'zoomscreen'];
    }

    public async provideCompletionItems(
        document : vscode.TextDocument,
        position : vscode.Position,
        token : vscode.CancellationToken
    ): Promise<vscode.CompletionItem[]> {
        console.log(typeof document);
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
        let section = this.determineSection(document, position, completionList);
        //populate completion item list with each type of completion item
        this.generateHeaderKeyworkItems(document, position, section, completionList);
        this.generateObjectCompletionItems(document, position, section, completionList);
        this.generateColorCodeCompletions(document, position, section, completionList); 
        return completionList;
    }

    private generateHeaderKeyworkItems(
        document : vscode.TextDocument,
        position : vscode.Position,
        section : string,
        completionList : vscode.CompletionItem[]
    ) {
        if(section != "HEADER") {
            return;
        }
        if(document.lineAt(position.line).text.indexOf(' ') == -1) {
            for(let keyword of this.headerKeywords) {
                const completionItem = new vscode.CompletionItem(keyword);
                completionItem.kind = vscode.CompletionItemKind.Text;
                completionList.push(completionItem);
            }
        }
        if(document.lineAt(position.line).text.indexOf('background_color') != -1 || document.lineAt(position.line).text.indexOf('text_color') != -1){
            for(var i in this.colors) {
                const completionItem = new vscode.CompletionItem(this.colors[i]);
                completionItem.kind = vscode.CompletionItemKind.Value;
                completionList.push(completionItem);
            }
        }        
    }

    private generateObjectCompletionItems(
        document : vscode.TextDocument,
        position : vscode.Position,
        section : string,
        completionList : vscode.CompletionItem[]
    ) {
        if(section == 'HEADER' || section == 'OBJECTS') {
            return;
        }
        let text = document.getText();
        let start = text.indexOf('OBJECTS');
        let end = text.indexOf('LEGEND');
        text = text.substring(start, end);
        let w = text.match('[a-zA-Z][a-zA-Z_0-9]*');
        while(w) {
            let word = w.toString();
            text = text.substring(text.indexOf(word) + word.length);
            if(this.colors.indexOf(word.toUpperCase()) == -1 && this.sections.indexOf(word.toUpperCase()) == -1) {
                const completionItem = new vscode.CompletionItem(word);
                completionItem.kind = vscode.CompletionItemKind.Text;
                completionList.push(completionItem);
            }
            w = text.match('[a-zA-Z][a-zA-Z_0-9]*');
        }
    }

    // populate completion item list with color completions if appropriate 
    private generateColorCodeCompletions(
        document : vscode.TextDocument,
        position : vscode.Position,
        section : string,
        completionList : vscode.CompletionItem[]
    ) {
        if(section != 'OBJECTS' && section != "HEADER") {
           return;
        }
        if (position.line > 0) {
            let previousLine = document.lineAt(position.line - 1).text;
            let regex = new RegExp('^[a-zA-Z][a-zA-Z_0-9]*$');
            let test = regex.test(previousLine);
            if(test) {
                for(var i in this.colors) {
                    const completionItem = new vscode.CompletionItem(this.colors[i]);
                    completionItem.kind = vscode.CompletionItemKind.Value;
                    completionList.push(completionItem);
                }
            }
        }
        const completionItem = new vscode.CompletionItem(section);
        completionItem.kind = vscode.CompletionItemKind.Value;
        completionList.push(completionItem);
    }

    private determineSection(
        document : vscode.TextDocument,
        position : vscode.Position,
        completionList : vscode.CompletionItem[]
    ) {
        let currentLine = position.line - 1;
        let currentHeader = -1;
        while(currentLine > 0 && currentHeader == -1) {
            let lineText = document.lineAt(currentLine).text;
            for(let i = 0; i < this.sections.length; i++) {
                if(lineText.indexOf(this.sections[i]) != -1) {
                    currentHeader = i;
                    break;
                }
            }
            currentLine--;
        }
        if(currentHeader < this.sections.length - 1) {
            let suggestedHeader = this.sections[currentHeader + 1];
            const completionItem = new vscode.CompletionItem(suggestedHeader);
            completionItem.kind = vscode.CompletionItemKind.Value;
            completionList.push(completionItem);
        }
        if(currentHeader != -1) {
            return this.sections[currentHeader];
        }
        return "HEADER";
    }
}