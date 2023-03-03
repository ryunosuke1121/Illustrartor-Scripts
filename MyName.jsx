// Check if a document is already open
if (documents.length > 0) {
  var doc = activeDocument;
} else {
  // Create a new document
  var doc = app.documents.add();
}

var MyName = "MP";

// get the artboard's position
var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
var artboardLeft = artboard.artboardRect[0];
var artboardTop = artboard.artboardRect[1];

// Create a new text frame
var textFrame = doc.textFrames.add();
textFrame.contents = MyName;

// Set the font of the text frame
var fontName = "Muli";
var fontStyle = "SemiBoldItalic";
var font = app.textFonts.getByName(fontName + "-" + fontStyle);
textFrame.textRange.characterAttributes.textFont = font;
textFrame.textRange.characterAttributes.size = 11.2234;

// Set the color of the text frame
var textColor = new RGBColor();
textColor.red = 124;
textColor.green = 129;
textColor.blue = 128;
textFrame.textRange.characterAttributes.fillColor = textColor;

// Get the active artboard
var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];

// Set the position of the text frame relative to the dimensions of the artboard

textFrame.left = artboardLeft + 754;
textFrame.top = artboardTop - 530;

