import { Transform, JSXAttribute } from "jscodeshift";
import * as path from "path";
import * as prettier from "prettier";

const transform: Transform = (fileInfo, api) => {
  const j = api.jscodeshift;

  const root = j(fileInfo.source);

  let fileContainsButton = false;

  root
    .findJSXElements("button")
    .filter(({ node }) => {
      return !!node?.openingElement?.attributes?.find(
        (attribute: any) =>
          attribute.type === "JSXAttribute" &&
          attribute.name.type === "JSXIdentifier" &&
          attribute.name.name === "className" &&
          attribute.value?.type === "StringLiteral" &&
          attribute.value.value.split(" ").includes("button")
      );
    })
    .replaceWith(({ node }) => {
      fileContainsButton = true;

      const newProps: JSXAttribute[] = [];

      node?.openingElement?.attributes?.forEach((attribute) => {
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
                    j.jsxAttribute(
                      j.jsxIdentifier("variant"),
                      j.stringLiteral(variant)
                    )
                  );
                }

                if (classNames.includes("button--block")) {
                  newProps.push(j.jsxAttribute(j.jsxIdentifier("block")));
                }
                break;
              }
            case "onClick":
              newProps.push(attribute);
              break;
          }
        }
      });

      node.openingElement = j.jsxOpeningElement(
        j.jsxIdentifier("Button"),
        newProps
      );
      node.closingElement = j.jsxClosingElement(j.jsxIdentifier("Button"));
      return node;
    });

  if (fileContainsButton) {
    const relativePathToButtonComponent = path.relative(
      path.dirname(fileInfo.path),
      "../flash-cards/src/components/Button/Button.js"
    );

    const buttonComponentImport = j.importDeclaration(
      [j.importSpecifier(j.identifier("Button"), j.identifier("Button"))],
      j.stringLiteral(relativePathToButtonComponent)
    );

    root.get().node.program.body.unshift(buttonComponentImport);

    return prettier.format(root.toSource(), {
      filepath: fileInfo.path,
    });
  } else {
    return null;
  }
};

export default transform;
