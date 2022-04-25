/**
 * A thin "wrapper" around @testing-library/react-hooks that patches up some unfortunate DX around CJS -> ESM
 * transformation using web-test-runner with @rollup/plugin-commonjs. Hopefully this is addressed in the near future,
 * either with improvements to @rollup/plugin-commonjs or more packages shipping with native ESM support.
 * 
 * Relevant issues:
 * https://github.com/modernweb-dev/web/issues/1700
 * https://github.com/rollup/plugins/issues/986
 * https://github.com/rollup/plugins/pull/1038
 */

import * as hooks from '@testing-library/react-hooks/dom';

// @ts-ignore
export const renderHook: typeof hooks.renderHook = hooks.default.renderHook;
// @ts-ignore
export const act: typeof hooks.act = hooks.default.act;
