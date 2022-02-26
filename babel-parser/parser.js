const { parse } = require("@babel/parser");

const code = "(2 + 4) * 10";

const ast = parse(code);

console.log(ast);

console.log(ast.program.body[0]);

console.log(ast.program.body[0].expression.left.value);
