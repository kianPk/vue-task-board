/*
  @license
	Rollup.js v4.65.0
	Thu, 22 Oct 2026 08:51:29 GMT - commit 9aac09a39dc1fa297a7b06f1ad6907f7bd41b310

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

require('node:fs/promises');
require('node:path');
require('node:process');
require('node:url');
require('./shared/rollup.js');
require('./shared/parseAst.js');
const loadConfigFile_js = require('./shared/loadConfigFile.js');
require('path');
require('./native.js');
require('node:perf_hooks');
require('./getLogFilter.js');



exports.loadConfigFile = loadConfigFile_js.loadConfigFile;
//# sourceMappingURL=loadConfigFile.js.map
