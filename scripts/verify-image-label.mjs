#!/usr/bin/env node
/**
 * verify:image-label — build-time guard against hiding the RenderImage /
 * ContextPhoto caption from the outside.
 *
 * The component itself already hardens the <figcaption> and closes the prop
 * surface (RenderImageClassName is a closed union, labels are private
 * constants). Those defences are compile-time. This scanner catches some of
 * the static escape routes an author can still write around the component:
 * ancestor wrappers that suppress the caption with Tailwind idioms such as
 * `[&_figcaption]:hidden`, `sr-only`, `text-transparent`, `opacity-0`,
 * `text-[0px]`, `hidden`, or a fixed-height `overflow-hidden` clip box.
 *
 * It walks the JSX source, finds every <RenderImage> and <ContextPhoto>,
 * inspects ancestor JSX elements' className attributes, and fails loudly
 * with file and line. Exits non-zero on any match; safe for CI.
 *
 * Honest limits:
 *   - Only static className content is inspected: string literals, and the
 *     literal class names that appear inside cn/clsx/classNames arguments
 *     (including string literals in conditionals and object-literal keys).
 *     Anything built from a runtime expression, imported variable, or value
 *     this walker cannot read can still hide the caption; this check is a
 *     coarse net, not a theorem prover.
 *   - Responsive display stacks such as `hidden md:block` are treated as
 *     legitimate layout and are not flagged; an unconditional `hidden` is.
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
 * Return a RegExp that matches a Tailwind class token, optionally preceded by
 * the `[&_figcaption]:` arbitrary-variant prefix. Tokens are space-delimited,
 * so we anchor on whitespace/start/end rather than \b (which fails after
 * characters such as `]` in arbitrary values).
 */
function tokenPattern(token) {
  return new RegExp(`(?:^|\\s|\\[&_figcaption\\]:)${token}(?=\\s|$)`);
}

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
    test: (cls) =>
      tokenPattern("sr-only").test(cls) &&
      !tokenPattern("(?:sm|md|lg|xl|2xl):not-sr-only").test(cls),
  },
  {
    name: "text-transparent",
    test: (cls) => tokenPattern("text-transparent").test(cls),
  },
  {
    name: "opacity-0",
    test: (cls) => tokenPattern("opacity-0").test(cls),
  },
  {
    name: "text-[0px]",
    test: (cls) => tokenPattern("text-\\[0px\\]").test(cls),
  },
  {
    name: "hidden / hidden! (unconditional)",
    test: (cls) => {
      // Match an ancestor `hidden`/`hidden!` as a whole class token. The
      // descendant-selector form `[&_figcaption]:hidden` has its own idiom
      // above; `overflow-hidden` must not be treated as `hidden`. Responsive
      // stacks such as `hidden md:block` are legitimate layout.
      const match = cls.match(/(?:^|\s)hidden!?(?=\s|$)/);
      if (!match) return false;
      return !tokenPattern("(?:sm|md|lg|xl|2xl):(block|inline|inline-block|flex|inline-flex|grid|inline-grid|table|contents)").test(cls);
    },
  },
  {
    name: "fixed-height overflow-hidden wrapper",
    test: (cls) => {
      const hasOverflow = tokenPattern("overflow-hidden").test(cls);
      if (!hasOverflow) return false;
      const fixedHeight = tokenPattern("(?!h-(?:full|screen|dvh|svh|min|max|fit|auto)\\b)h-\\S+");
      const fixedMaxHeight = tokenPattern("(?!max-h-(?:full|screen|dvh|svh|min|max|fit|auto|none)\\b)max-h-\\S+");
      return fixedHeight.test(cls) || fixedMaxHeight.test(cls);
    },
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
 * literals, cn/clsx/classNames calls whose arguments contain literal class
 * names (including inside conditionals and object-literal keys), array
 * literals, plus-joined strings, and template literals (static spans only).
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
    if (ts.isNoSubstitutionTemplateLiteral(expr)) {
      parts.push(expr.text);
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
    if (ts.isBinaryExpression(expr)) {
      const kind = expr.operatorToken.kind;
      if (kind === ts.SyntaxKind.PlusToken) {
        collect(expr.left);
        collect(expr.right);
      } else if (
        kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        kind === ts.SyntaxKind.BarBarToken
      ) {
        // Logical expressions like `flag && 'sr-only'`: the literal may be
        // applied, so collect string literals from either side.
        collect(expr.left);
        collect(expr.right);
      }
      return;
    }
    if (ts.isConditionalExpression(expr)) {
      collect(expr.whenTrue);
      collect(expr.whenFalse);
      return;
    }
    if (ts.isObjectLiteralExpression(expr)) {
      // clsx/cn object form: { 'sr-only': flag, block: other } — keys are
      // the candidate class names.
      for (const prop of expr.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const key = prop.name;
        if (!key) continue;
        if (ts.isIdentifier(key) || ts.isStringLiteral(key)) {
          parts.push(key.text);
        }
      }
      return;
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
