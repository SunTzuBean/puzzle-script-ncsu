import * as vscode from "vscode";

const availableColors : string[] = [
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

let availableDecorators : Record<string, vscode.TextEditorDecorationType> = {};

for (const color of availableColors) {
	availableDecorators[color] = vscode.window.createTextEditorDecorationType({
		cursor: 'crosshair',
		backgroundColor: {id: 'puzzlescript.' + color},
		opacity: '0.25',
	});
}


const sections = ['objects', 'legend', 'sounds', 'collisionlayers', 'rules', 'winconditions', 'levels'];

export function decorateText(document : vscode.TextDocument, activeEditor : vscode.TextEditor): void {
	let doctext = document.getText();
	let objectsStart = -1;
	// Find line # of OBJECTS
	{
		let lowercaseLines = doctext.toLowerCase().split("\n");
		objectsStart = lowercaseLines.indexOf("objects");
	}
	if (objectsStart === -1) {
		return;
	}
	let objectsEnds = -1;
	// Find line # that objects ends
	{
		let lowercaseLines = doctext.toLowerCase().split("\n");
		let objectFree = sections.filter((x) => x !== "OBJECTS");
		let sectionLines = sections.map((sectionName) => lowercaseLines.indexOf(sectionName))
																	   .filter((line) => line > objectsStart);
		if (sectionLines.length > 0) {
			objectsEnds = sectionLines.reduceRight((x, y) => x < y ? x : y, Infinity);
		} else {
			if (objectsStart > -1) {
				objectsEnds = lowercaseLines.length;
			}
		}
	}

	const decorations: Record<string, Array<vscode.DecorationOptions>> = {};
	for (let color of availableColors) {
		decorations[color] = [];
	}

	// Find each bunch of objects
	{
		let lines = doctext.split("\n");
		for (var i = objectsStart + 1; i < objectsEnds; i++) {
			if (lines[i].length === 0) {
				continue;
			}
			if (lines[i].substr(0) === "=") {
				continue;
			}
			if (lines[i].match(/\$?[a-zA-Z_]+/)) {
				let colors = lines[i + 1].split(" ").map((s) => s.toLowerCase()).filter((s) => availableDecorators[s]);
				i += 2;
				while (i < lines.length && lines[i].match(/[.0-9]+/)) {
					for (let j = 0; j < lines[i].length; j++) {
						let referencedColor = colors[parseInt(lines[i].charAt(j))];
						if (lines[i].charAt(j) === '.') {
							// tokenDecorator = 'coloredGrey';
							// come back here
						}
						if (referencedColor) {
							decorations[referencedColor].push({range: new vscode.Range(new vscode.Position(i, j), new vscode.Position(i, j + 1))});
						}
					}
					i += 1;
				}
			}
		}
		for (const [colorname, decorator] of Object.entries(availableDecorators)) {
			activeEditor.setDecorations(decorator, decorations[colorname]);
		}
	}
}