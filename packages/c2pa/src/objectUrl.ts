/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Disposable } from './lib/types';

export interface BlobUrlData {
  url: string;
}

export type BlobUrl = Disposable<BlobUrlData>;

export function createObjectUrlFromBlob(blob: Blob): BlobUrl {
  const url = URL.createObjectURL(blob);

  return {
    data: { url },
    dispose: () => URL.revokeObjectURL(url),
  };
}
