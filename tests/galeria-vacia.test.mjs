import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/components/ImagenesObra.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source + '\nexport { GaleriaObra };', { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
function text(element) {
  if (Array.isArray(element)) return element.map(text).join(' ');
  if (typeof element === 'string') return element;
  return element && typeof element === 'object' ? text(element.props?.children) : '';
}

test('la galería vacía informa al público y solo invita a cargar al administrador', () => {
  for (const permitirCarga of [false, true]) {
    let state = 0;
    const exports = {};
    runInNewContext(outputText, { exports, require: id => {
      if (id === 'react') return { useEffect() {}, useRef: () => ({ current: null }), useState: initial => [state++ === 2 ? false : initial, () => {}] };
      if (id === '@/lib/imagenes') return {};
      return require(id);
    }});
    const rendered = text(exports.GaleriaObra({ obraId: 1, nombre: 'Obra de prueba', regionId: 'galeria', permitirCarga }));
    assert.match(rendered, /Esta obra aún no tiene fotografías/);
    if (permitirCarga) assert.match(rendered, /Puedes agregar fotografías desde el formulario/);
    else {
      assert.match(rendered, /Las fotografías estarán disponibles aquí cuando se incorporen/);
      assert.doesNotMatch(rendered, /Agrega imágenes|Puedes agregar|Guardar fotografías|Agregar fotografías/);
    }
  }
});
