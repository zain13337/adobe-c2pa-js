/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Thumbnail as ToolkitThumbnail } from '@contentauth/toolkit';
import { sha } from './lib/hash';
import { BlobUrl, createObjectUrlFromBlob } from './objectUrl';

export interface Thumbnail {
  blob?: Blob;
  label: string;
  contentType: string;
  hash?: () => Promise<string>;
  getUrl: () => BlobUrl;
}

/**
 * Creates a facade object with convenience methods over thumbnail data returned from the toolkit.
 *
 * @param thumbnailData Raw thumbnail data returned by the toolkit
 */
export function createThumbnail(thumbnailData: ToolkitThumbnail): Thumbnail {
  const blob = new Blob([Uint8Array.from(thumbnailData.data)], {
    type: thumbnailData.content_type,
  });

  return {
    blob,
    label: thumbnailData.label,
    contentType: thumbnailData.content_type,

    hash: () => sha(blob),

    getUrl: () => createObjectUrlFromBlob(blob),
  };
}

export function createThumbnailFromBlob(
  blob: Blob,
  label: string,
  contentType: string,
): Thumbnail {
  return {
    blob,
    label,
    contentType,

    hash: () => sha(blob),

    getUrl: () => createObjectUrlFromBlob(blob),
  };
}

export function createThumbnailFromUrl(
  url: string,
  label: string,
  contentType: string,
): Thumbnail {
  return {
    label,
    contentType,
    getUrl: () => ({
      data: { url },
      dispose: () => {},
    }),
  };
}
