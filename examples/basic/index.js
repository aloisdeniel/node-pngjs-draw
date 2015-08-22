var fs = require('fs');
var drawing = require('../../');
var png = drawing(require('pngjs').PNG);

fs.createReadStream("blue.png")
  .pipe(new png({ filterType: 4 }))
  .on('parsed', function() {

    // Draws a pixel with transparent green
    this.drawPixel(150,200, this.colors.black())

    // Draws a line with transparent red
    this.drawLine(0,0,200,200, this.colors.red(50))

    // Draws a rectangle with transparent black
    this.drawRect(150,150,75,20, this.colors.black(100))

    // Draws a filled rectangle with transparent white
    this.fillRect(50,50,100,100, this.colors.white(100))

    // Draws a text with custom color
    this.drawText(20,20, "Hello world !", this.colors.new(255,100,10))

    // Writes file
    this.pack().pipe(fs.createWriteStream('blue.out.png'));
  });
