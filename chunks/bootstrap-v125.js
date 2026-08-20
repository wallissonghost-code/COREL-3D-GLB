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

try {
  const loaded = await Promise.all(files.map(async name => {
    const url = new URL(`${name}?v=125`, import.meta.url);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar ${url.pathname}: HTTP ${response.status}`);
    return `\n/* ===== ${name} ===== */\n${await response.text()}`;
  }));

  const code = loaded.join('\n');
  try {
    new Function(code);
  } catch (syntaxError) {
    console.error('Erro de sintaxe no bundle concatenado COREL 3D:', syntaxError);
    throw new Error(`Bundle 3D: ${syntaxError?.message || syntaxError}`);
  }

  eval(code);
} catch (error) {
  console.error('Falha ao iniciar COREL 3D:', error);
  const status = document.getElementById('status');
  if (status) {
    status.textContent = 'ERRO AO CARREGAR O MOTOR 3D: ' + (error?.message || error);
    status.className = 'status error';
  }
}
