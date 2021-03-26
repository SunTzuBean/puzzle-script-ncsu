var sourceCode = "title orthogonal rule test\n\n========\nOBJECTS\n========\n\nBackground .\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\nPlayer p\nPink\n\nDiamond \nBlue\n.....\n.....\n..0..\n.....\n.....\n\nCrate\nOrange\n00000\n0...0\n0...0\n0...0\n00000\n\n=======\nLEGEND\n=======\n=======\nSOUNDS\n=======\n================\nCOLLISIONLAYERS\n================\n\nBackground\nPlayer\nCrate\nDiamond\n\n======\nRULES\n======\n\n[ ] -> [ Diamond ]\n\n==============\nWINCONDITIONS\n==============\n=======\nLEVELS\n=======\n\n.....\n.....\n..p..\n.....\n.....";
sourceCode = `
title My Game
author My Name Here
homepage www.puzzlescript.net

========
OBJECTS
========

Background 
GREEN  

Target 
DarkBlue    

Wall 
BROWN

Player 
Blue   

Crate 
Orange 

=======
LEGEND
=======

. = Background
# = Wall
P = Player
* = Crate
@ = Crate and Target
O = Target

=======
SOUNDS
=======

================
COLLISIONLAYERS
================

Background
Target
Player, Wall, Crate

======
RULES     
======     

[ >  Player | Crate ] -> [  >  Player | > Crate  ]     

==============
WINCONDITIONS
==============

All Target on Crate     

=======     
LEVELS
=======

#########
#.......#
#.....@.#
#.P.*.O.#
#.......#
#.......#
#########

`
// var sourceCode = __GAMEDAT__;
compile(["loadLevel", 0], sourceCode);
levelEditorOpened = true;
regenSpriteImages();
generateGlyphImages();
canvasResize();
lastDownTarget = canvas;
// Need to regenerate the glyph images and re-resize the canvas
// to get things sized properly. No idea why. 
generateGlyphImages();
canvasResize();

// // Duplicating the bug fixes the code. One day, when I have time, I will revisit..
// compile(["loadLevel", 0], sourceCode);
// levelEditorOpened = true;
// regenSpriteImages();
// generateGlyphImages();
// canvasResize();
// lastDownTarget = canvas;	
