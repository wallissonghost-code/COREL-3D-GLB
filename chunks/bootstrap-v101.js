import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const files = [
  'app-v101-part1.txt',
  'app-v101-part2.txt',
  'app-v101-part3.txt',
  'app-v101-part4.txt',
  'app-v101-part5.txt',
  'app-v101-part6.txt',
  'app-v1032-viewfix.txt',
  'app-v104-agent.txt',
  'app-v105-multiselect.txt',
  'app-v106-drag-delete.txt',
  'app-v107-arrows-multiglb.txt',
  'app-v108-undo.txt',
  'app-v109-redo-history-copy.txt',
  'app-v110-stability.txt',
  'app-v111-gizmo-group-snap.txt',
  'app-v112-mobile-controls.txt',
  'app-v113-align-smartsnap-measure.txt',
  'app-v114-boolean.txt',
  'app-v115-autosave-pivot-pointmeasure.txt',
  'app-v116-hand3d.txt',
  'app-v117-hand3d-stability.txt'
];

const optionalFiles = new Set([
  'app-v116-hand3d.txt',
  'app-v117-hand3d-stability.txt'
]);

try {
  const loaded = await Promise.all(files.map(async name => {
    const url = new URL(`${name}?v=122`, import.meta.url);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar ${url.pathname}: HTTP ${response.status}`);
    return { name, code: await response.text() };
  }));

  const valid = [];
  const skipped = [];
  let handBaseAvailable = true;

  for (const item of loaded) {
    if (item.name === 'app-v117-hand3d-stability.txt' && !handBaseAvailable) {
      skipped.push(`${item.name} (dependência Hand 3D indisponível)`);
      continue;
    }
    try {
      // Apenas valida sintaxe. A execução real continua em um único eval para
      // preservar o mesmo escopo lexical compartilhado entre todos os chunks.
      new Function(item.code);
      valid.push(item);
    } catch (syntaxError) {
      console.error(`Erro de sintaxe em ${item.name}:`, syntaxError);
      if (!optionalFiles.has(item.name)) {
        throw new Error(`${item.name}: ${syntaxError?.message || syntaxError}`);
      }
      skipped.push(`${item.name}: ${syntaxError?.message || syntaxError}`);
      if (item.name === 'app-v116-hand3d.txt') handBaseAvailable = false;
    }
  }

  eval(valid.map(x => x.code).join('\n'));

  if (skipped.length) {
    console.warn('COREL 3D iniciou sem módulos opcionais:', skipped);
    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Editor carregado. Hand 3D foi isolado por erro de sintaxe; restante do editor está disponível.';
      status.className = 'status warn';
    }
  }
} catch (error) {
  console.error('Falha ao iniciar COREL 3D:', error);
  const status = document.getElementById('status');
  if (status) {
    status.textContent = 'ERRO AO CARREGAR O MOTOR 3D: ' + (error?.message || error);
    status.className = 'status error';
  }
}
