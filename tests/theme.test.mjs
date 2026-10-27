import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(name, theme) {
  const source = readFileSync(new URL(`../src/components/${name}.tsx`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  const exports = {};
  runInNewContext(outputText, { exports, require: id => id === 'next-themes' ? theme : require(id) });
  return exports.default;
}

test('el selector alterna entre claro y oscuro, incluso antes de resolver el tema', () => {
  for (const [resolvedTheme, expected] of [[undefined, 'dark'], ['light', 'dark'], ['dark', 'light']]) {
    let chosen;
    const Toggle = load('ThemeToggle', { useTheme: () => ({ resolvedTheme, setTheme: value => { chosen = value; } }) });
    const button = Toggle();
    assert.equal(button.type, 'button');
    assert.ok(button.props['aria-label']);
    button.props.onClick();
    assert.equal(chosen, expected);
  }
});

test('el proveedor comparte el tema mediante la clase que utiliza el mapa', () => {
  const Provider = load('ThemeProvider', { ThemeProvider: () => null });
  const element = Provider({ children: 'contenido' });
  assert.equal(element.props.attribute, 'class');
  assert.equal(element.props.defaultTheme, 'light');
  assert.equal(element.props.children, 'contenido');
});
