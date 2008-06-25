/*
 * Processing.js - John Resig (http://ejohn.org/)
 * MIT Licensed
 * http://ejohn.org/blog/processingjs/
 *
 * This is a port of the Processing Visualization Language.
 * More information: http://processing.org/
 */

(function(){

this.Processing = function Processing( aElement, aCode ) {
  if ( typeof aElement == "string" )
    aElement = document.getElementById( aElement );

  var p = buildProcessing( aElement );

  if ( aCode )
    p.init( aCode );

  return p;
};

function log() {
  try {
    console.log.apply( console, arguments );
  } catch(e) {
    try {
      opera.postError.apply( opera, arguments );
    } catch(e){}
  }
}

var parsejs = Processing.parsejs = function parsejs( aCode, p ) {
  // Angels weep at this parsing code :-(

  // Remove end-of-line comments
  aCode = aCode.replace(/\s*\/\/ .*\n/g, "\n");

  // Weird parsing errors with %
  aCode = aCode.replace(/([^\s])%([^\s])/g, "$1 % $2");
 
  // Simple convert a function-like thing to function
  aCode = aCode.replace(/(?:static )?(\w+ )(\w+)\s*(\([^\)]*\)\s*{)/g, function(all, type, name, args) {
    if ( name == "if" || name == "for" || name == "while" ) {
      return all;
    } else {
      return "Processing." + name + " = function " + name + args;
    }
  });

  // Force .length() to be .length
  aCode = aCode.replace(/\.length\(\)/g, ".length");

  // foo( int foo, float bar )
  aCode = aCode.replace(/([\(,]\s*)(\w+)\s+(\w+)\s*([\),])/g, "$1$3:$2$4");
  aCode = aCode.replace(/([\(,]\s*)(\w+)\s+(\w+)\s*([\),])/g, "$1$3:$2$4");

  // float[] foo = new float[5];
  aCode = aCode.replace(/new (\w+)((?:\[([^\]]*)\])+)/g, function(all, name, args) {
    return "new ArrayList(" + args.slice(1,-1).split("][").join(", ") + ")";
  });
  
  aCode = aCode.replace(/(?:static )?\w+\[\]\s*(\w+)\[?\]?\s*=\s*{.*?};/g, function(all) {
    return all.replace(/{/g, "[").replace(/}/g, "]");
  });

  // int|float foo;
  var intFloat = /(\n\s*(?:int|float)(?:\[\])?(?:\s*|[^\(]*?,\s*))([a-z]\w*)(;|,)/i;
  while ( intFloat.test(aCode) ) {
    aCode = aCode.replace(new RegExp(intFloat), function(all, type, name, sep) {
      return type + " " + name + " = 0" + sep;
    });
  }

  // float foo = 5 -> var foo:float = 5;
  aCode = aCode.replace(/(?:static )?(\w+)((?:\[\])+| ) *(\w+)\[?\]?(\s*[=,;])/g, function(all, type, arr, name, sep) {
    if ( type == "return" )
      return all;
    else
      return "var " + name + ':' + type + sep;
  });

  // Fix Array[] foo = {...} to [...]
  aCode = aCode.replace(/=\s*{((.|\s)*?)};/g, function(all,data) {
    return "= [" + data.replace(/{/g, "[").replace(/}/g, "]") + "]";
  });
  
  // static { ... } blocks
  aCode = aCode.replace(/static\s*{((.|\n)*?)}/g, function(all, init) {
    // Convert the static definitons to variable assignments
    //return init.replace(/\((.*?)\)/g, " = $1");
    return init;
  });

  // super() is a reserved word
  //aCode = aCode.replace(/super\(/g, "superMethod(");

  var classes = ["int", "float", "boolean", "string"];

  function ClassReplace(all, name, extend, vars, last) {
    classes.push( name );
    // Default class
    if (! extend) extend = 'processing';

    var _static = "";

    vars = vars.replace(/final\s+var\s+(\w+\s*=\s*.*?;)/g, function(all,set) {
      _static += " " + name + "." + set;
      return "";
    });

    // Move arguments up from constructor and wrap contents with
    // a with(this), and unwrap constructor
    return "class " + name + 
      (extend ? " extends " + extend : "") + " });" +
      // Replace var foo = 0; with var foo = 0;
      // and force var foo; to become var foo = null;
      vars
        .replace(/,\s?/g, ";\n  var ")
        .replace(/\b(var |final |public )+\s*/g, "var ")
        .replace(/this.(\w+);/g, "this.$1 = null;") + 
        "<CLASS " + name + " " + _static + ">" + (typeof last == "string" ? last : name + "(");
  }

  var matchClasses = /(?:public |abstract |static )*class (\w+)\s*(?:extends\s*(\w+)\s*)?{\s*((?:.|\n)*?)\b\1\s*\(/g;
  var matchNoCon = /(?:public |abstract |static )*class (\w+)\s*(?:extends\s*(\w+)\s*)?{\s*((?:.|\n)*?)(Processing)/g;
  
  aCode = aCode.replace(matchClasses, ClassReplace);
  aCode = aCode.replace(matchNoCon, ClassReplace);

  var matchClass = /<CLASS (\w+) (.*?)>/, m;
  
  while ( (m = aCode.match( matchClass )) ) {
    var left = RegExp.leftContext,
      allRest = RegExp.rightContext,
      rest = nextBrace(allRest),
      className = m[1],
      staticVars = m[2] || "";
      
    allRest = allRest.slice( rest.length + 1 );

    rest = rest.replace(new RegExp("\\b" + className + "\\(([^\\)]*?)\\)\\s*{", "g"), function(all, args) {
      args = args.split(/,\s*?/);
      
      if ( args[0].match(/^\s*$/) )
        args.shift();
      
      var fn = "function " + className + "(" +args.join() + ") {\n    if ( arguments.length == " + args.length + " ) {\n";
        
      /*
      for ( var i = 0; i < args.length; i++ ) {
        fn += "    var " + args[i] + " = arguments[" + i + "];\n";
      }
      */
        
      return fn;
    });
    
    // Fix class method names
    // this.collide = function() { ... }
    // and add closing } for with(this) ...
    rest = rest.replace(/(?:public )?Processing.\w+ = function (\w+)\((.*?)\)/g, function(all, name, args) {
      return "ADDMETHOD" + name + " (" + args + ")";
    });
    
    var matchMethod = /ADDMETHOD([\s\S]*?{)/, mc;
    var methods = "";
    
    while ( (mc = rest.match( matchMethod )) ) {
      var prev = RegExp.leftContext,
        allNext = RegExp.rightContext,
        next = nextBrace(allNext);

      methods += "function " + mc[1] + next + "});"
      
      rest = prev + allNext.slice( next.length + 1 );
    }

    rest = methods + rest;
    
    aCode = left + rest + "\n}}" + staticVars + allRest;
  }

  // Do some tidying up, where necessary
  aCode = aCode.replace(/Processing.\w+ = function addMethod/g, "addMethod");
  
  function nextBrace( right ) {
    var rest = right;
    var position = 0;
    var leftCount = 1, rightCount = 0;
    
    while ( leftCount != rightCount ) {
      var nextLeft = rest.indexOf("{");
      var nextRight = rest.indexOf("}");
      
      if ( nextLeft < nextRight && nextLeft != -1 ) {
        leftCount++;
        rest = rest.slice( nextLeft + 1 );
        position += nextLeft + 1;
      } else {
        rightCount++;
        rest = rest.slice( nextRight + 1 );
        position += nextRight + 1;
      }
    }
    
    return right.slice(0, position - 1);
  }

  // Handle (int) Casting
  aCode = aCode.replace(/\(int\)/g, "0|");

  // Remove Casting
  aCode = aCode.replace(new RegExp("\\((" + classes.join("|") + ")(\\[\\])?\\)", "g"), "");
  
  // Convert 3.0f to just 3.0
  aCode = aCode.replace(/(\d+)f/g, "$1");

  // Force numbers to exist
  //aCode = aCode.replace(/([^.])(\w+)\s*\+=/g, "$1$2 = ($2||0) +");

  // Force characters-as-bytes to work
  aCode = aCode.replace(/('[a-zA-Z0-9]')/g, "$1.charCodeAt(0)");

  // Convert #aaaaaa into color
  aCode = aCode.replace(/#([a-f0-9]{6})/ig, function(m, hex){
    var num = toNumbers(hex);
    return "color(" + num[0] + "," + num[1] + "," + num[2] + ")";
  });

  function toNumbers( str ){
    var ret = [];
     str.replace(/(..)/g, function(str){
      ret.push( parseInt( str, 16 ) );
    });
    return ret;
  }

  //aCode = aCode.replace(/(extends \w+) }\);/g, "$1 {\n  ");
  //aCode = aCode.replace(/(class \w+) }\);/g, "$1 {\n  ");
  //aCode = aCode.replace(/}\);function/g, "}\n  function");

  // Clean up extra spaces after var
  aCode = aCode.replace(/var  /g, "var ");
  // rename top-level Processing methods
  aCode = aCode.replace(/Processing.\w+\s*=\s*/g, "");

  // Find end of top-level class declaration   
  var matchFirstClass = /([\w\W]+?)\s+class\s+(\w+)/m;
  if (result = aCode.match(matchFirstClass)) {
    aCode = aCode.replace(matchFirstClass, "$1}\n\nclass $2");
  } else {
    aCode = aCode + '}';
  }

  // new ArrayList(...) -> new ArrayList(...).array
  aCode = aCode.replace(/(new\s+ArrayList[^\)]+?\))/mg, "$1.array");

  // Fix up type annotations
  var rename = ['int', 'float'];
  for (var i = 0; i < rename.length; i++) {
     var name = rename[i];
     var findrename = new RegExp('([ =])(' + name + '\s*?\\()', 'g');
     aCode = aCode.replace(findrename, "$1_$2");
  }

  // :float, :int -> :number
  aCode = aCode.replace(/:(float|int)/mg, ":number");

  // "float", "int" -> :number
  aCode = aCode.replace(/"(float|int)"/mg, '"number"');

  // Make sure classes end with }}
  aCode = aCode.replace(/}\n\n}/g, "}}");

  // Add comments before function declarations
  aCode = aCode.replace(/function/g, "//BEGIN FUNCTION\nfunction");


  // Add top-level class declaration 
  aCode = 'class processingmain extends processing {\n' + aCode;

  // Clean up class xxx });
  aCode = aCode.replace(/(class \w+ .+?)}\);/g, "$1{\n");

  // Clean up   });//BEGIN FUNCTION
  aCode = aCode.replace(/\s+}\);(\/\/BEGIN FUNCTION)/g, "\n}\n$1");
