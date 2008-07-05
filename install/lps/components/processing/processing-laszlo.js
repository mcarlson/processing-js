/*
 * Based on:
 * Processing.js - John Resig (http://ejohn.org/)
 * MIT Licensed
 * http://ejohn.org/blog/processingjs/
 *
 * This is a port of the Processing Visualization Language.
 * More information: http://processing.org/
 */

mixin Processable{
  // start up when the context is ready 
  function Processable ( parent:LzNode? = null , attrs:Object? = null , children:Array? = null, instcall:Boolean  = false) {
    super(parent, attrs, children, instcall);
  }

  // init
  var PI = Math.PI;
  var TWO_PI = 2 * Math.PI;
  var HALF_PI = Math.PI / 2;
  var P3D = 3;
  var CORNER = 0;
  var RADIUS = 1;
  var CENTER_RADIUS = 1;
  var CENTER = 2;
  var POLYGON = 2;
  var QUADS = 5;
  var TRIANGLES = 6;
  var POINTS = 7;
  var LINES = 8;
  var TRIANGLE_STRIP = 9;
  var TRIANGLE_FAN = 4;
  var QUAD_STRIP = 3;
  var CORNERS = 10;
  var CLOSE = true;
  var RGB = 1;
  var HSB = 2;

  // mouseButton constants: values adjusted to come directly from e.which
  var LEFT = 1;
  // see above var CENTER = 2;
  var RIGHT = 3;

  // "Private" variables used to maintain state
  var curContext = null
  var images = null
  var pos = null
  var display = null
  var curElement = null
  var doFill = true;
  var doStroke = true;
  var loopStarted = false;
  var hasBackground = false;
  var doLoop = true;
  var looping = 0;
  var curRectMode = null;
  var curEllipseMode = null;
  var inSetup = false;
  var inDraw = false;
  var curBackground = "rgba(204,204,204,1)";
  var curFrameRate = 1000;
  var curShape = null;
  var curShapeCount = 0;
  var curvePoints = [];
  var curTightness = 0;
  var opacityRange = 255;
  var redRange = 255;
  var greenRange = 255;
  var blueRange = 255;
  var pathOpen = false;
  var mousePressed = false;
  var keyPressed = false;
  var firstX
  var firstY
  var secondX
  var secondY
  var prevX
  var prevY;
  var curColorMode;
  var curTint = -1;
  var curTextSize = 12;
  var curTextFont = "Arial";
  var getLoaded = false;
  var start = (new Date).getTime();
  var color;

  // Global vars for tracking mouse position
  static var pmouseX = 0;
  static var pmouseY = 0;
  static var mouseX = 0;
  static var mouseY = 0;
  static var mouseButton = 0;

  // Will be replaced by the user, most likely
  static var mouseDragged = null;
  static var mouseMoved = null;
  static var mousePressed = null;
  static var mouseReleased = null;
  static var keyPressed = null;
  static var keyReleased = null;
  //static var draw = null;
  //static var setup = null;
  function setup() {}
  function presetup(ignore) {}

  var width = 0;
  var height = 0;

  // called by init to set up constants
  function setConsts() {
    // The height/width of the canvas
    this.curContext = this.curElement;
    this.curRectMode = this.CORNER;
    this.curEllipseMode = this.CENTER;
    this.curShape = this.POLYGON;
    this.curColorMode = this.RGB;
  }

  // The current animation frame
  var frameCount = 0;
  


  function nf ( num, pad ) {
    var str = "" + num;
    while ( pad - str.length )
      str = "0" + str;
    return str;
  };

/*
  function AniSprite ( prefix, frames ) {
    this.images = [];
    this.pos = 0;

    for ( var i = 0; i < frames; i++ ) {
      this.images.push( prefix + this.nf( i, ("" + frames).length ) + ".gif" );
    }

    this.display = function( x, y ) {
      this.image( this.images[ this.pos ], x, y );

      if ( ++this.pos >= frames )
        this.pos = 0;
    };

    this.getWidth = function() {
      return getImage(this.images[0]).width;
    };

    this.getHeight = function() {
      return getImage(this.images[0]).height;
    };
  };
*/

  function buildImageObject( obj ) {
    var pixels = obj.data;
    var data = this.createImage( obj.width, obj.height, null );

    if ( data.__defineGetter__ && data.__lookupGetter__ && !data.__lookupGetter__("pixels") ) {
      var pixelsDone;
      data.__defineGetter__("pixels", function() {
        if ( pixelsDone )
          return pixelsDone;

        pixelsDone = [];

        for ( var i = 0; i < pixels.length; i += 4 ) {
          pixelsDone.push( this.color(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]) );
        }

        return pixelsDone;
      });
    } else {
      data.pixels = [];

      for ( var i = 0; i < pixels.length; i += 4 ) {
        data.pixels.push( this.color(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]) );
      }
    }

    return data;
  }

  function createImage( w, h, mode ) {
    /*
    var data = {};
    data.width = w;
    data.height = h;
    data.data = [];

    if ( this.curContext.createImageData ) {
      data = this.curContext.createImageData( w, h );
    }

    data.pixels = new Array( w * h );
    data.get = function(x,y) {
      return this.pixels[w*y+x];
    };
    data._mask = null;
    data.mask = function(img) {
      this._mask = img;
    };
    data.loadPixels = function(){};
    data.updatePixels = function(){};

    return data;
    */
  };

  function createGraphics( w, h ) {
    //var canvas = document.createElement("canvas");
    //var ret = buildProcessing( canvas );
    //ret.size( w, h );
    //ret.canvas = canvas;
    //return ret;
  };

  function beginDraw(){};

  function endDraw(){};

  function tint( rgb, a ) {
    curTint = a;
  };

