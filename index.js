var fs = require('fs');
var defaultFont = require('./fonts/default.js')

module.exports = function(PNG) {

  /*
   * Measure the rendered text length with the given font.
   *
   * @param {string} s The string value
   * @param {Object} font The font used to render the string
   * @return {int} The number of pixels
   */
  PNG.prototype.measureText = function (text,font) {

    if(!font)
      font = defaultFont;

    var total = 0;

    for (var i = 0; i < text.length; i++) {
      if(i > 0) total+= font.spaceBetweenChars;
      var char = font.getChar(text[i]);
      total+= char.width;
    }

    return total;
  }

  /*
   * Draw a text to the image.
   *
   * @param {int} x The top left x coordinate of the rendered string
   * @param {int} y The top left y coordinate of the rendered string
   * @param {string} text The string value
   * @param {Array(byte)} color The color used as foreground
   * @param {Object} font The font used to render the string (default: defaultFont)
   * @return {int} The length of the rendered string
   */
  PNG.prototype.drawText = function (x,y,text,color,font) {

    if(!font)
      font = defaultFont;

    for (var i = 0; i < text.length; i++) {

      if(i > 0) x+= font.spaceBetweenChars;
      var c = text[i];
      var char = font.getChar(c);

      for (var p = 0; p < char.pixels.length; p++) {
        var pixel = char.pixels[p];
        this.drawPixel(x+pixel[0], y+pixel[1],color);
      }

      x+= char.width;
    }

    return x;
  }

  /*
   * Exports an image with all characters of the font as a javascript module file.
   *
   * @param {Object} options The options used to load the font.
   * @param {string} outFile The path to the output javascript file.
   * @param {function(err)} callback The callback of the export operation.
   */
  PNG.prototype.exportToFont = function (options, outFile, callback) {
    var font = loadFont(this,options);
    fs.writeFile(outFile, "module.exports = " + JSON.stringify(font) + "; module.exports.getChar = function(c) { if(module.exports.toUpper) c = c.toUpperCase(); var char = module.exports.chars[c]; if(!char) char = module.exports.chars['?']; return char;}", callback);
  }

  /*
   * Draws a filled rectangle with the given color.
   *
   * @param {int} x0 The top left x coordinate of the rectangle
   * @param {int} y0 The top left y coordinate of the rectangle
   * @param {int} width The width of the rectangle
   * @param {int} height The height of the rectangle
   * @param {Array(byte)} color The color used to fill the rectangle
   */
  PNG.prototype.fillRect = function(x, y ,width, height, color) {

    var startY = Math.max(0,Math.min(this.height, y));
    var startX = Math.max(0,Math.min(this.width, x));
    var endY = Math.min(this.height, y + height);
    var endX = Math.min(this.width, x + width);

    for (var y = startY; y < endY; y++) {
      for (var x = startX; x < endX; x++) {
            this.drawPixel(x,y,color);
      }
    }
  }

  /*
   * Draws a stroked rectangle with the given color.
   *
   * @param {int} x0 The top left x coordinate of the rectangle
   * @param {int} y0 The top left y coordinate of the rectangle
   * @param {int} width The width of the rectangle
   * @param {int} height The height of the rectangle
   * @param {Array(byte)} color The color used to paint strokes of the rectangle
   */
  PNG.prototype.drawRect = function(x, y ,width, height, color) {
    var topLeft = {x: x, y: y};
    var topRight = {x: x+width-1, y: y};
    var bottomRight = {x: topRight.x, y: y+height-1};
    var bottomLeft = {x: x, y: bottomRight.y};

    this.drawLine(topLeft.x,topLeft.y,topRight.x,topRight.y,color);
    this.drawLine(topRight.x,topRight.y,bottomRight.x,bottomRight.y,color);
    this.drawLine(bottomRight.x,bottomRight.y,bottomLeft.x,bottomLeft.y,color);
    this.drawLine(bottomLeft.x,bottomLeft.y,topLeft.x,topLeft.y,color);
  }

  /*
   * Draws the pixel at the given coordinates with the given color.
   *
   * @param {int} x The x coordinate of the pixel
   * @param {int} y The y coordinate of the pixel
   * @param {Array(byte)} color The color used to paint the pixel
   */
  PNG.prototype.drawPixel = function(x, y, color) {

    if(x < 0 || y <0 || x > this.width || y > this.height)
      return;

    var background = readPixel(this,x,y);

    // Blending with color
    var blended = blend(background, color);

    // Updating data
    var idx = (this.width * y + x) << 2;
    this.data[idx] = blended[0];
    this.data[idx+1] = blended[1];
    this.data[idx+2] = blended[2];
    this.data[idx+3] = blended[3];

  }

  /*
   * Draws a line beetween two points with the given color.
   *
   * @param {int} x0 The x coordinate of the start
   * @param {int} y0 The y coordinate of the start
   * @param {int} x1 The x coordinate of the end
   * @param {int} y1 The y coordinate of the end
   * @param {Array(byte)} color The color used to paint the line
   */
  PNG.prototype.drawLine = function(x0, y0 ,x1, y1, color) {

    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;

    while(true){

      this.drawPixel(x0,y0,color);

      if ((x0==x1) && (y0==y1)) break;
      var e2 = 2*err;
      if (e2 >-dy){ err -= dy; x0  += sx; }
      if (e2 < dx){ err += dx; y0  += sy; }
    }
  }

 /*
  * A set of helper function to generate common colors.
  */
  PNG.prototype.colors = {
    new: color,
    red:   function(a) { return color(255,0,0,a); },
    green: function(a) { return color(0,255,0,a); },
    blue:  function(a) { return color(0,0,255,a); },
    black:  function(a) { return color(0,0,0,a); },
    white:  function(a) { return color(255,255,255,a); }
  };

  return PNG;
}

