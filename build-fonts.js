var fs = require('fs');
var drawing = require('./');
var png = drawing(require('pngjs').PNG);

var fonts = [
  ['./fonts/default', null ],
  ['./examples/custom-font/custom', { chars: " ABj", toUpper: false }]
];

for (var index in fonts) {
  var font = fonts[index];
  buildFont(font[0], font[1]);
}

function buildFont(path, options) {
  fs.createReadStream(path+".png")
    .pipe(new png({
        filterType: 4
    }))
    .on('parsed', function() {
      this.exportToFont(options, path+".js",function(err) {});

  });
}
