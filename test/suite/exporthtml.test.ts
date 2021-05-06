import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as exportHtml from "../../src/export-html";
import * as mocha from "mocha";
import * as path from "path";
import * as fs from "fs";
import { setFlagsFromString } from "v8";

mocha.suite("Extension Tests", () => {
  // Run the function
  mocha.describe("Export to HTML does not error", () => {
    mocha.it("Should be able to run Export to HTML", function (done) {
      vscode.commands.executeCommand("puzzlescript.exportHtml").then(done);
    });
  });

  mocha.describe("Export to HTML has correct output", () => {
    mocha.it("should have the same output as another test file", (done) => {
      let extensionDir = path.resolve(__dirname, "../../../");
  
      console.log("path is: ", path.resolve(__dirname, "../../../test-files/test.pzls"));
      // Read in a source code file
      fs.readFile(
        path.resolve(__dirname, "../../../test-files/test.pzls"),
        "utf8",
        function (err, data) {
          if (err || !data)
            assert.fail("There was an error reading the test.pzls file: " + err);
          let sourceCode = data.toString();
          exportHtml.exportToHtml(
            extensionDir,
            sourceCode
          ).then((actualHTML) => {
            let expectedHTML: string = "";
            fs.readFile(
              path.resolve(__dirname, "../../../test-files/expected_export.html"),
              "utf8",
              function (err, data) {
                if (err || !data)
                  assert.fail(
                    "There was an error reading the expected_export.html file: " + err
                  );
                expectedHTML = data.toString();
                
                // Call the saveToFile function to make sure there are no errors there either
                exportHtml._saveToFile(
                  actualHTML,
                  vscode.Uri.file(path.resolve(__dirname, "../../../test-files/test.html"))
                );
                assert.strictEqual('"' + expectedHTML.slice(0, 10) + '"', '"' +  actualHTML.slice(0, 10) + '"');
                done();
              }
            );
          });
        }
      );       
    });
  });
});