/*
 * Creates a color array from RGBA components.
 *
 * @param {byte} r The red component (default : 0)
 * @param {byte} g The green component (default : 0)
 * @param {byte} b The blue component (default : 0)
 * @param {byte} a The alpha component (default : 255)
 */
function color(r,g,b,a)
{
  return [r ? r : 0, g ? g : 0, b ? b : 0, a ? a : 255];
}

/*
* Calculates the blended color from an opaque background, and a foreground transparent color.
*
* @param {Array(byte)} background The original background color
* @param {Array(byte)} color The color to blend with the original one
* @return {Array(byte)} The blended color
*/
function blend(background, color) {
  var srcAlpha = color[3] / 255.0;

  return [
    Math.round(color[0] * srcAlpha + background[0] * (1 - srcAlpha)),
    Math.round(color[1] * srcAlpha + background[1] * (1 - srcAlpha)),
    Math.round(color[2] * srcAlpha + background[2] * (1 - srcAlpha)),
    background[3]
  ];
}

/*
* Indicates whether two color arrays are equals.
*
* @param {Array(byte)} c1 The first color
* @param {Array(byte)} c2 The other color
* @return {bool} True if each component of the colors are equals.
*/
function equalsColors(c1,c2){
  for (var i = 0; i < 4; i++) {
    if(c1[i] !== c2[i])
      return false;
  }
  return true;
}

/*
 * Loads a font from an image with all characters.
 *
 * @param {Object} png The png image object.
 * @param {Object} options The options used to load the font (fontColor: foreground color of characters, toUpper: only contains upper case characters, chars: a string containing all the draw characters in the right order, delimiters: array of bottom delimiters color)
 * @return {Object} The font object containing all the loading characters and properties.
 */
function loadFont(png, options) {

  if(!options)
    options = {};

  if(typeof options.fontColor == 'undefined')
    options.fontColor = [0,0,0,255];

  if(typeof options.toUpper == 'undefined')
    options.toUpper = true;

  if(typeof options.chars == 'undefined')
    options.chars = " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.!?_-";

  if(typeof options.delimiters  == 'undefined')
    options.delimiters = [ [255,0,0,255], [0,255,0,255] ];

  var font = {
    toUpper: options.toUpper,
    height: png.height - 1,
    spaceBetweenChars: getCharWidth(png,0, options.delimiters[0]),
    chars: {}
  };

  var x = font.spaceBetweenChars;
  for (var i = 0; i < options.chars.length; i++) {
    var key = options.chars[i].toString();
    var delimiter = options.delimiters[(i+1)%options.delimiters.length];
    var char = loadFontChar(png, x, options.fontColor, delimiter);
    font.chars[key] = char;

    console.log("{Font} Loaded \'"+key+"\' char from position (x:"+x+") with delimiter color ("+JSON.stringify(delimiter)+") -> width:"+char.width+", pixels:" + char.pixels.length);

    x+=char.width;
  }

  console.log("{Font} Successfuly loaded ("+options.chars.length+" chars)");

  return font;
}

/*
* Loads a character from an font image with all characters.
*
* @param {Object} png The png image object.
* @param {Array(byte)} fontColor The foreground color used to draw characters.
* @param {Array(byte)} delimiter The bottom delimiter color that indicates character width.
* @return {object} The loaded character containing its width and its pixels.
*/
function loadFontChar(png,x, fontColor, delimiter) {
  var width = getCharWidth(png,x,delimiter);

  var startX = x;
  var startY = 0;
  var endX = startX + width;
  var endY = png.height - 1;

  // Load pixels
  var pixels = [];
  for (var y = startY; y < endY; y++) {
    for (var x = startX; x < endX; x++) {
      var pixelColor = readPixel(png,x,y)
      if(pixelColor != null && equalsColors(pixelColor,fontColor))
        pixels.push([x- startX, y]);
    }
  }
  return {
    width: width,
    pixels : pixels
  };
}

/*
 * Calculates the character in a font image from the bottom delimiter width.
 *
 * @param {Object} png The png image object.
 * @param {int} x The starting position of the character in the font image.
 * @return {int} The width of the character in pixels.
 */
function getCharWidth(png, x, delimiter) {
  var bottomY = png.height - 1;
  var width = 0;
  // Getting char width from bottom colored line (with delimiter color)
  for(var bottomColor = readPixel(png, x,bottomY); equalsColors(bottomColor,delimiter); bottomColor = readPixel(png,x,bottomY))
  {
    width++;
    x++;
  }

    return width;
}

/*
 * Gets the color of the pixel at the given coordinates.
 *
 * @param {int} x The x coordinate of the pixel
 * @param {int} y The y coordinate of the pixel
 * @return {Array(byte)} The color of the pixel, or null if coordinates are not in image bounds.
 */
function readPixel(png, x, y) {
  if(x < 0 || y <0 || x > png.width || y > png.height)
    return null;

  var idx = (png.width * y + x) << 2;
  var background = [png.data[idx], png.data[idx+1], png.data[idx+2], png.data[idx+3]];
  return background;
}
