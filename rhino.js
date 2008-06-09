load('processingparser.js')
var source = readFile(arguments[0]);
print(Processing.parse(source));
