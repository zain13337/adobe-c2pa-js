export interface ManifestStoreFixture {
  active_manifest: string;
  manifests: { [key: string]: Manifest };
  validation_status?: ValidationStatus[];
}

export interface Manifest {
  vendor: string;
  claim_generator: string;
  asset: Asset;
  ingredients: Ingredient[];
  credentials: ManifestCredential[];
  assertions: Assertion[];
  signature: Signature;
}

export interface Assertion {
  label: string;
  data: Data;
}

export interface Data {
  version?: string;
  '@context'?: string;
  '@type'?: string;
  author?: Author[];
  actions?: Action[];
  url?: string;
  alg?: string;
  exclusions?: Exclusion[];
  hash?: string;
  name?: string;
  pad?: string;
}

export interface Action {
  action: string;
  parameters: Parameters;
}

export interface Parameters {
  name: string;
}

export interface Author {
  '@type': string;
  credential?: AuthorCredential[];
  identifier: string;
  name: string;
  '@id'?: string;
}

export interface AuthorCredential {
  alg: string;
  hash: string;
  url: string;
}

export interface Exclusion {
  length: number;
  start: number;
}

export interface Asset {
  title: string;
  format: string;
  instance_id: string;
  thumbnail: Thumbnail;
}

export interface Thumbnail {
  format: string;
  image: string;
}

export interface ManifestCredential {
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
  title: string;
  format: string;
  instance_id: string;
  thumbnail: Thumbnail;
  is_parent?: boolean;
  active_manifest?: string;
  document_id?: string;
  validation_status?: ValidationStatus[];
}

export interface Signature {
  issuer: string;
  time: string;
}

export interface ValidationStatus {
  code: string;
  url: string;
  explanation: string;
}
