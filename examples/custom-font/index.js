var fs = require('fs');
var drawing = require('../../');
var png = drawing(require('pngjs').PNG);
var customFont = require('./custom.js')

var file = "blue";

fs.createReadStream(file+".png")
  .pipe(new png({ filterType: 4 }))
  .on('parsed', function() {

      // Draws a string with custom font
      this.drawText(20,20, "AABB  BB jBAA BAj", this.colors.black(100), customFont)

      // Writes file
      this.pack().pipe(fs.createWriteStream(file+'.out.line.png'));
  });
