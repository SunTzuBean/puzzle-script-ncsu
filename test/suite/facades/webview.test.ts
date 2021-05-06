import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import * as gamePreview from "../../../src/game-preview";
import * as webview from "../../../src/facades/webview";
import * as mocha from 'mocha';

class MockOutputChannel implements vscode.OutputChannel {
	public appendLine(line : string) : void {
		return;
	}
	public name : string = "mock";
	public append(line : string) : void {
		return;
	}
	public clear() : void {
		return;
	}
	public show() : void {
		return;
	}
	public hide() : void {
		return;
	}
	public dispose() : void {
		return;
	}
}

suite('Webview Tests', () => {
	let gameConsole = new MockOutputChannel(); 

	mocha.describe("When Panel is Null", () => {
		class MockPanel extends webview.WebviewPanel {
			public content() : Promise<string> {
				return new Promise((resolve, _reject) => {
					setTimeout(() => {return resolve("content");}, 100);
				});
			}
			public title() : string {
				return "Mock";
			}
			public viewType() : string {
				return "mock";
			}
		}
		let wv = new webview.Webview(new MockPanel(), gameConsole);

		mocha.it("Should be able to update without crashing", (done) => {
			(wv as any)._update();
			setTimeout(() => {
				done();
			}, 200);
		});

		mocha.it("Should be able to call postmessage without crashing", (done) => {
			(wv as any)._options.postMessage({command: "fake", text: "never sent"});
			done();
		});

		mocha.it("Should be disposable", (done) => {
			wv.dispose();
			done();
		});
	});

	mocha.describe("When HTML Sends Init Message", () => {
		class MockPanel extends webview.WebviewPanel {
			public afterInitFn : (() => void) | undefined = undefined;
			public content() : Promise<string> {
				return new Promise((resolve, reject) => {
					resolve(`
					<html>
					<body>
					  <script>
					    const vscode = acquireVsCodeApi();
						vscode.postMessage({command: "afterInitialization"});
					  </script>
					</body>
					</html>
					`);
				});
			}
			public title() : string {
				return "Mock2";
			}
			public viewType() : string {
				return "mock2";
			}
			public afterInitialization() {
				super.afterInitialization();
				this.postMessage({command: "fake", text: "never sent"});
				if (this.afterInitFn) {
					this.afterInitFn();
				}
			}
		}
		let mp = new MockPanel();
		let wv = new webview.Webview(mp, gameConsole);

		mocha.it('Should Call After Init Hook', (done) => {
			mp.afterInitFn = done;
			wv.createOrShow(vscode.Uri.file('.'));
		});
	});

	mocha.describe("When HTML Sends Console Log Message", () => {
		class MockPanel extends webview.WebviewPanel {
			public content() : Promise<string> {
				return new Promise((resolve, reject) => {
					resolve(`
					<html>
					<body>
					  <script>
					    const vscode = acquireVsCodeApi();
						vscode.postMessage({command: "consoleLog", text: "it works!"});
					  </script>
					</body>
					</html>
					`);
				});
			}
			public title() : string {
				return "Mock2";
			}
			public viewType() : string {
				return "mock2";
			}
		}
		class NotifyingOutputChannel implements vscode.OutputChannel {
			public notifyFn : (() => void) | undefined = undefined;
 			public name : string = "notifying";
			private notify() {
				if (this.notifyFn) {
					this.notifyFn();
				}
			}
			public append(_text : string) {
				this.notify();
			}
			public appendLine(_text: string) {
				this.notify();
			}
			public clear() {

			}
			public show() {

			}
			public hide() {

			}
			public dispose() {
				
			}
		}
		let mp = new MockPanel();
                let noc = new NotifyingOutputChannel();
		let wv = new webview.Webview(mp, noc);

		mocha.it('Should Call After Init Hook', (done) => {
			//mp.afterInitFn = done;
                        noc.notifyFn = done;
			wv.createOrShow(vscode.Uri.file('.'));
		});
	});
});
 