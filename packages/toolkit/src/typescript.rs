// Copyright 2021 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.
use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
pub const TS_APPEND_CONTENT: &'static str = r#"

export interface ManifestStore {
  activeManifest: string;
  manifests: Record<string, Manifest>;
}

export interface Manifest {
  label: string;
  claimGenerator: string;
  format: string;
  title: string;
  instanceId?: string;
  signature: Signature;
  assertions: Assertions;
  ingredients: Ingredient[];
  credentials: Credential[];
  thumbnail: Thumbnail;
  errors?: Status[];
}

interface AssertionMap {
  'c2pa.hash.data': C2paHashDataAssertion;
  'c2pa.actions': C2paActionsAssertion;
  'stds.schema-org.CreativeWork': CreativeWorkAssertion;
}

export type Assertions = Partial<AssertionMap>;

export interface C2paActionsAssertion extends AssertionMetadata {
  actions: Action[];
}

export interface Action {
  action: string;
  parameters: Parameters;
}

export interface Parameters {
  name: string;
}

export interface C2paHashDataAssertion {
  exclusions: Exclusion[];
  name: string;
  alg: string;
  hash: Uint8Array;
  pad: Uint8Array;
}

export interface Exclusion {
  start: number;
  length: number;
}

export interface CreativeWorkAssertion {
  '@context': string;
  '@type': string;
  author: Author[];
}

export interface Author {
  '@type': string;
  name: string;
  identifier: string;
  credential?: HashedUriMap[];
  '@id'?: string;
  [key: string]: any;
}

export interface HashedUriMap {
  url: string;
  alg?: string;
  hash: Uint8Array;
}

export interface Credential {
  '@context': string[];
  credentialSubject: CredentialSubject;
  id: string;
  proof: Proof;
  type: string[];
}

export interface CredentialSubject {
  id: string;
  name: string;
}

export interface Proof {
  created: Date;
  proof_purpose: string;
  proof_type: string;
  proof_value: string;
  verification_method: string;
}

export interface Ingredient {
  ingredient: IngredientAssertion;
  manifestId?: string;
  thumbnail: Thumbnail;
}

export type IngredientRelationship = 'parentOf' | 'componentOf';

export interface IngredientAssertion extends AssertionMetadata {
  'dc:title'?: string;
  'dc:format'?: string;
  instanceID?: string;
  c2pa_manifest?: HashedUriMap;
  relationship: IngredientRelationship;
  thumbnail?: HashedUriMap;
  documentID?: string;
  validationStatus?: Status[];
}

export interface Thumbnail {
  data: Uint8Array | number[];
  label: string;
  content_type: string;
}

export interface Signature {
  issuer: string;
  // TODO: Remove `undefined` once timestamps in WASM get implemented
  time: string | undefined;
}

export interface Status {
  code: string;
  url: string;
  explanation: string;
  [key: string]: any;
}

export interface AssertionMetadata {
  metadata?: AssertionMetadataMap;
}

export interface AssertionMetadataMap {
  reviewRatings?: RatingMap[];
  dateTime?: string;
  reference?: HashedUriMap;
  dataSource?: SourceMap;
  [key: string]: unknown;
}

export interface RatingMap {
  value: 1 | 2 | 3 | 4 | 5;
  code?: ReviewCode;
  explanation: string;
}

export type ReviewCode =
  | 'actions.unknownActionsPerformed'
  | 'actions.missing'
  | 'actions.possiblyMissing'
  | 'depthMap.sceneMismatch'
  | 'ingredient.modified'
  | 'ingredient.possiblyModified'
  | 'thumbnail.primaryMismatch'
  | 'stds.iptc.location.inaccurate'
  | 'stds.schema-org.CreativeWork.misattributed'
  | 'stds.schema-org.CreativeWork.missingAttribution';

export interface SourceMap {
  type: SourceType;
  details?: string;
  actors?: ActorMap[];
}

export type SourceType =
  | 'signer'
  | 'claimGenerator.REE'
  | 'claimGenerator.TEE'
  | 'localProvider.REE'
  | 'localProvider.TEE'
  | 'remoteProvider.1stParty'
  | 'remoteProvider.3rdParty'
  | 'humanEntry.anonymous'
  | 'humanEntry.identified';

export interface ActorMap {
  identifier?: string;
  credentials?: HashedUriMap[];
}

"#;
