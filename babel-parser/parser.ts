import { parse } from "@babel/parser";

const code = "2 + (4 * 10)";

const ast = parse(code);

console.log(ast);

const [statement] = ast.program.body;

if (
  statement.type === "ExpressionStatement" &&
  statement.expression.type === "BinaryExpression" &&
  statement.expression.left.type === "NumericLiteral" &&
  statement.expression.right.type === "BinaryExpression" &&
  statement.expression.right.left.type === "NumericLiteral" &&
  statement.expression.right.right.type === "NumericLiteral"
) {
  console.log(statement.expression.left.value);
  console.log(statement.expression.right.left.value);
  console.log(statement.expression.right.right.value);
}
