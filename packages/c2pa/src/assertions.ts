/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Assertions as ToolkitAssertions } from '@contentauth/toolkit';

// Can be augmented to allow additional assertion types
export interface ExtendedAssertions {}
interface ManifestAssertions
  extends ToolkitAssertions,
    Partial<ExtendedAssertions> {}

export interface AssertionData extends ToolkitAssertions {
  [key: string]: any;
}

export interface AssertionAccessor {
  data: ToolkitAssertions;

  get: <T extends string>(
    label: keyof ManifestAssertions | T,
    index?: number,
  ) => T extends keyof ManifestAssertions ? ManifestAssertions[T] : any;

  getAll: <T extends string>(
    label: T,
  ) => T extends keyof ManifestAssertions ? ManifestAssertions[T][] : any[];
}

/**
 * Creates a facade object with convenience methods over assertion data returned from the toolkit.
 *
 * @param assertionData Raw assertion data returned by the toolkit
 */
export function createAssertionAccessor(
  assertionData: AssertionData,
): AssertionAccessor {
  return {
    data: assertionData,

    get: (label, index) => {
      return assertionData[`${label as string}${index ? `__${index}` : ''}`];
    },

    // @TODO: look into "any" cast
    getAll: (label) => {
      return Object.keys(assertionData)
        .filter((assertionLabel) => assertionLabel.split('__')[0] === label)
        .map((assertionLabel) => assertionData[assertionLabel]) as any;
    },
  };
}