/*
  function getImage( img ) {
    if ( typeof img == "string" ) {
      return document.getElementById(img);
    }

    if ( img.img || img.canvas ) {
      return img.img || img.canvas;
    }

    for ( var i = 0, l = img.pixels.length; i < l; i++ ) {
      var pos = i * 4;
      var c = (img.pixels[i] || "rgba(0,0,0,1)").slice(5,-1).split(",");
      img.data[pos] = parseInt(c[0]);
      img.data[pos+1] = parseInt(c[1]);
      img.data[pos+2] = parseInt(c[2]);
      img.data[pos+3] = parseFloat(c[3]) * 100;
    }

    var canvas = document.createElement("canvas")
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext("2d");
    context.putImageData( img, 0, 0 );

    img.canvas = canvas;

    return canvas;
  }

  function image( img, x, y, w, h ) {
    x = x || 0;
    y = y || 0;

    var obj = getImage(img);

    if ( curTint >= 0 ) {
      var oldAlpha = this.curContext.globalAlpha;
      this.curContext.globalAlpha = curTint / opacityRange;
    }

    if ( arguments.length == 3 ) {
      this.curContext.drawImage( obj, x, y );
    } else {
      this.curContext.drawImage( obj, x, y, w, h );
    }

    if ( curTint >= 0 ) {
      this.curContext.globalAlpha = oldAlpha;
    }

    if ( img._mask ) {
      var oldComposite = this.curContext.globalCompositeOperation;
      this.curContext.globalCompositeOperation = "darker";
      this.image( img._mask, x, y );
      this.curContext.globalCompositeOperation = oldComposite;
    }
  };
  */

  function exit() {
    LzTimeKernel.clearInterval(looping);
  };

