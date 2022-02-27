import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";
import * as glob from "glob";
import * as types from "@babel/types";
import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const files = glob.sync("../flash-cards/src/components/**/*.js");

files.forEach((file) => {
  const contents = fs.readFileSync(file).toString();

  const ast = parse(contents, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  let fileContainsButton = false;

  traverse(ast, {
    JSXElement({ node }) {
      const { openingElement, closingElement } = node;
      if (
        openingElement.name.type === "JSXIdentifier" &&
        openingElement.name.name === "button"
      ) {
        const hasButtonClassName = openingElement.attributes.find(
          (attribute) =>
            attribute.type === "JSXAttribute" &&
            attribute.name.type === "JSXIdentifier" &&
            attribute.name.name === "className" &&
            attribute.value?.type === "StringLiteral" &&
            attribute.value.value.split(" ").includes("button")
        );

        if (!hasButtonClassName) return;

        fileContainsButton = true;

        const newProps: types.JSXAttribute[] = [];

        openingElement.attributes.forEach((attribute) => {
          if (
            attribute.type === "JSXAttribute" &&
            attribute.name.type === "JSXIdentifier"
          ) {
            switch (attribute.name.name) {
              case "type":
                if (
                  attribute?.value?.type !== "StringLiteral" ||
                  attribute.value.value === "button"
                ) {
                  newProps.push(attribute);
                }
                break;
              case "className":
                if (attribute?.value?.type === "StringLiteral") {
                  const classNames = attribute.value.value.split(" ");

                  const variant = classNames
                    .find(
                      (className) =>
                        className.startsWith("button--") &&
                        className !== "button--block"
                    )
                    ?.replace("button--", "");

                  if (variant && variant !== "primary") {
                    newProps.push(
                      types.jsxAttribute(
                        types.jsxIdentifier("variant"),
                        types.stringLiteral(variant)
                      )
                    );
                  }

                  if (classNames.includes("button--block")) {
                    newProps.push(
                      types.jsxAttribute(types.jsxIdentifier("block"))
                    );
                  }
                  break;
                }
              case "onClick":
                newProps.push(attribute);
                break;
            }
          }
        });

        openingElement.name.name = "Button";
        openingElement.attributes = newProps;

        if (closingElement?.name?.type === "JSXIdentifier") {
          closingElement.name.name = "Button";
        }
      }
    },
  });

  if (fileContainsButton) {
    const relativePathToButtonComponent = path.relative(
      path.dirname(file),
      "../flash-cards/src/components/Button/Button.js"
    );

    const buttonComponentImport = types.importDeclaration(
      [
        types.importSpecifier(
          types.identifier("Button"),
          types.identifier("Button")
        ),
      ],
      types.stringLiteral(relativePathToButtonComponent)
    );

    ast.program.body.unshift(buttonComponentImport);
  }

  const { code } = generate(ast);

  const formattedCode = prettier.format(code, { filepath: file });

  fs.writeFileSync(file, formattedCode);
});
