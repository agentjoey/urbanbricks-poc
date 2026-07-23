#!/usr/bin/env node
/**
 * verify:image-label — build-time allowlist for ancestors of RenderImage /
 * ContextPhoto.
 *
 * Three rounds of blocklist scanning proved that enumerating the spellings an
 * author may not use is a losing game: each round closed the idiom named and
 * left its neighbours. This scanner inverts the policy to a closed allowlist:
 * every class token on every ancestor of a labelled image must match one of
 * the allowed patterns below. Anything not listed is rejected by default, so
 * a novel spelling cannot walk past the gate.
 *
 * Honest limits:
 *   - Only static className content is inspected: string literals, and the
 *     literal class names inside cn/clsx/classNames arguments. Runtime
 *     expressions, imported variables, inline styles, injected <style> blocks,
 *     and non-ancestor DOM manipulation remain possible escape routes and are
 *     documented as residual gaps in render-image.tsx.
 *   - A class applied inside a custom wrapper component is only caught when
 *     the wrapper is defined in the same file and the class is on its root
 *     returned JSX element, or on the JSX call's own className prop. Wrappers
 *     that pass children deeper, build className from props/state, or live in
 *     another file are out of scope.
 *   - The allowlist deliberately allows some classes that can, in malicious
 *     combination, hide a caption (e.g. an opacity-0/opacity-100 pair, or
 *     overflow-hidden with a fixed height). Those combinations are documented
 *     limits, not guarantees. The scanner's job is to stop accidental hiding
 *     and novel spellings; intentional evasion is still possible.
 *
 * Escape hatch: a JSX element may carry `data-image-label-exempt` to skip the
 * check for that element. Use it for legitimate exceptions and grep for it in
 * reviews.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoots = [path.join(root, "src")];

const TARGETS = new Set(["RenderImage", "ContextPhoto"]);

const EXEMPT_ATTR = "data-image-label-exempt";

const DISPLAY_VALUES = new Set([
  "block",
  "inline",
  "inline-block",
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row-group",
  "table-row",
  "list-item",
  "contents",
  "flow-root",
]);

const ALLOWED_VARIANTS = [
  /^(sm|md|lg|xl|2xl|max-sm|max-md|max-lg|max-xl|max-2xl)$/,
  /^(hover|focus|focus-visible|focus-within|active|disabled|visited|target|checked|indeterminate|default|required|valid|invalid|placeholder-shown|placeholder|read-only|read-write|autofill|first|last|only|odd|even|first-line|first-letter|before|after|selection|marker|file)$/,
  /^(group|peer)(-(hover|focus|focus-visible|active|disabled|checked|indeterminate|required|valid|invalid|placeholder-shown|read-only|read-write|open|default|first|last|only|odd|even))?$/,
  /^(motion-safe|motion-reduce)$/,
  /^dark$/,
  /^(supports|not)-.+$/,
  /^aria-.+/,
  /^data-.+/,
  /^open$/,
  /^default$/,
  /^(ltr|rtl)$/,
];

const ALLOWED_BASE = [
  /^cell-span-\d+$/,
  /^grid-modules$/,
  // Project primitives that hide nothing. ink-surface is the dark-band scope
  // this component is explicitly designed to sit inside (see render-image.tsx);
  // group/peer as bare base tokens mark a hover/focus scope for descendants.
  // Rejecting these forced authors toward data-image-label-exempt on ordinary
  // dark heroes and hover cards, which trains the check into being disabled.
  /^ink-surface$/,
  /^(group|peer)$/,
  /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|list-item|contents|flow-root)$/,
  /^flex-.*$/,
  /^grid-.*$/,
  /^auto-cols-.*$/,
  /^auto-rows-.*$/,
  /^col-.*$/,
  /^row-.*$/,
  /^(items|justify|justify-items|justify-self|self|place|content|order)-.*$/,
  /^(gap|gap-x|gap-y|space-x|space-y)-.*$/,
  /^visible$/,
  /^(static|fixed|absolute|relative|sticky)$/,
  /^(top|bottom|left|right|inset|inset-x|inset-y|start|end)-.+$/,
  /^z-.+$/,
  /^(box-border|box-content)$/,
  /^(w|h|min-w|min-h|max-w|max-h)-.+$/,
  /^(m|mx|my|mt|mb|ml|mr|ms|me|p|px|py|pt|pb|pl|pr|ps|pe)-.+$/,
  /^(border|rounded|divide|ring|outline)(-.*)?$/,
  /^bg(-.*)?$/,
  /^text-(balance|wrap|nowrap|left|center|right|justify|start|end|ellipsis|clip)$/,
  /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|display|headline|title|body|label)$/,
  /^text-[a-z][a-z0-9-]*$/,
  /^font-.*$/,
  /^leading-.*$/,
  /^tracking-.*$/,
  /^(antialiased|subpixel-antialiased|italic|not-italic|underline|overline|line-through|no-underline|uppercase|lowercase|capitalize|normal-case|truncate|text-ellipsis|text-clip|break-normal|break-words|break-all|break-keep|whitespace-normal|whitespace-nowrap|whitespace-pre|whitespace-pre-line|whitespace-pre-wrap|hyphens-none|hyphens-manual|hyphens-auto|tabular-nums|lining-nums|oldstyle-nums|proportional-nums)$/,
  /^opacity-100$/,
  /^(shadow|mix-blend|bg-blend|filter|backdrop|transition|duration|ease|delay|will-change|transform|scale|rotate|translate|skew|origin)(-.*)?$/,
  /^(cursor|pointer-events|select-none|select-text|select-all|select-auto|resize|scroll-.*|snap-.*|touch-.*|appearance-none)$/,
  /^(container|clear-.*|float-.*|object-.*|overflow-.*|overscroll-.*|isolate|isolation-auto|aspect-.*|columns-.*|box-decoration-.*)$/,
  /^not-sr-only$/,
];

const DENIED_BASE = [
  /^sr-only$/,
  /^text-transparent$/,
  /^text-\[.*\]$/,
  /^invisible$/,
  /^collapse$/,
  /^h-0$/,
  /^max-h-0$/,
  /^min-h-0$/,
];

function tokenWithoutImportant(token) {
  return token.replace(/!/g, "");
}

function splitToken(token) {
  const parts = token.split(":");
  const base = parts.pop();
  return { variants: parts, base };
}

function isAllowedVariant(variant) {
  return ALLOWED_VARIANTS.some((re) => re.test(variant));
}

function isAllowedBase(base, allTokens) {
  if (DENIED_BASE.some((re) => re.test(base))) return false;
  if (base === "hidden") {
    return allTokens.some((raw) => {
      const t = tokenWithoutImportant(raw);
      const { variants, base: b } = splitToken(t);
      return DISPLAY_VALUES.has(b) && variants.length > 0;
    });
  }
  if (base === "opacity-0") {
    return allTokens.some((raw) => {
      const t = tokenWithoutImportant(raw);
      const { base: b } = splitToken(t);
      return b === "opacity-100";
    });
  }
  return ALLOWED_BASE.some((re) => re.test(base));
}

function classNameIsAllowed(cls) {
  const tokens = cls.trim().split(/\s+/).filter(Boolean);
  for (const raw of tokens) {
    const token = tokenWithoutImportant(raw);
    if (!token) continue;
    const { variants, base } = splitToken(token);
    if (!base) return { ok: false, token: raw, reason: "unparseable token" };
    for (const v of variants) {
      if (!isAllowedVariant(v)) {
        return { ok: false, token: raw, reason: `disallowed variant "${v}"` };
      }
    }
    if (!isAllowedBase(base, tokens)) {
      if (base === "hidden") {
        return { ok: false, token: raw, reason: "unconditional hidden" };
      }
      if (base === "opacity-0") {
        return { ok: false, token: raw, reason: "unpaired opacity-0" };
      }
      return { ok: false, token: raw, reason: "class not on allowlist" };
    }
  }
  return { ok: true };
}

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
 * names (including string literals in conditionals and object-literal keys),
 * array literals, plus-joined strings, and template literals (static spans
 * only). Object-literal keys whose value is the literal `false` are skipped,
 * because they are not applied.
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
        if (expr.left.kind === ts.SyntaxKind.FalseKeyword) {
          // false && x is never applied
          return;
        }
        if (expr.left.kind === ts.SyntaxKind.TrueKeyword && kind === ts.SyntaxKind.BarBarToken) {
          // true || x is never applied
          return;
        }
        collect(expr.left);
        collect(expr.right);
      }
      return;
    }
    if (ts.isConditionalExpression(expr)) {
      if (expr.condition.kind === ts.SyntaxKind.TrueKeyword) {
        collect(expr.whenTrue);
      } else if (expr.condition.kind === ts.SyntaxKind.FalseKeyword) {
        collect(expr.whenFalse);
      } else {
        collect(expr.whenTrue);
        collect(expr.whenFalse);
      }
      return;
    }
    if (ts.isObjectLiteralExpression(expr)) {
      for (const prop of expr.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        if (prop.initializer.kind === ts.SyntaxKind.FalseKeyword) continue;
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
  let hasExempt = false;
  let classAttr = null;
  for (const prop of opening.attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue;
    const name = prop.name.getText(sourceFile);
    if (name === EXEMPT_ATTR) hasExempt = true;
    if (name === "className") classAttr = prop;
  }
  return hasExempt ? null : classAttr;
}

function isJsxNode(node) {
  return (
    ts.isJsxElement(node) ||
    ts.isJsxSelfClosingElement(node) ||
    ts.isJsxFragment(node)
  );
}

function unwrapParentheses(node) {
  let n = node;
  while (ts.isParenthesizedExpression(n)) {
    n = n.expression;
  }
  return n;
}

function isFunctionLike(node) {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

function isScopeNode(node) {
  return (
    ts.isBlock(node) ||
    ts.isCaseClause(node) ||
    ts.isDefaultClause(node) ||
    ts.isForStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isCatchClause(node) ||
    isFunctionLike(node)
  );
}

function isBinding(node) {
  const p = node.parent;
  if (!p) return false;
  if (ts.isVariableDeclaration(p) && p.name === node) return true;
  if (ts.isParameter(p) && p.name === node) return true;
  if (ts.isBindingElement(p) && p.name === node) return true;
  if (ts.isCatchClause(p) && p.variableDeclaration === node) return true;
  if (ts.isImportSpecifier(p) && p.name === node) return true;
  if (ts.isImportClause(p) && p.name === node) return true;
  if (ts.isJsxOpeningElement(p) && p.tagName === node) return true;
  if (ts.isJsxSelfClosingElement(p) && p.tagName === node) return true;
  if (ts.isJsxAttribute(p) && p.name === node) return true;
  if (ts.isPropertyAccessExpression(p) && p.name === node) return true;
  if (ts.isPropertyAssignment(p) && p.name === node) return true;
  if (ts.isEnumMember(p) && p.name === node) return true;
  return false;
}

function tagName(node, sourceFile) {
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText(sourceFile);
  if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText(sourceFile);
  return null;
}

function isTargetElement(node, sourceFile) {
  const name = tagName(node, sourceFile);
  return name !== null && TARGETS.has(name);
}

function findReturnJsx(body) {
  if (isJsxNode(body)) return body;
  if (!ts.isBlock(body)) return null;
  let found = null;
  function search(node) {
    if (found) return;
    if (isFunctionLike(node)) return;
    if (
      ts.isReturnStatement(node) &&
      node.expression &&
      isJsxNode(node.expression)
    ) {
      found = node.expression;
      return;
    }
    ts.forEachChild(node, search);
  }
  search(body);
  return found;
}

function scanFile(file) {
  const source = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );

  const directTargets = [];
  const usageNodes = [];
  const componentReturns = new Map();
  const scopes = [];

  function enterScope() {
    scopes.push(new Map());
  }
  function exitScope() {
    scopes.pop();
  }
  function currentScope() {
    return scopes[scopes.length - 1];
  }
  function recordTarget(name, node) {
    currentScope().set(name, node);
  }
  function lookupTarget(name) {
    for (let i = scopes.length - 1; i >= 0; i--) {
      if (scopes[i].has(name)) return scopes[i].get(name);
    }
    return null;
  }

  function visitor(node) {
    const isScope = isScopeNode(node);
    if (isScope) enterScope();

    if (ts.isFunctionDeclaration(node) && node.name) {
      const ret = findReturnJsx(node.body);
      if (ret) componentReturns.set(node.name.text, ret);
    }

    if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
      const init = node.initializer ? unwrapParentheses(node.initializer) : null;
      if (init && isJsxNode(init) && isTargetElement(init, sourceFile)) {
        recordTarget(node.name.text, init);
      }
    }

    if (ts.isIdentifier(node) && !isBinding(node)) {
      const target = lookupTarget(node.text);
      if (target) usageNodes.push(node);
    }

    if (isTargetElement(node, sourceFile)) {
      directTargets.push(node);
    }

    ts.forEachChild(node, visitor);

    if (isScope) exitScope();
  }

  enterScope();
  visitor(sourceFile);
  exitScope();

  const failures = [];
  const seen = new Set();

  function report(opening, cls, result, context) {
    const { line } = ts.getLineAndCharacterOfPosition(
      sourceFile,
      opening.getStart(sourceFile),
    );
    const key = `${line + 1}:${cls}:${result.token}:${context || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    failures.push({
      file: path.relative(root, file),
      line: line + 1,
      token: result.token,
      className: cls,
      reason: result.reason,
      context,
    });
  }

  function checkOpening(opening, context) {
    const attr = findClassNameAttr(opening, sourceFile);
    if (!attr) return;
    const cls = staticClassName(attr, sourceFile);
    if (!cls) return;
    const result = classNameIsAllowed(cls);
    if (!result.ok) {
      report(opening, cls, result, context);
    }
  }

  function inspectAncestors(startNode, context) {
    let current = startNode.parent;
    while (current) {
      if (isFunctionLike(current)) break;
      if (ts.isJsxElement(current)) {
        checkOpening(current.openingElement, context);
      } else if (ts.isJsxSelfClosingElement(current)) {
        checkOpening(current, context);
      }
      current = current.parent;
    }
  }

  function inspectComponentReturn(ret, name) {
    let current = ret;
    while (current) {
      if (isFunctionLike(current)) break;
      if (ts.isJsxElement(current)) {
        checkOpening(current.openingElement, `inside ${name}`);
      } else if (ts.isJsxSelfClosingElement(current)) {
        checkOpening(current, `inside ${name}`);
      }
      current = current.parent;
    }
  }

  function maybeInspectComponentWrapper(opening) {
    const tag = opening.tagName;
    if (!ts.isIdentifier(tag)) return;
    const name = tag.text;
    if (name[0] !== name[0].toUpperCase()) return;
    const ret = componentReturns.get(name);
    if (ret) inspectComponentReturn(ret, name);
  }

  function inspectWithComponentWrappers(startNode) {
    inspectAncestors(startNode);
    // Also look at wrapper components defined in this file.
    let current = startNode.parent;
    while (current) {
      if (isFunctionLike(current)) break;
      if (ts.isJsxElement(current)) {
        maybeInspectComponentWrapper(current.openingElement);
      } else if (ts.isJsxSelfClosingElement(current)) {
        maybeInspectComponentWrapper(current);
      }
      current = current.parent;
    }
  }

  for (const node of directTargets) {
    // If the target is immediately assigned to a variable, its ancestors are
    // inspected through the variable usages instead.
    let current = node.parent;
    while (current) {
      if (ts.isVariableDeclaration(current) || ts.isBindingElement(current)) {
        break;
      }
      current = current.parent;
    }
    if (current) continue;
    inspectWithComponentWrappers(node);
  }

  for (const ident of usageNodes) {
    inspectWithComponentWrappers(ident);
  }

  return failures;
}

const failures = [];

for (const dir of scanRoots) {
  for (const file of walk(dir)) {
    failures.push(...scanFile(file));
  }
}

if (failures.length > 0) {
  failures.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });

  console.error(
    `verify:image-label — ${failures.length} ancestor wrapper(s) carry a disallowed class:\n`,
  );
  for (const { file, line, token, className, reason, context } of failures) {
    console.error(`  ${file}:${line}`);
    console.error(`    token:   ${token}`);
    console.error(`    reason:  ${reason}`);
    if (context) console.error(`    context: ${context}`);
    console.error(`    className: ${className}`);
    console.error();
  }
  console.error(
    "Remove the disallowed class, or add data-image-label-exempt to the element if it is a genuine exception.\n",
  );
  process.exit(1);
}

console.log("verify:image-label — all ancestor classes are on the allowlist.");