/*
  function save( file ){};

  function loadImage( file ) {
    var img = document.getElementById(file);
    if ( !img )
      return;

    var h = img.height, w = img.width;

    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var context = canvas.getContext("2d");

    context.drawImage( img, 0, 0 );
    var data = buildImageObject( context.getImageData( 0, 0, w, h ) );
    data.img = img;
    return data;
  };
*/

  function loadFont( name ) {
    return {
      name: name,
      width: function( str ) {
        if ( this.curContext.mozMeasureText )
          return this.curContext.mozMeasureText( typeof str == "number" ?
            String.fromCharCode( str ) :
            str) / curTextSize;
        else
          return 0;
      }
    };
  };

  function textFont( name, size ) {
    curTextFont = name;
    this.textSize( size );
  };

  function textSize( size ) {
    if ( size ) {
      curTextSize = size;
    }
  };

  function textAlign(){};

  function text( str, x, y ) {
    if ( str && this.curContext.mozDrawText ) {
      this.curContext.save();
      this.curContext.mozTextStyle = curTextSize + "px " + curTextFont.name;
      this.curContext.translate(x, y);
      this.curContext.mozDrawText( typeof str == "number" ?
        String.fromCharCode( str ) :
        str );
      this.curContext.restore();
    }
  };

  function _char( key ) {
    return key;
  };

  function println(){};

  function map( value, istart, istop, ostart, ostop ) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  };

  String.prototype.replaceAll = function(re, replace) {
    return this.replace(new RegExp(re, "g"), replace);
  };




  
  function colorMode( mode, range1, range2, range3, range4 ) {
    this.curColorMode = mode;

    if ( arguments.length >= 4 ) {
      redRange = range1;
      greenRange = range2;
      blueRange = range3;
    }

    if ( arguments.length == 5 ) {
      opacityRange = range4;
    }

    if ( arguments.length == 2 ) {
      this.colorMode( mode, range1, range1, range1, range1 );
    }
  };
  
  function beginShape( type ) {
    curShape = type;
    curShapeCount = 0; 
    curvePoints = [];
  };
  
  function endShape( close ) {
    if ( curShapeCount != 0 ) {
      if ( close || doFill ) 
      this.curContext.lineTo( firstX, firstY );

      if ( doFill )
        this.curContext.fill();
        
      if ( doStroke )
        this.curContext.stroke();
    
      this.curContext.closePath();
      curShapeCount = 0;
      pathOpen = false;
    }

    if ( pathOpen ) {
      if ( doFill )
        this.curContext.fill();

      if ( doStroke )
        this.curContext.stroke();

      this.curContext.closePath();
      curShapeCount = 0;
      pathOpen = false;
    }
  };
  
  function vertex( ...args ) {
    var x = args[0];
    var y = args[1];
    var x2 = args[2];
    var y2 = args[3];
    var x3 = args[4];
    var y3 = args[5];

    if ( curShapeCount == 0 && curShape != this.POINTS ) {
      pathOpen = true;
      this.curContext.beginPath();
      this.curContext.moveTo( x, y );
      firstX = x;
      firstY = y;
    } else {
      if ( curShape == this.POINTS ) {
        this.point( x, y );
      } else if ( args.length == 2 ) {
        if ( curShape != this.QUAD_STRIP || curShapeCount != 2 )
          this.curContext.lineTo( x, y );

        if ( curShape == this.TRIANGLE_STRIP ) {
          if ( curShapeCount == 2 ) {
            // finish shape
            this.endShape(this.CLOSE);
            pathOpen = true;
            this.curContext.beginPath();
            
            // redraw last line to start next shape
            this.curContext.moveTo( prevX, prevY );
            this.curContext.lineTo( x, y );
            curShapeCount = 1;
          }
          firstX = prevX;
          firstY = prevY;
        }

        if ( curShape == this.TRIANGLE_FAN && curShapeCount == 2 ) {
          // finish shape
          this.endShape(this.CLOSE);
          pathOpen = true;
          this.curContext.beginPath();
      
          // redraw last line to start next shape
          this.curContext.moveTo( firstX, firstY );
          this.curContext.lineTo( x, y );
          curShapeCount = 1;
        }
    
        if ( curShape == this.QUAD_STRIP && curShapeCount == 3 ) {
          // finish shape
          this.curContext.lineTo( prevX, prevY );
          this.endShape(this.CLOSE);
          pathOpen = true;
          this.curContext.beginPath();
    
          // redraw lines to start next shape
          this.curContext.moveTo( prevX, prevY );
          this.curContext.lineTo( x, y );
          curShapeCount = 1;
        }

        if ( curShape == this.QUAD_STRIP) {
          firstX = secondX;
          firstY = secondY;
          secondX = prevX;
          secondY = prevY;
        }
      } else if ( args.length == 4 ) {
        if ( curShapeCount > 1 ) {
          this.curContext.moveTo( prevX, prevY );
          this.curContext.quadraticCurveTo( firstX, firstY, x, y );
          curShapeCount = 1;
        }
      } else if ( args.length == 6 ) {
        this.curContext.bezierCurveTo( x, y, x2, y2, x3, y3 );
        curShapeCount = -1;
      }
    }

    prevX = x;
    prevY = y;
    curShapeCount++;
    
    if ( curShape == this.LINES && curShapeCount == 2 ||
         (curShape == this.TRIANGLES) && curShapeCount == 3 ||
     (curShape == this.QUADS) && curShapeCount == 4 ) {
      this.endShape(this.CLOSE);
    }
  };

  function curveVertex ( x, y, x2, y2 ) {
    if ( curvePoints.length < 3 ) {
      curvePoints.push([x,y]);
    } else {
      var b = [], s = 1 - curTightness;

      /*
       * Matrix to convert from Catmull-Rom to cubic Bezier
       * where t = curTightness
       * |0         1          0         0       |
       * |(t-1)/6   1          (1-t)/6   0       |
       * |0         (1-t)/6    1         (t-1)/6 |
       * |0         0          0         0       |
       */

      curvePoints.push([x,y]);

      b[0] = [curvePoints[1][0],curvePoints[1][1]];
      b[1] = [curvePoints[1][0]+(s*curvePoints[2][0]-s*curvePoints[0][0])/6,curvePoints[1][1]+(s*curvePoints[2][1]-s*curvePoints[0][1])/6];
      b[2] = [curvePoints[2][0]+(s*curvePoints[1][0]-s*curvePoints[3][0])/6,curvePoints[2][1]+(s*curvePoints[1][1]-s*curvePoints[3][1])/6];
      b[3] = [curvePoints[2][0],curvePoints[2][1]];

      if ( !pathOpen ) {
        this.vertex( b[0][0], b[0][1] );
      } else {
        curShapeCount = 1;
      }

      this.vertex( b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1] );
      curvePoints.shift();
    }
  };

  function curveTightness ( tightness ) {
    curTightness = tightness;
  };

  function bezierVertex() {
    return this.vertex.apply(this, arguments);
  }
  
  function rectMode( aRectMode ) {
    curRectMode = aRectMode;
  };

  function imageMode (){};
  
  function ellipseMode( aEllipseMode ) {
    this.curEllipseMode = aEllipseMode;
  };
  
  function dist( x1, y1, x2, y2 ) {
    return Math.sqrt( Math.pow( x2 - x1, 2 ) + Math.pow( y2 - y1, 2 ) );
  };

  function year() {
    return (new Date).getYear() + 1900;
  };

  function month() {
    return (new Date).getMonth();
  };

  function day() {
    return (new Date).getDay();
  };

  function hour() {
    return (new Date).getHours();
  };

  function minute() {
    return (new Date).getMinutes();
  };

  function second() {
    return (new Date).getSeconds();
  };

  function millis() {
    return (new Date).getTime() - start;
  };
  
  function ortho(){};
  
  function translate( x, y ) {
    this.curContext.translate( x, y );
  };
  
  function scale( x, y ) {
    this.curContext.scale( x, y || x );
  };
  
  function rotate( aAngle ) {
    this.curContext.rotate( aAngle );
  };

  function pushMatrix() {
    this.curContext.save();
  };
  
  function popMatrix() {
    this.curContext.restore();
  };
  
  function redraw() {
    //Debug.write('redraw');
    if ( this.hasBackground ) {
      this.curContext.clear();
      this.background();
    }

    this.frameCount++;
    
    inDraw = true;
    this.pushMatrix();
    this['draw']();
    this.popMatrix();
    inDraw = false;
  };
  
  function loop() {
    if ( this.loopStarted )
      return;

    var self = this;  
    
    looping = LzTimeKernel.setInterval(function() {
      try {
        self.redraw();
      }
      catch(e) {
        LzTimeKernel.clearInterval( looping );
        throw e;
      }
    }, 1000 / this.curFrameRate );
    
    this.loopStarted = true;
  };
  
  function frameRate( aRate ) {
    this.curFrameRate = aRate;
  };
  
  function background( ...args ) {
    if ( args.length ) {
      var img = args[0];  
      if ( img && img['img'] ) {
        curBackground = img;
      } else {
        curBackground = this.color.setValue( args );
      }
    }
    

    if ( curBackground['img'] ) {
      //this.image( curBackground, 0, 0 );
    } else {
      var oldFill = this.curContext.fillStyle;
      this.curContext.fillStyle = curBackground + "";
      this.curContext.fillRect( 0, 0, this.width, this.height );
      this.curContext.fillStyle = oldFill;
    }
  };

  function sq( aNumber ) {
    return aNumber * aNumber;
  };

  function sqrt( aNumber ) {
    return Math.sqrt( aNumber );
  };
  
  function _int( aNumber ) {
    return Math.floor( aNumber );
  };

  function min( aNumber, aNumber2 ) {
    return Math.min( aNumber, aNumber2 );
  };

  function max( aNumber, aNumber2 ) {
    return Math.max( aNumber, aNumber2 );
  };

  function ceil( aNumber ) {
    return Math.ceil( aNumber );
  };

  function floor( aNumber ) {
    return Math.floor( aNumber );
  };

  function _float( aNumber ) {
    return typeof aNumber == "string" ?
      this._float( aNumber.charCodeAt(0) ) :
      parseFloat( aNumber );
  };

  function _byte( aNumber ) {
    return aNumber || 0;
  };
  
  function random( aMin, aMax ) {
    return arguments.length == 2 ?
      aMin + (Math.random() * (aMax - aMin)) :
      Math.random() * aMin;
  };

  // From: http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
  function noise ( x, y, z ) {
    return arguments.length >= 2 ?
      PerlinNoise_2D( x, y ) :
      PerlinNoise_2D( x, x );
  };

  function Noise(x, y) {
    var n = x + y * 57;
    n = (n<<13) ^ n;
    return Math.abs(1.0 - (((n * ((n * n * 15731) + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0));
  };

  function SmoothedNoise(x, y) {
    var corners = ( Noise(x-1, y-1)+Noise(x+1, y-1)+Noise(x-1, y+1)+Noise(x+1, y+1) ) / 16;
    var sides   = ( Noise(x-1, y)  +Noise(x+1, y)  +Noise(x, y-1)  +Noise(x, y+1) ) /  8;
    var center  =  Noise(x, y) / 4;
    return corners + sides + center;
  };

  function InterpolatedNoise(x, y) {
    var integer_X    = Math.floor(x);
    var fractional_X = x - integer_X;

    var integer_Y    = Math.floor(y);
    var fractional_Y = y - integer_Y;

    var v1 = SmoothedNoise(integer_X,     integer_Y);
    var v2 = SmoothedNoise(integer_X + 1, integer_Y);
    var v3 = SmoothedNoise(integer_X,     integer_Y + 1);
    var v4 = SmoothedNoise(integer_X + 1, integer_Y + 1);

    var i1 = Interpolate(v1 , v2 , fractional_X);
    var i2 = Interpolate(v3 , v4 , fractional_X);

    return Interpolate(i1 , i2 , fractional_Y);
  }

  function PerlinNoise_2D(x, y) {
      var total = 0;
      var p = 0.25;
      var n = 3;

      for ( var i = 0; i <= n; i++ ) {
          var frequency = Math.pow(2, i);
          var amplitude = Math.pow(p, i);

          total = total + InterpolatedNoise(x * frequency, y * frequency) * amplitude;
      }

      return total;
  }

  function Interpolate(a, b, x) {
    var ft = x * this.PI;
    var f = (1 - this.cos(ft)) * .5;
    return  a*(1-f) + b*f;
  }

  function red ( aColor ) {
    return parseInt(aColor.slice(5));
  };

  function green ( aColor ) {
    return parseInt(aColor.split(",")[1]);
  };

  function blue ( aColor ) {
    return parseInt(aColor.split(",")[2]);
  };

  function alpha ( aColor ) {
    return parseInt(aColor.split(",")[3]);
  };

  function abs( aNumber ) {
    return Math.abs( aNumber );
  };
  
  function cos( aNumber ) {
    return Math.cos( aNumber );
  };
  
  function sin( aNumber ) {
    return Math.sin( aNumber );
  };
  
  function pow( aNumber, aExponent ) {
    return Math.pow( aNumber, aExponent );
  };
  
  function constrain( aNumber, aMin, aMax ) {
    return Math.min( Math.max( aNumber, aMin ), aMax );
  };
  
  function atan2( aNumber, aNumber2 ) {
    return Math.atan2( aNumber, aNumber2 );
  };
  
  function radians( aAngle ) {
    return ( aAngle / 180 ) * this.PI;
  };
  
  function size( aWidth, aHeight ) {
    var fillStyle = this.curContext.fillStyle;
    var strokeStyle = this.curContext.strokeStyle;

    this.curElement.setWidth(aWidth);
    this.curElement.setHeight(aHeight);
    this.width = aWidth;
    this.height = aHeight;

    this.curContext.fillStyle = fillStyle;
    this.curContext.strokeStyle = strokeStyle;
  };
  
  function noStroke() {
    doStroke = false;
  };
  
  function noFill() {
    doFill = false;
  };
  
  function smooth(){};
  
  function noLoop() {
    this.doLoop = false;
  };
  
  function fill( ...args ) {
    doFill = true;
    this.curContext.fillStyle = this.color.setValue( args );
  };
  
  function stroke( ...args ) {
    doStroke = true;
    var col = this.color.setValue(args);
    this.curContext.strokeStyle = col
  };

  function strokeWeight( w ) {
    this.curContext.lineWidth = w;
  };
  
  function point( x, y ) {
    var oldFill = this.curContext.fillStyle;
    this.curContext.fillStyle = this.curContext.strokeStyle;
    this.curContext.fillRect( Math.round( x ), Math.round( y ), 1, 1 );
    this.curContext.fillStyle = oldFill;
  };

  function get( x, y ) {
    if ( arguments.length == 0 ) {
      var c = this.createGraphics( this.width, this.height );
      c.image( this.curContext, 0, 0 );
      return c;
    }

    if ( !getLoaded ) {
      getLoaded = buildImageObject( this.curContext.getImageData(0, 0, this.width, this.height) );
    }

    return getLoaded.get( x, y );
  };

  function set( x, y, obj ) {
    if ( obj && obj.img ) {
      //this.image( obj, x, y );
    } else {
      var oldFill = this.curContext.fillStyle;
      var color = obj;
      this.curContext.fillStyle = color;
      this.curContext.fillRect( Math.round( x ), Math.round( y ), 1, 1 );
      this.curContext.fillStyle = oldFill;
    }
  };
  
  function arc( x, y, width, height, start, stop ) {
    if ( width <= 0 )
      return;

    if ( this.curEllipseMode == this.CORNER ) {
      x += width / 2;
      y += height / 2;
    }

    this.curContext.beginPath();
  
    this.curContext.moveTo( x, y );
    this.curContext.arc( x, y, this.curEllipseMode == this.CENTER_RADIUS ? width : width/2, start, stop, false );
    
    if ( doFill )
      this.curContext.fill();
      
    if ( doStroke )
      this.curContext.stroke();
    
    this.curContext.closePath();
  };
  
  function line( x1, y1, x2, y2 ) {
    this.curContext.lineCap = "round";
    this.curContext.beginPath();
  
    this.curContext.moveTo( x1 || 0, y1 || 0 );
    this.curContext.lineTo( x2 || 0, y2 || 0 );
    
    this.curContext.stroke();
    
    this.curContext.closePath();
  };

  function bezier( x1, y1, x2, y2, x3, y3, x4, y4 ) {
    this.curContext.lineCap = "butt";
    this.curContext.beginPath();
  
    this.curContext.moveTo( x1, y1 );
    this.curContext.bezierCurveTo( x2, y2, x3, y3, x4, y4 );
    
    this.curContext.stroke();
    
    this.curContext.closePath();
  };

  function triangle( x1, y1, x2, y2, x3, y3 ) {
    this.beginShape(null);
    this.vertex( x1, y1 );
    this.vertex( x2, y2 );
    this.vertex( x3, y3 );
    this.endShape(null);
  };

  function quad( x1, y1, x2, y2, x3, y3, x4, y4 ) {
    this.beginShape(null);
    this.vertex( x1, y1 );
    this.vertex( x2, y2 );
    this.vertex( x3, y3 );
    this.vertex( x4, y4 );
    this.endShape(null);
  };
  
  function rect( x, y, width, height ) {
    if ( width == 0 && height == 0 )
      return;

    this.curContext.beginPath();
    
    var offsetStart = 0;
    var offsetEnd = 0;

    if ( this.curRectMode == this.CORNERS ) {
      width -= x;
      height -= y;
    }
    
    if ( this.curRectMode == this.RADIUS ) {
      width *= 2;
      height *= 2;
    }
    
    if ( this.curRectMode == this.CENTER || this.curRectMode == this.RADIUS ) {
      x -= width / 2;
      y -= height / 2;
    }
  
    this.curContext.rect(
      Math.round( x ) - offsetStart,
      Math.round( y ) - offsetStart,
      Math.round( width ) + offsetEnd,
      Math.round( height ) + offsetEnd
    );
      
    if ( doFill )
      this.curContext.fill();
      
    if ( doStroke )
      this.curContext.stroke();
    
    this.curContext.closePath();
  };
  
  function ellipse( x, y, width, height ) {
    x = x || 0;
    y = y || 0;

    if ( width <= 0 && height <= 0 )
      return;

    this.curContext.beginPath();
    
    if ( this.curEllipseMode == this.RADIUS ) {
      width *= 2;
      height *= 2;
    }
    
    var offsetStart = 0;
    
    // Shortcut for drawing a circle
    if ( width == height )
      this.curContext.arc( x - offsetStart, y - offsetStart, width / 2, 0, Math.PI * 2, false );
  
    if ( doFill )
      this.curContext.fill();
      
    if ( doStroke )
      this.curContext.stroke();
    
    this.curContext.closePath();
  };

  function link ( href, target ) {
    lz.Browser.loadURL(href, target);
    //window.location = href;
  };

  function loadPixels () {
    //this.pixels = buildImageObject( this.curContext.getImageData(0, 0, this.width, this.height) ).pixels;
  };

  function updatePixels () {
    /*
    var colors = new RegExp('(d+),(\d+),(\d+),(\d+)');
    var pixels = {};
    pixels.width = this.width;
    pixels.height = this.height;
    pixels.data = [];

    if ( this.curContext.createImageData ) {
      pixels = this.curContext.createImageData( this.width, this.height );
    }

    var data = pixels.data;
    var pos = 0;

    for ( var i = 0, l = this.pixels.length; i < l; i++ ) {
      var c = (this.pixels[i] || "rgba(0,0,0,1)").match(colors);
      data[pos] = parseInt(c[1]);
      data[pos+1] = parseInt(c[2]);
      data[pos+2] = parseInt(c[3]);
      data[pos+3] = parseFloat(c[4]) * 100;
      pos += 4;
    }

    this.curContext.putImageData(pixels, 0, 0);
    */
  };

  function extendClass( obj, args, fn ) {
    if ( arguments.length == 3 ) {
      fn.apply( obj, args );
    } else {
      args.call( obj );
    }
  };

  function addMethod( object, name, fn ) {
    if ( object[ name ] ) {
      var args = fn.length;
      
      var oldfn = object[ name ];
      object[ name ] = function() {
        if ( arguments.length == args )
          return fn.apply( this, arguments );
        else
          return oldfn.apply( this, arguments );
      };
    } else {
      object[ name ] = fn;
    }
  };

  // renamed so it doesn't conflict with the lzx built-in
  function begin(){
    //Debug.write('begin', this.curContext, this.curElement);
    if (! this.curContext) this.curContext = this.curElement;
    //this.curElement = ctx;
  
    // Canvas has trouble rendering single pixel stuff on whole-pixel
    // counts, so we slightly offset it (this is super lame).
    this.curContext.translate( 0.5, 0.5 );

    /* Handled by rhino
    if ( code ) {
      (function(Processing){with (p){
        eval(parse(code, p));
      }})(p);
    }
    */
  
    if ( this.setup ) {
      inSetup = true;
      this.setup();
    }
    
    inSetup = false;
    
    if ( this['draw'] ) {
      if ( !this.doLoop ) {
        this.redraw();
      } else {
        this.loop();
      }
    }

    /*
    
    attach( this.curElement, "mousemove", function(e) {
      var scrollX = window.scrollX != null ? window.scrollX : window.pageXOffset;
      var scrollY = window.scrollY != null ? window.scrollY : window.pageYOffset;
      this.pmouseX = this.mouseX;
      this.pmouseY = this.mouseY;
      this.mouseX = e.clientX - this.curElement.offsetLeft + scrollX;
      this.mouseY = e.clientY - this.curElement.offsetTop + scrollY;

      if ( this.mouseMoved ) {
        this.mouseMoved();
      }      

      if ( mousePressed && this.mouseDragged ) {
        this.mouseDragged();
      }      
    });
    
    attach( this.curElement, "mousedown", function(e) {
      mousePressed = true;
      this.mouseButton = e.which;

      if ( typeof this.mousePressed == "function" ) {
        this.mousePressed();
      } else {
        this.mousePressed = true;
      }
    });

    attach( this.curElement, "contextmenu", function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    attach( this.curElement, "mouseup", function(e) {
      mousePressed = false;

      if ( typeof this.mousePressed != "function" ) {
        this.mousePressed = false;
      }

      if ( this.mouseReleased ) {
        this.mouseReleased();
      }
    });

    attach( document, "keydown", function(e) {
      keyPressed = true;

      this.key = e.keyCode + 32;

      if ( e.shiftKey ) {
        this.key = String.fromCharCode(this.key).toUpperCase().charCodeAt(0);
      }

      if ( typeof this.keyPressed == "function" ) {
        this.keyPressed();
      } else {
        this.keyPressed = true;
      }
    });

    attach( document, "keyup", function(e) {
      keyPressed = false;

      if ( typeof this.keyPressed != "function" ) {
        this.keyPressed = false;
      }

      if ( this.keyReleased ) {
        this.keyReleased();
      }
    });

    function attach(elem, type, fn) {
      if ( elem.addEventListener )
        elem.addEventListener( type, fn, false );
      else
        elem.attachEvent( "on" + type, fn );
    }
    */
  }

  function bind(processingcontext) {
    this.curContext = processingcontext.curContext;
    this.color = processingcontext.color;
  }
}

class $lzc$class_processing extends LzNode with Processable {
  // Next two are part of the required LFC tag class protocol
  static var tagname = 'processing';
  static var attributes = new LzInheritedHash(LzNode.attributes);
  //$lzc$class_processing.attributes.element = null;

  function $lzc$class_processing(parent, attrs, children, async) {
    super(parent, attrs, children, async);
  }

  override function construct(parent, attrs) {
    if (attrs['element'] == null) {
      attrs.element = new lz.drawview(canvas, {width: 200, height: 200}, null, null);
    }
    super.construct(parent, attrs);
    this.color = new ProcessingColor(this);
    this.setConsts();
    //this.stroke( 0 );
    //this.fill( 255 );
  }

  function $lzc$set_element(e) { this.setElement(e) }
  function setElement(c) {
    //Debug.warn('setContext', c)
    if (c['context'] == null) {
      new LzDelegate(this, 'setElement', c, 'oncontext');
    } else {
      this.curElement = c;
      this.width = this.curElement.width;
      this.height = this.curElement.height;
      this.curContext = this.curElement;
      this.presetup(null);
    }
  }
}

// In case I ever need to do HSV conversion:
// http://srufaculty.sru.edu/david.dailey/javascript/js/5rml.js
class ProcessingColor {
    var owner = null;
    function ProcessingColor( scope ) {
        this.owner = scope;
    }
    function setValue(args) {
        return this.setColor.apply(this, args);
    }

    function setColor(...args) {
    var aValue1 = args[0]
    var aValue2 = args[1]
    var aValue3 = args[2]
    var aValue4 = args[3];
    var aColor = "";
    
    if ( args.length == 3 ) {
      aColor = this.setColor( aValue1, aValue2, aValue3, this.owner.opacityRange );
    } else if ( args.length == 4 ) {
      var a = aValue4 / this.owner.opacityRange;
      a = isNaN(a) ? 1 : a;

      if ( this.owner.curColorMode == this.owner.HSB ) {
        var rgb = this.HSBtoRGB(aValue1, aValue2, aValue3);
        var r = rgb[0], g = rgb[1], b = rgb[2];
      } else {
        var r = this.getColor(aValue1, this.owner.redRange);
        var g = this.getColor(aValue2, this.owner.greenRange);
        var b = this.getColor(aValue3, this.owner.blueRange);
      }

      aColor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    } else if ( typeof aValue1 == "string" ) {
      aColor = aValue1;

      if ( args.length == 1 ) {
        var c = aColor.split(",");
        c[3] = (aValue2 / this.owner.opacityRange) + ")";
        aColor = c.join(",");
      }
    } else if ( args.length == 2 ) {
      aColor = this.setColor( aValue1, aValue1, aValue1, aValue2 );
    } else if ( typeof aValue1 == "number" ) {
      aColor = this.setColor( aValue1, aValue1, aValue1, this.owner.opacityRange );
    } else {
      aColor = this.setColor( this.owner.redRange, this.owner.greenRange, this.owner.blueRange, this.owner.opacityRange );
    }
    return aColor;
    }

    // HSB conversion function from Mootools, MIT Licensed
    function HSBtoRGB(h, s, b) {
      h = (h / this.owner.redRange) * 100;
      s = (s / this.owner.greenRange) * 100;
      b = (b / this.owner.blueRange) * 100;
      if (s == 0){
        return [b, b, b];
      } else {
        var hue = h % 360;
        var f = hue % 60;
        var br = Math.round(b / 100 * 255);
        var p = Math.round((b * (100 - s)) / 10000 * 255);
        var q = Math.round((b * (6000 - s * f)) / 600000 * 255);
        var t = Math.round((b * (6000 - s * (60 - f))) / 600000 * 255);
        switch (Math.floor(hue / 60)){
          case 0: return [br, t, p];
          case 1: return [q, br, p];
          case 2: return [p, br, t];
          case 3: return [p, q, br];
          case 4: return [t, p, br];
          case 5: return [br, p, q];
        }
      }
    }

    function getColor( aValue, range ) {
      return Math.round(255 * (aValue / range));
    }
}

class ArrayList {
  var array = null;

  function ArrayList( size, size2, size3 ) {
    this.array = array = new Array( 0 | size );
    
    if ( size2 ) {
      for ( var i = 0; i < size; i++ ) {
        array[i] = [];

        for ( var j = 0; j < size2; j++ ) {
          var a = array[i][j] = size3 ? new Array( size3 ) : 0;
          for ( var k = 0; k < size3; k++ ) {
            a[k] = 0;
          }
        }
      }
    } else {
      for ( var i = 0; i < size; i++ ) {
        array[i] = 0;
      }
    }
    
    array.size = function() {
      return this.length;
    };
    array.get = function( i ) {
      return this[ i ];
    };
    array.remove = function( i ) {
      return this.splice( i, 1 );
    };
    array.add = function( item ) {
      return this.push( item );
    };
    array.clone = function() {
      var a = new ArrayList( size );
      for ( var i = 0; i < size; i++ ) {
        a[ i ] = this[ i ];
      }
      return a;
    };
    array.isEmpty = function() {
      return !this.length;
    };
    array.clear = function() {
      this.length = 0;
    };
    return this;
  };
}

class Point {
    var x;
    var y;
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    function copy() {
      return new Point( x, y );
    }
};

class Random {
    var haveNextNextGaussian = false;
    var nextNextGaussian;

    function nextNextGaussian() {
      if (haveNextNextGaussian) {
        haveNextNextGaussian = false;

        return nextNextGaussian;
      } else {
        var v1, v2, s;
        do { 
          v1 = 2 * this.random(1) - 1;   // between -1.0 and 1.0
          v2 = 2 * this.random(1) - 1;   // between -1.0 and 1.0
          s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s == 0);
        var multiplier = Math.sqrt(-2 * Math.log(s)/s);
        nextNextGaussian = v2 * multiplier;
        haveNextNextGaussian = true;

        return v1 * multiplier;
      }
    };
};
lz[$lzc$class_processing.tagname] = $lzc$class_processing;

