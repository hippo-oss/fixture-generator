'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const plugin = require('./fixture-transformer.transformer');
(0, tslib_1.__exportStar)(plugin, exports);

// @ts-ignore
exports.default = (program, options) => plugin.fixtureTransformer(program, options)
