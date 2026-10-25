/*
  @license
	Rollup.js v4.65.0
	Thu, 22 Oct 2026 08:51:29 GMT - commit 9aac09a39dc1fa297a7b06f1ad6907f7bd41b310

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const rollup = require('./shared/rollup.js');
const rollup_js = require('./shared/node-entry.js');
require('./shared/parseAst.js');
require('./native.js');
require('node:path');
require('node:process');
require('path');
require('node:perf_hooks');
require('node:fs/promises');
require('./shared/fsevents-importer.js');



exports.defineConfig = rollup.defineConfig;
exports.rollup = rollup.rollup;
exports.VERSION = rollup_js.VERSION;
exports.watch = rollup_js.watch;
//# sourceMappingURL=rollup.js.map
