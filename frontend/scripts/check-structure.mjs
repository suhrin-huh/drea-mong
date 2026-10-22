import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Linter } from 'eslint';

const root = fileURLToPath(new URL('../', import.meta.url));
const src = path.join(root, 'src');
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const slicedLayers = new Set(['pages', 'widgets', 'features', 'entities']);
const segments = new Set(['ui', 'model', 'api', 'lib', 'config', 'assets']);
const failures = [];
const graph = new Map();
const slash = (name) => name.split(path.sep).join('/');
const relative = (file) => slash(path.relative(src, file));
const fail = (file, message) => failures.push(`${relative(file)}: ${message}`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

// Verify actual directory entries as macOS may resolve a wrongly cased path.
function exactFile(file) {
  const parts = path.relative(src, file).split(path.sep);
  let current = src;
  for (const part of parts) {
    if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) return false;
    if (!fs.readdirSync(current).includes(part)) return false;
    current = path.join(current, part);
  }
  return fs.statSync(current).isFile();
}

function resolveLocal(from, specifier) {
  const base = specifier.startsWith('@/')
    ? path.join(src, specifier.slice(2))
    : path.resolve(path.dirname(from), specifier);
  return [base, `${base}.js`, `${base}.jsx`, path.join(base, 'index.js')].find(exactFile);
}

function checkImport(file, specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return;
  const target = resolveLocal(file, specifier);
  if (!target) {
    fail(file, `해석할 수 없는 경로: ${specifier}`);
    return;
  }
  graph.get(file).push(target);
  const fromParts = relative(file).split('/');
  const toParts = relative(target).split('/');
  if (file === path.join(src, 'main.jsx')) return;
  const fromLayer = layers.indexOf(fromParts[0]);
  const toLayer = layers.indexOf(toParts[0]);
  if (toLayer < 0 || fromLayer < 0) {
    fail(file, `FSD 외부 경로: ${specifier}`);
    return;
  }
  if (toLayer < fromLayer) fail(file, `상위 계층 역참조: ${specifier}`);
  if (fromLayer === toLayer && slicedLayers.has(fromParts[0])) {
    if (fromParts[1] !== toParts[1]) fail(file, `같은 계층의 다른 slice 참조: ${specifier}`);
    else {
      if (!specifier.startsWith('.')) fail(file, `slice 내부는 상대 경로 사용: ${specifier}`);
      if (toParts.length === 3 && toParts[2] === 'index.js') fail(file, '자기 공개 API 역참조');
    }
  }
  if (slicedLayers.has(toParts[0]) && (fromLayer !== toLayer || fromParts[1] !== toParts[1])) {
    if (toParts.length !== 3 || toParts[2] !== 'index.js') fail(file, `공개 API 우회: ${specifier}`);
    if (!specifier.startsWith('@/')) fail(file, `slice 외부는 alias 사용: ${specifier}`);
  }
}

const files = walk(src);
const codeFiles = files.filter((file) => /\.(js|jsx)$/.test(file));
const linter = new Linter();
let checkingFile;
linter.defineRule('structure', {
  create() {
    const file = checkingFile;
    return {
      ImportDeclaration: (node) => checkImport(file, node.source.value),
      ExportNamedDeclaration: (node) => {
        if (node.source) checkImport(file, node.source.value);
      },
      ExportAllDeclaration: () => fail(file, 'wildcard 재export 대신 명시적 공개 API 사용'),
      ImportExpression: (node) => {
        if (typeof node.source.value === 'string') checkImport(file, node.source.value);
        else fail(file, '동적 import 경로는 정적 문자열로 선언');
      },
      ExportDefaultDeclaration: (node) => {
        if (!file.endsWith('.jsx')) return;
        const name = node.declaration.name || node.declaration.id?.name;
        if (name !== path.basename(file, '.jsx')) fail(file, '컴포넌트 기본 export와 파일명 불일치');
      },
    };
  },
});

for (const file of files) {
  const parts = relative(file).split('/');
  for (const dir of parts.slice(0, -1)) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(dir)) fail(file, `폴더명 규칙 위반: ${dir}`);
  }
  if (file !== path.join(src, 'main.jsx') && !layers.includes(parts[0])) fail(file, '알 수 없는 최상위 계층');
  if (slicedLayers.has(parts[0])) {
    if (parts.length < 3 || (parts[2] !== 'index.js' && !segments.has(parts[2]))) fail(file, 'slice/segment 구조 위반');
    if (!exactFile(path.join(src, parts[0], parts[1], 'index.js'))) fail(file, 'slice 공개 API 누락');
  }
  const name = path.basename(file);
  const validName = name.endsWith('.jsx')
    ? /^[A-Z][A-Za-z0-9]*\.jsx$/.test(name) || name === 'main.jsx'
    : /^(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z]+)*|use[A-Z][A-Za-z0-9]*)\.[a-z0-9]+$/.test(name);
  if (!validName) fail(file, `파일명 규칙 위반: ${name}`);
}

for (const file of codeFiles) {
  checkingFile = file;
  graph.set(file, []);
  const messages = linter.verify(fs.readFileSync(file, 'utf8'), {
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    rules: { structure: 'error' },
  });
  for (const message of messages) fail(file, `${message.line}: ${message.message}`);
}

const visiting = new Set();
const visited = new Set();
function checkCycles(file, chain = []) {
  if (visiting.has(file)) {
    fail(file, `순환 import: ${[...chain, file].map(relative).join(' → ')}`);
    return;
  }
  if (visited.has(file)) return;
  visiting.add(file);
  for (const target of graph.get(file) || []) checkCycles(target, [...chain, file]);
  visiting.delete(file);
  visited.add(file);
}
for (const file of codeFiles) checkCycles(file);

// Public files have stable URLs; keep manifest and notification icon references valid.
for (const file of [
  path.join(root, 'vite.config.js'),
  path.join(root, 'public/firebase-messaging-sw.js'),
  path.join(root, 'index.html'),
]) {
  const content = fs.readFileSync(file, 'utf8');
  const urls = [...content.matchAll(/["']\/?([^"'\s]+\.(?:png|svg|ico))["']/g)];
  for (const [, url] of urls) {
    if (!url.startsWith('http') && !fs.existsSync(path.join(root, 'public', url))) {
      failures.push(`${path.relative(root, file)}: 없는 공개 자산 ${url}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`FSD 구조 검사 통과: ${codeFiles.length}개 JS/JSX, ${files.length - codeFiles.length}개 스타일·자산`);
}
