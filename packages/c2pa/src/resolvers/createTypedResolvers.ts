/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import type { ManifestResolvers } from '../manifest';

/**
 * Helper function to allow an enforced resolver object structure while still allowing TS to infer type.
 * Typing a plain object as "ManifestResolvers" prevents structural inference.
 */
export function createTypedResolvers<T extends ManifestResolvers>(
  resolvers: T,
): T {
  return resolvers;
}
