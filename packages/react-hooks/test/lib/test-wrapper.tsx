import React from 'react';
import { C2paProvider } from '@contentauth/react-hooks';

const wrapper: React.FunctionComponent<{}> = ({ children }) => (
  <C2paProvider
    config={{
      wasmSrc: 'packages/c2pa/dist/assets/wasm/toolkit_bg.wasm',
      workerSrc: 'packages/c2pa/dist/cai-sdk.worker.min.js',
    }}
  >
    {children}
  </C2paProvider>
);

export default wrapper;
