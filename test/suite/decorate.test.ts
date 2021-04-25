import * as decorate from '../../src/decorate';
import * as mocha from 'mocha';
import * as assert from 'assert';
import { accessSync } from 'node:fs';
import { fail } from 'node:assert';

mocha.suite('Decorate Tests', () => {
    mocha.describe('findObjectsStart with no objects', () => {
        mocha.it("Returns -1", function (done) {
            assert.strictEqual(decorate.findObjectsStart(``), -1);
            done();
        });
    });

    mocha.describe('findObjectsStart with no objects', () => {
        mocha.it("Returns -1", function (done) {
            assert.strictEqual(decorate.findObjectsStart(``), -1);
            done();
        });
    });

    mocha.describe('findObjectsStart with objects', () => {
        mocha.it("Finds the correct line", function (done) {
            assert.strictEqual(decorate.findObjectsStart(`(-- line 0 --)
(-- line 1 --)
(-- line 2 --)
objects`), 3);
        done();
        });
    });

    mocha.describe('findObjectsEnds where exists', () => {
        mocha.it("Finds the correct line when followed by sections", function (done) {
            let code = `(-- line 0 --)
objects
            
myobject
blue
...
...
...

legend
. = myobject

collisionlayers
.
`;
            let objectsStart = decorate.findObjectsStart(code);
            assert.strictEqual(objectsStart, 1);
            assert.strictEqual(decorate.findObjectsEnds(code, objectsStart), 9);
            done();
        });

        mocha.it("Finds the correct line when not followed by sections", function (done) {
            let code = `(-- line 0 --)
objects
            
myobject
blue
...
...
...`;
            let objectsStart = decorate.findObjectsStart(code);
            assert.strictEqual(objectsStart, 1);
            assert.strictEqual(decorate.findObjectsEnds(code, objectsStart), 8);
            done();
        });

        mocha.it("Finds the correct line when not followed by sections and no object", function (done) {
            let code = `(-- line 0 --)
title MyTitle
author MyAuthor
homepage www.myHomePage.com`;
            let objectsStart = decorate.findObjectsStart(code);
            assert.strictEqual(objectsStart, -1);
            assert.strictEqual(decorate.findObjectsEnds(code, objectsStart), -1);
            done();
        });
    });

    mocha.describe("Decorator initialization", () => {
        mocha.it("Properly initializes the decorations", function (done) {
            assert.ok(decorate.initializeDecorations()["blue"]);
            done();
        });
    });

    mocha.describe("Grid processing", () => {
        mocha.it("Works with grids of just dots", (done) => {
            let code = `
objects

myObject

...
...
...`;
            decorate.processText(code, 
                {
                    beforeProcess: () => {},
                    processColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processLiteralColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processGrid: (_colors : string, _line : number, _col : number, _lines : string[]) => {
                        // Nothing to color, should never be called
                        assert.fail();
                    },
                    afterProcess: done,
                }
            );
        });

        mocha.it("Works with no text", (done) => {
            let code = ``;
            decorate.processText(code, 
                {
                    beforeProcess: () => {},
                    processColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processLiteralColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processGrid: (_colors : string | undefined, _line : number, _col : number, _lines : string[]) => {
                        // Nothing to color, should never be called
                        assert.fail();
                    },
                    afterProcess: done,
                }
            );
        });
        mocha.it("Works when it ends too soon", (done) => {
            let code = `
objects

MyObject`;
            decorate.processText(code, 
                {
                    beforeProcess: () => {},
                    processColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processLiteralColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processGrid: (_colors : string | undefined, _line : number, _col : number, _lines : string[]) => {
                        // Nothing to color, should never be called
                        assert.fail();
                    },
                    afterProcess: done,
                }
            );
        });
        mocha.it("Works with nonsense colors", (done) => {
            let code = `
objects

MyObject
elmo`;
            decorate.processText(code, 
                {
                    beforeProcess: () => {},
                    processColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processLiteralColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processGrid: (_colors : string | undefined, _line : number, _col : number, _lines : string[]) => {
                        // Nothing to color, should never be called
                        assert.fail();
                    },
                    afterProcess: done,
                }
            );
        });
        mocha.it("Works with comments", (done) => {
            let code = `
=======
objects
=======

myObject

...
...
...`;
            decorate.processText(code, 
                {
                    beforeProcess: () => {},
                    processColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processLiteralColor: (_colors: string, _line : number, _colStart : number, _colEnd : number) => {
                        // No colors, never called
                        assert.fail();
                    },
                    processGrid: (_colors : string | undefined, _line : number, _col : number, _lines : string[]) => {
                        // Nothing to color, should never be called
                        assert.fail();
                    },
                    afterProcess: done,
                }
            );
        });

        mocha.it("Works with commented, colored code", (done) => {
            let code = `
objects

myObject
red blue green #000111
.01234
.01234
.01234
.01234
.01234

(-- Comment --)

myOtherObject
red blue green #000111
.01234
.01234
.01234
.01234
.01234
`;
            decorate.processText(code, 
                {
                    beforeProcess: () => {},
                    processColor: (colors: string, _line : number, colStart : number, _colEnd : number) => {
                        switch (colStart) {
                            case "red blue green".indexOf("red"): {
                                assert.strictEqual(colors, "red");
                                break;
                            }
                            case "red blue green".indexOf("blue"): {
                                assert.strictEqual(colors, "blue");
                                break;
                            }
                            case "red blue green".indexOf("green"): {
                                assert.strictEqual(colors, "green");
                                break;
                            }
                            default: {
                                assert.fail();
                            }
                        }
                    },
                    processLiteralColor: (colors: string, line : number, colStart : number, colEnd : number) => {
                        assert.strictEqual(colors, "#000111");
                    },
                    processGrid: (colors : string | undefined, _line : number, col : number, _lines : string[]) => {
                        switch (col) {
                            case 1: {
                                assert.strictEqual(colors, "red");
                                break;
                            }
                            case 2: {
                                assert.strictEqual(colors, "blue");
                                break;
                            }
                            case 3: {
                                assert.strictEqual(colors, "green");
                                break;
                            }
                            case 4: {
                                assert.strictEqual(colors, "#000111");
                                break;
                            }
                            case 5: {
                                assert.strictEqual(colors, undefined);
                            }
                            default: assert.fail();
                        }
                    },
                    afterProcess: done,
                }
            );
        });
    });

});
