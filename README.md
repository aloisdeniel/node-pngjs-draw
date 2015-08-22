# node-pngjs-draw

Adds basic drawing functionnalities to [pngjs](https://github.com/niegowski/node-pngjs) node module.

## Install

```sh
$ npm install --save pngjs-draw
```

## Example

```js
var fs = require('fs');
var drawing = require('pngjs-draw');
var png = drawing(require('pngjs').PNG);

fs.createReadStream("blue.png")
  .pipe(new png({ filterType: 4 }))
  .on('parsed', function() {
    // Draws a pixel with transparent green
    this.drawPixel(150,200, this.colors.black())

    // Draws a line with transparent red
    this.drawLine(0,0,200,200, this.colors.red(50))

    // Draws a rectangle with transparent black
    this.fillRect(150,150,75,20, this.colors.black(100))

    // Draws a filled rectangle with transparent white
    this.fillRect(50,50,100,100, this.colors.white(100))

    // Draws a text with custom color
    this.drawText(20,20, "Hello world !", this.colors.new(255,100,10))

    // Writes file
    this.pack().pipe(fs.createWriteStream('blue.out.png'));
  });
```

## Documentation

### PNG.prototype.drawPixel

Draws the pixel at the given coordinates with the given color.

* {`int`} `x` The x coordinate of the pixel
* {`int`} `y` The y coordinate of the pixel
* {`Array(byte)`} `color` The color used to paint the pixel

### PNG.prototype.drawLine

Draws a line beetween two points with the given color.

* {`int`} `x0` The x coordinate of the start
* {`int`} `y0` The y coordinate of the start
* {`int`} `x1` The x coordinate of the end
* {`int`} `y1` The y coordinate of the end
* {`Array(byte)`} `color` The color used to paint the line

### PNG.prototype.drawRect

Draws a stroked rectangle with the given color.

* {`int`} `x` The top left x coordinate of the rectangle
* {`int`} `y` The top left y coordinate of the rectangle
* {`int`} `width` The width of the rectangle
* {`int`} `height` The height of the rectangle
* {`Array(byte)`} `color` The color used to  paint strokes of the rectangle

### PNG.prototype.fillRect

Draws a filled rectangle with the given color.

* {`int`} `x` The top left x coordinate of the rectangle
* {`int`} `y` The top left y coordinate of the rectangle
* {`int`} `width` The width of the rectangle
* {`int`} `height` The height of the rectangle
* {`Array(byte)`} `color` The color used to fill the rectangle

### PNG.prototype.drawText

Draw a text to the image.

* {`int`} `x` The top left x coordinate of the string
* {`int`} `y` The top left y coordinate of the string
* {`string`} `text` The string value
* {`Array(byte)`} `color` The color used used as foreground
* {`Object`} `font` The font used to render the string (optional)
* {`Object`} `text` The string value

**return** {`int`} The length in pixel of the rendered string

### PNG.prototype.measureString

Measure the rendered text length with the given font.

* {`string`} `text` The string value
* {`Array(byte)`} `color` The color used used as foreground
* {`Object`} `font` The font used to render the string (optional)

**return** {`int`} The length in pixel of the rendered string

### Creating colors

`[<R>,<G>,<B>,<A>]`

A color is a javascript array containing Red/Green/Blue/Alpha byte components.

`PNG.prototype.colors.new = function(r,g,b,a)`

The new method generates an array with the provided components.

Default values :

* r: `0`
* g: `0`
* b: `0`
* a: `255`

```
PNG.prototype.colors.red = function(a)
PNG.prototype.colors.greed = function(a)
PNG.prototype.colors.blue = function(a)
PNG.prototype.colors.black = function(a)
PNG.prototype.colors.white = function(a)
```

Helper methods for creating base colors are also available.

### Custom fonts

In order to use a custom font, you must first generate a font module from an image presenting all the supported characters.

For more details, take a look at these files :
* `build-font.js`
* `fonts/*`
* `custom-font/*`

## Roadmap / Ideas

* More shapes (circles, polygons)
* Rotations
* Multi-lines texts

## Copyright and license

MIT © [Aloïs Deniel](http://aloisdeniel.github.io)
