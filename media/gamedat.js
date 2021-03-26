var sourceCode = `
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
// compile(["loadLevel", 0], sourceCode);
// levelEditorOpened = true;
// regenSpriteImages();
// generateGlyphImages();
// canvasResize();
// lastDownTarget = canvas;
// // Need to regenerate the glyph images and re-resize the canvas
// // to get things sized properly. No idea why. 
// generateGlyphImages();
// canvasResize();

// // Duplicating the bug fixes the code. One day, when I have time, I will revisit..
// compile(["loadLevel", 0], sourceCode);
// levelEditorOpened = true;
// regenSpriteImages();
// generateGlyphImages();
// canvasResize();
// lastDownTarget = canvas;	
