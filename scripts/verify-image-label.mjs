#!/usr/bin/env node
/**
 * verify:image-label — build-time guard against hiding the RenderImage /
 * ContextPhoto caption from the outside.
 *
 * The component itself already hardens the <figcaption> and closes the prop
 * surface (RenderImageClassName is a closed union, labels are private
 * constants). Those defences are compile-time. This scanner catches the
 * runtime escape routes an author can still write around the component:
 * ancestor wrappers that suppress the caption with Tailwind idioms such as
 * `[&_figcaption]:hidden`, `sr-only`, `opacity-0`, `text-[0px]`, or a
 * fixed-height `overflow-hidden` clip box.
 *
 * It walks the JSX source, finds every <RenderImage> and <ContextPhoto>,
 * inspects ancestor JSX elements' className attributes, and fails loudly
 * with file and line. Exits non-zero on any match; safe for CI.
 *
 * Honest limits:
 *   - Only static className strings are inspected (string literals, plus the
 *     common cn/clsx/classNames helpers with literal arguments). A className
 *     built from a runtime expression or imported variable can still hide the
 *     caption; this check is a coarse net, not a theorem prover.
 *   - Inline styles, runtime injected <style> blocks, and non-ancestor DOM
 *     manipulation are out of scope. Those are documented as residual gaps
 *     in render-image.tsx so the next reviewer does not assume completeness.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoots = [path.join(root, "src")];

const TARGETS = new Set(["RenderImage", "ContextPhoto"]);

/**
 * Idioms that hide or clip the mandatory caption when applied to an ancestor
 * of a labelled image component.
 */
const IDIOMS = [
  {
    name: "[&_figcaption]:hidden",
    test: (cls) => /\[&_figcaption\]:hidden/.test(cls),
  },
  {
    name: "sr-only",
    test: (cls) => /(^|\s)sr-only(\s|$)/.test(cls),
  },
  {
    name: "opacity-0",
    test: (cls) => /(^|\s)opacity-0(\s|$)/.test(cls),
  },
  {
    name: "text-[0px]",
    test: (cls) => /(^|\s)text-\[0px\](\s|$)/.test(cls),
  },
  {
    name: "hidden / hidden!",
    test: (cls) => /(^|\s)hidden!?(\s|$)/.test(cls),
  },
  {
    name: "fixed-height overflow-hidden wrapper",
    test: (cls) =>
      /(^|\s)overflow-hidden(\s|$)/.test(cls) &&
      /(^|\s)(?!h-(full|screen|dvh|svh|min|max|fit|auto)\b)(h-\S+|(?!max-h-(full|screen|dvh|svh|min|max|fit|auto|none)\b)max-h-\S+)(\s|$)/.test(cls),
  },
];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      yield* walk(full);
    } else if (s.isFile() && /\.(tsx|jsx)$/.test(entry)) {
      yield full;
    }
  }
}

/**
 * Extract a static className string from a JSX attribute. Handles string
 * literals, cn/clsx/classNames calls with literal arguments, array literals,
 * plus-joined strings, and template literals (static spans only).
 */
function staticClassName(attr, sourceFile) {
  if (!attr.initializer) return null;

  const parts = [];
  function collect(expr) {
    if (!expr) return;
    if (ts.isStringLiteral(expr)) {
      parts.push(expr.text);
      return;
    }
    if (ts.isJsxExpression(expr)) {
      collect(expr.expression);
      return;
    }
    if (ts.isTemplateExpression(expr)) {
      // Static spans only: dynamic expressions are ignored. This is enough
      // to catch literal suppression idioms written directly in source.
      parts.push(expr.head.text);
      for (const span of expr.templateSpans) {
        parts.push(span.literal.text);
      }
      return;
    }
    if (ts.isCallExpression(expr)) {
      const fn = expr.expression.getText(sourceFile);
      if (fn === "cn" || fn === "clsx" || fn === "classNames") {
        for (const arg of expr.arguments) collect(arg);
      }
      return;
    }
    if (ts.isArrayLiteralExpression(expr)) {
      for (const elem of expr.elements) collect(elem);
      return;
    }
    if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      collect(expr.left);
      collect(expr.right);
    }
  }

  collect(attr.initializer);
  return parts.length > 0 ? parts.join(" ") : null;
}

function findClassNameAttr(opening, sourceFile) {
  for (const prop of opening.attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue;
    const name = prop.name.getText(sourceFile);
    if (name === "className") return prop;
  }
  return null;
}

const failures = [];

for (const dir of scanRoots) {
  for (const file of walk(dir)) {
    const source = readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ true,
      ts.ScriptKind.TSX,
    );

    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = node.tagName.getText(sourceFile);
        if (TARGETS.has(tagName)) {
          let current = node.parent;
          while (current) {
            let opening = null;
            if (ts.isJsxElement(current)) {
              opening = current.openingElement;
            } else if (ts.isJsxOpeningElement(current)) {
              opening = current;
            }
            if (opening) {
              const attr = findClassNameAttr(opening, sourceFile);
              const cls = attr ? staticClassName(attr, sourceFile) : null;
              if (cls) {
                for (const { name, test } of IDIOMS) {
                  if (test(cls)) {
                    const { line } = ts.getLineAndCharacterOfPosition(
                      sourceFile,
                      opening.getStart(sourceFile),
                    );
                    failures.push({
                      file: path.relative(root, file),
                      line: line + 1,
                      idiom: name,
                      className: cls,
                    });
                  }
                }
              }
            }
            current = current.parent;
          }
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }
}

if (failures.length > 0) {
  failures.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });

  console.error(
    `verify:image-label — ${failures.length} ancestor wrapper(s) can hide a mandatory image label:\n`,
  );
  for (const { file, line, idiom, className } of failures) {
    console.error(`  ${file}:${line}`);
    console.error(`    idiom:    ${idiom}`);
    console.error(`    className: ${className}`);
    console.error();
  }
  console.error(
    "Move the suppression class away from the labelled image, or contact the component owner if the wrapper is genuine.\n",
  );
  process.exit(1);
}

console.log("verify:image-label — no ancestor suppression idioms found.");
