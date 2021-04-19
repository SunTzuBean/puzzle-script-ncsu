import * as assert from "assert";
import * as vscode from "vscode";

export const availableColors : string[] = [
	"black",
	"white",
	"grey",
	"darkgrey",
	"lightgrey",
	"gray",
	"darkgray",
	"lightgray",
	"red",
	"darkred",
	"lightred",
	"brown",
	"darkbrown",
	"lightbrown",
	"orange",
	"yellow",
	"green",
	"darkgreen",
	"lightgreen",
	"blue",
	"lightblue",
	"darkblue",
	"purple",
	"pink"
  ];

const colorMap : Record<string, string> = {};
for (const color of availableColors) {
    colorMap[color] = color;
}

const sections = ['objects', 'legend', 'sounds', 'collisionlayers', 'rules', 'winconditions', 'levels'];

export function findObjectsStart(doctext : string) : number {
	let objectsStart = -1;
	// Find line # of OBJECTS
	let lowercaseLines = doctext.toLowerCase().split("\n");
	objectsStart = lowercaseLines.indexOf("objects");
    return objectsStart;
}

export function findObjectsEnds(doctext : string, objectsStart : number) : number {
	let objectsEnds = -1;
	// Find line # that objects ends
	
	let lowercaseLines = doctext.toLowerCase().split("\n");
	let objectFree = sections.filter((x) => x !== "objects");
	let sectionLines = objectFree.map((sectionName) => lowercaseLines.indexOf(sectionName))
	        													     .filter((line) => line > objectsStart);
	if (sectionLines.length > 0) {
		objectsEnds = sectionLines.reduceRight((x, y) => x < y ? x : y, Infinity);
	} else {
		if (objectsStart > -1) {
			objectsEnds = lowercaseLines.length;
		}
	}
	return objectsEnds;
}

export function initializeDecorations() : Record<string, Array<vscode.DecorationOptions>> {
	const decorations: Record<string, Array<vscode.DecorationOptions>> = {};
	for (let color of availableColors) {
		decorations[color] = [];
	}
    return decorations;
}

export abstract class GridProcessor {
    abstract beforeProcess() : void;
	abstract processColor(color : string, line : number, colStart : number, colEnd : number) : void;
    abstract processGrid(colors : string, line : number, col : number, lines : string[]) : void;
    abstract afterProcess() : void;
}

export function processText(doctext : string, grid : GridProcessor){
    const objectsStart = findObjectsStart(doctext);
	if (objectsStart === -1) {
		grid.afterProcess();
		return;
	}
    const objectsEnds = findObjectsEnds(doctext, objectsStart);
    grid.beforeProcess();
	{
		let lines = doctext.split("\n");
		for (var i = objectsStart + 1; i < objectsEnds; i++) {
			if (lines[i].length === 0) {
				continue;
			}
			if (lines[i].charAt(0) === "=") {
				continue;
			}
			if (lines[i].match(/^\$?[a-zA-Z_]+$/)) {
				if (i + 1 >= lines.length) {
					continue;
				}
				let colors = [];
				const wordRe = /\w+/g;
				colorProcess:
				while (true) {
					let match = wordRe.exec(lines[i + 1]);
					if (match) {
						assert.strictEqual(match.length, 1);
						assert.notStrictEqual(match[0], "");
						let color = match[0].toLowerCase();
						if (colorMap[color]) {
							grid.processColor(color, i + 1, match.index, match.index + match[0].length);
							colors.push(color);
						}
					} else {
						break colorProcess;
					}
				}
				i += 2;
				while (i < lines.length && lines[i].match(/[.0-9]+/)) {
					for (let j = 0; j < lines[i].length; j++) {
						let referencedColor = colors[parseInt(lines[i].charAt(j))];
						if (referencedColor) {
                            grid.processGrid(referencedColor, i, j, lines);
						}
					}
					i += 1;
				}
			}
		}
        grid.afterProcess();
	}
}

