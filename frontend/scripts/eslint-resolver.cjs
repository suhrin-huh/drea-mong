const path = require('node:path');
const nodeResolver = require('eslint-import-resolver-node');

exports.interfaceVersion = 2;
exports.resolve = (source, file) =>
  nodeResolver.resolve(source.startsWith('@/') ? path.join(__dirname, '../src', source.slice(2)) : source, file, {
    extensions: ['.js', '.jsx', '.json', '.svg', '.png', '.jpg', '.css'],
  });
