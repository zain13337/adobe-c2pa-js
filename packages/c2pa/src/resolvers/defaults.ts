/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { parseISO } from 'date-fns';
import { Author, CreativeWorkAssertion } from '@contentauth/toolkit';
import { createTypedResolvers } from './createTypedResolvers';
import { createThumbnail } from '../thumbnail';

export const defaultResolvers = createTypedResolvers({
  /**
   * This manifest's label
   */
  label: (manifest) => manifest.data.label,

  format: (manifest) => manifest.data.format,

  /**
   * Gets the title of the acquisition asset for this claim if it exists (e.g. filename)
   */
  title: (manifest) => manifest.data.title,

  /**
   * Gets the signature information (issuer, date) for this claim
   */
  signature: {
    get: ({ data: { signature } }) => ({
      issuer: signature.issuer,
      date: signature.time ? parseISO(signature.time) : undefined,
      isoDateString: signature.time,
    }),
    getSerializable: ({ data: { signature } }) => ({
      issuer: signature.issuer,
      isoDateString: signature.time,
    }),
  },

  /**
   * Information identifying the software that generated this manifest
   */
  claimGenerator: (manifest) => ({
    value: manifest.data.claimGenerator,
    product: manifest.data.claimGenerator.split('(')[0]?.trim(),
  }),

  /**
   * Gets the producer from the CreativeWork assertion
   */
  producer: (manifest) => {
    const cwAssertion = manifest.assertions.get('stds.schema-org.CreativeWork');

    return cwAssertion
      ? parseCreativeWorkAssertion(cwAssertion).producer
      : undefined;
  },

  /**
   * Gets any social accounts included in the CreativeWork assertion
   */
  socialAccounts: (manifest) => {
    const cwAssertion = manifest.assertions.get('stds.schema-org.CreativeWork');

    return cwAssertion
      ? parseCreativeWorkAssertion(cwAssertion).socialAccounts
      : undefined;
  },

  /**
   * Acquisition thumbnail for this manifest
   */
  thumbnail: {
    get: (manifest) => createThumbnail(manifest.data.thumbnail),
    getSerializable: async (manifest, onDispose) => {
      const { data, dispose } = createThumbnail(
        manifest.data.thumbnail,
      ).getUrl();
      onDispose(dispose);
      return data.url;
    },
  },

  /**
   * Errors returned by the toolkit
   */
  errors: (manifest) => manifest.data.errors,
});

export type DefaultResolvers = typeof defaultResolvers;

interface CreativeWorkAssertionData {
  producer: Author | undefined;
  socialAccounts: Author[];
}

function parseCreativeWorkAssertion(
  assertion: CreativeWorkAssertion,
): CreativeWorkAssertionData {
  const producer = assertion.author?.find((x) => !x.hasOwnProperty('@id'));

  const socialAccounts = assertion.author?.filter((x) =>
    x.hasOwnProperty('@id'),
  );

  return {
    producer,
    socialAccounts,
  };
}
