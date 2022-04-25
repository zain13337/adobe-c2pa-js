/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import type { C2paReadResult, C2pa } from '../c2pa';
import { Ingredient } from '../ingredient';
import { Manifest } from '../manifest';

export interface Disposable<Data = any> {
  data: Data;
  dispose: () => void;
}

export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: SerializableValue }
  | SerializableValue[];

export interface Serializable<ReturnType> {
  asSerializable: (config?: any) => ReturnType;
}

// Utility types for SDK consumers

/**
 * Derives the manifest type from either a C2pa or C2paReadResult type.
 * Will attempt to unwrap function return type / promises.
 */
export type GetManifestType<T> = UnwrapFunction<T> extends C2paReadResult<
  infer U
>
  ? Manifest<U>
  : UnwrapFunction<T> extends C2pa<infer U>
  ? Manifest<U>
  : never;

/**
 * Derives the ingredient type from either a C2pa or C2paReadResult type.
 * Will attempt to unwrap function return type / promises.
 */
export type GetIngredientType<T> = UnwrapFunction<T> extends C2paReadResult<
  infer U
>
  ? Ingredient<U>
  : UnwrapFunction<T> extends C2pa<infer U>
  ? Ingredient<U>
  : never;

type UnwrapFunction<T> = T extends (...args: any) => any
  ? Awaited<ReturnType<T>>
  : Awaited<T>;
