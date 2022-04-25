/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { resolve } from 'path';
import merge from 'lodash/merge';
import alias from '@rollup/plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import strip from '@rollup/plugin-strip';
import { terser } from 'rollup-plugin-terser';
import { wasm } from '@rollup/plugin-wasm';

const banner = `
/*!*************************************************************************
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. 
 **************************************************************************/
`;

const workspaceModules = resolve(__dirname, '../../node_modules');
const outputDir = resolve(__dirname, './dist');
const developmentMode = process.env.ROLLUP_WATCH === 'true';
const plugins = [
  alias({
    entries: [
      {
        find: 'debug',
        replacement: `${workspaceModules}/debug/src/browser.js`,
      },
    ],
  }),
  copy({
    targets: [
      {
        src: [`${workspaceModules}/@contentauth/toolkit/pkg/**/*.wasm`],
        dest: `${outputDir}/assets/wasm`,
      },
    ],
    copyOnce: false,
    flatten: true,
    verbose: true,
  }),
  wasm({
    maxFileSize: 1024000,
  }),
  nodeResolve({
    browser: true,
  }),
  commonjs(),
  typescript({ sourceMap: developmentMode }),
];

const files = [
  {
    input: {
      c2pa: 'index.ts',
    },
    output: {
      format: 'es',
    },
  },
  {
    input: {
      'c2pa.worker': 'worker.ts',
    },
    output: {
      format: 'umd',
    },
  },
];

export default files.reduce((acc, config) => {
  const suffix = config.output.format === 'es' ? 'esm.' : '';
  const baseConfig = merge({}, config, {
    output: {
      entryFileNames: `[name].${suffix}js`,
      dir: outputDir,
      banner,
    },
  });
  acc.push(
    merge({}, baseConfig, {
      output: {
        sourcemap: 'inline',
      },
      plugins,
    }),
  );
  if (!developmentMode) {
    acc.push(
      merge({}, baseConfig, {
        output: {
          entryFileNames: `[name].${suffix}min.js`,
        },
        plugins: [
          ...plugins,
          strip({
            functions: ['dbg'],
          }),
          terser(),
        ],
      }),
    );
  }
  return acc;
}, []);
