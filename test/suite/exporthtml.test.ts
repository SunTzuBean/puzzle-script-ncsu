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

  mocha.test("Export to HTML has correct output", async () => {
    let extensionDir = path.resolve(__dirname, "../../../");
    var sourceCode: string = "";

    // Read in a source code file
    fs.readFile(
      path.resolve(__dirname, "../../../test-files/test.pzls"),
      function (err, data) {
        if (err)
          assert.fail("There was an error reading the test.pzls file: " + err);
        sourceCode = data.toString();
      }
    );

    // Get the HTML string to export
    var actualHtml: string = await exportHtml.exportToHtml(
      extensionDir,
      sourceCode
    );

    // Read in what should be the expected HTML string
    var expectedHtml: string = "";
    fs.readFile(
      path.resolve(__dirname, "../../../test-files/expected_export.html"),
      function (err, data) {
        if (err)
          assert.fail(
            "There was an error reading the expected_export.html file: " + err
          );
        expectedHtml = data.toString();
      }
    );

    // Call the saveToFile function to make sure there are no errors there either
    exportHtml._saveToFile(
      actualHtml,
      vscode.Uri.file(path.resolve(__dirname, "../../../test-files/test.html"))
    );

    // Assert that the exported HTML is accurate
    assert.strictEqual(
      JSON.stringify(expectedHtml),
      JSON.stringify(actualHtml)
    );
  });
});
