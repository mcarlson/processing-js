load('install/WEB-INF/classes/processing/parser.js')
var source = readFile(arguments[0]);
print(Processing.parse(source));