//log(aCode);

  return aCode;
};

var parse = Processing.parse = function parse( aCode, p ) {
  var aCode = Processing.parsejs(aCode);  

  //print('raw js ' + aCode);


  // chunk into classes based on }} closing marker.
  var matchClasses = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{([\s\S]+?)}}/mg;

  var classes = [];

  var processClass = function(all, name, extend, body) {
    classes.push('<class name="' + name + '"' + 
                 (extend ? ' extends="' + extend + '"' : '') + 
                 '>' + body + '\n}\n</class>')
  }
  aCode.replace(matchClasses, processClass);

  classes = Processing.processClasses(classes);

  return '<canvas>\n<include href="processing.lzx"/>\n' + classes.join('\n') + '<processingmain width="200" height="200"/></canvas>';
}

var processClasses = Processing.processClasses = function processClasses( classes ) {

  for (var i = 0; i < classes.length; i++) {
    var clas = classes[i];
    var methods = []
    var attributes = []; 
    var initializers = []; 

    //print('class ' + clas); 

  // chunk into methods  
  var matchFunctions = /function\s+(\w+)\s*\(([^\)]*)\)\s*{([\s\S]+?)}\s*(\/\/BEGIN FUNCTION|<\/class)/mg;
  var processFunction = function(all, name, args, body, after) {
    // Add back missing closing } if needed
    var leftbraces = body.match(/{/g);
    leftbraces = leftbraces ? leftbraces.length : 0;
    var rightbraces = body.match(/}/g);
    rightbraces = rightbraces ? rightbraces.length : 0;
    if (rightbraces != leftbraces) {
        body += '\n}';
    }

    // make sure new calls are in the right scope
    body = body.replace(/(=\s+new\s+)/g, '$1lz.'); 

    var o = '<method name="' + name + '"' + 
                 (args ? ' args="' + args + '"' : '') +
                 '><![CDATA[' + body + '\n]]></method>';
    methods.push(o)
    return o;
  }
  clas = clas.replace(matchFunctions, processFunction);
  
  // isolate attributes  
  attrs = clas.replace(/\<method[^>][\s\S]+?<\/method>/mg, '');
  //print ('before: ' + clas);
  attrs = attrs.replace(/<(\/)*class[^>]*>/g, ''); 


  var matchAttrs = /var\s+(\w+)\s*:*\s*(\w+)?(\s*=\s*)?([^;]*);/g;
  var processAttribute = function(all, name, type, assign, val) {
    if ( (val.indexOf('new ') != -1) || (type != 'number') ){
        //val = null;
        if (assign) {
            initializers.push('this.' + name + assign + val);
        } else {
            initializers.push('this.' + name + ' = new lz.' + type + '()');
        }
        type = 'expression'; 
        val = null;
    } else if (type == 'number' && isNaN(Number(val))) {
        initializers.push('this.' + name + assign + val);
        val = null
    }
    attributes.push('<attribute name="' + name + '"' + (type ? ' type="' + type + '"': '') + (val ? ' value="' + val + '"' : '') + '/>');
    //print("attribute " + all + '\n' + attributes[attributes.length - 1]);
  }
  attrs = attrs.replace(matchAttrs, processAttribute);

  var constructor = '<method name="init">\n' + initializers.join('\n') + '\n</method>\n';

  var opentag = clas.match(/(<class[^>]*>)/);

  var out = opentag[0] + '\n' + attributes.join('\n') + '\n' + constructor + methods.join('\n') + '\n</class>\n';
  classes[i] = out;
  }
  return classes;
}

})();
