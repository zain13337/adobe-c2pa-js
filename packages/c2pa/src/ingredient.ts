/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */
import {
  Ingredient as ToolkitIngredient,
  IngredientRelationship,
} from '@contentauth/toolkit';
import { Manifest, ManifestResolvers } from './manifest';
import { createThumbnail, Thumbnail } from './thumbnail';
import { Disposable, Serializable } from './lib/types';

export interface Ingredient<T extends ManifestResolvers = {}>
  extends Serializable<SerializableIngredient> {
  title?: string;
  format?: string;
  relationship: IngredientRelationship;
  manifest?: Manifest<T>;
  thumbnail: Thumbnail;
  data: ToolkitIngredient;
}

export interface SerializableIngredientData
  extends Pick<Ingredient, 'title' | 'format' | 'relationship'> {
  manifest?: string;
  thumbnail: string;
}

type SerializableIngredient = Disposable<SerializableIngredientData>;

/**
 * Creates a facade object with convenience methods over ingredient data returned from the toolkit.
 *
 * @param ingredientData Raw ingredient data returned by the toolkit
 * @param manifest If provided, the created ingredient will link to this manifest. This should be the manifest with a label matching this ingredient's manifestId field.
 */
export function createIngredient<T extends ManifestResolvers>(
  ingredientData: ToolkitIngredient,
  manifest?: Manifest<T>,
): Ingredient<T> {
  const { ingredient, manifestId } = ingredientData;

  const thumbnail = createThumbnail(ingredientData.thumbnail);

  return {
    title: ingredient['dc:title'],
    format: ingredient['dc:format'],
    relationship: ingredient.relationship,
    data: ingredientData,
    thumbnail,
    manifest,

    asSerializable: () => {
      const { data, dispose } = thumbnail.getUrl();

      return {
        data: {
          title: ingredient['dc:title'],
          format: ingredient['dc:format'],
          relationship: ingredient.relationship,
          manifest: manifestId,
          thumbnail: data.url,
        },
        dispose,
      };
    },
  };
}
