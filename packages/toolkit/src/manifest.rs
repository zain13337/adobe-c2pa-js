// Copyright 2021 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.
use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;

use crate::error::{Error as SdkError, Result};
use c2pa_toolkit::{
    assertion::{Assertion, AssertionData, AssertionExtractor},
    assertions::{Ingredient, Thumbnail},
    claim::Claim,
    labels::*,
    store::Store,
    validation_status::ValidationStatus,
};

const FILTER_LABELS: [&str; 3] = [
    CLAIM_THUMBNAIL_LABEL_BASE,
    INGREDIENT_THUMBNAIL_LABEL_BASE,
    INGREDIENT_LABEL_BASE,
];

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ResolvedIngredient {
    ingredient: Ingredient,
    manifest_id: Option<String>,
    thumbnail: Option<Thumbnail>,
}

#[derive(Serialize)]
#[serde(untagged)]
enum ResolvedAssertion {
    Ingredient(ResolvedIngredient),
    Thumbnail(Thumbnail),
    UserData(Value),
}

impl ResolvedAssertion {
    fn from_assertion(assertion: &Assertion, claim: &Claim, store: &Store) -> Result<Self> {
        let label = assertion.label();

        match label.as_str() {
            INGREDIENT_LABEL_BASE => {
                let ingredient = Ingredient::extract_assertion(assertion)?;

                // Get the thumbnail from an ingredient, if it exists
                let thumbnail = ingredient
                    .thumbnail
                    .as_ref()
                    .map(|hu| to_absolute_uri(claim.label(), &hu.url()))
                    .and_then(|url| store.get_assertion_from_uri(&url))
                    .map(Thumbnail::extract_assertion)
                    .map_or(Ok(None), |t| t.map(Some))
                    .map_err(|_err| SdkError::IngredientThumbnailExtraction)?;

                let manifest_id = ingredient
                    .c2pa_manifest
                    .as_ref()
                    .map(|hu| Store::manifest_label_from_path(&hu.url()));

                Ok(Self::Ingredient(ResolvedIngredient {
                    ingredient,
                    thumbnail,
                    manifest_id,
                }))
            }
            label => {
                if label.starts_with(THUMBNAIL_LABEL_BASE) {
                    Ok(Self::Thumbnail(Thumbnail::extract_assertion(assertion)?))
                } else {
                    Self::from_user_assertion(assertion)
                }
            }
        }
    }

    fn from_user_assertion(assertion: &Assertion) -> Result<Self> {
        assertion
            .as_json_object()
            .map(Self::UserData)
            .map_err(|err| SdkError::AssertionConversion(err.to_string()))
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Signature {
    issuer: Option<String>,
    time: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ManifestEntry {
    label: String,
    claim_generator: String,
    format: String,
    title: Option<String>,
    instance_id: String,
    signature: Signature,
    assertions: HashMap<String, ResolvedAssertion>,
    ingredients: Vec<ResolvedAssertion>,
    credentials: Vec<Value>,
    thumbnail: Option<Thumbnail>,
    #[serde(skip_serializing_if = "Option::is_none")]
    errors: Option<Vec<ValidationStatus>>,
}

impl ManifestEntry {
    /// Fetches the assertion data from uri references in the claim
    fn fetch_assertions<'a>(claim: &'a Claim, store: &'a Store) -> Vec<&'a Assertion> {
        claim
            .assertions()
            .iter()
            .filter_map(|hashed_uri| {
                let uri = to_absolute_uri(claim.label(), &hashed_uri.url());
                store.get_assertion_from_uri(&uri)
            })
            .collect()
    }

    /// Resolves the fetched data into serializable assertion entities
    fn resolve_assertions(
        fetched: &[&Assertion],
        claim: &Claim,
        store: &Store,
    ) -> Result<HashMap<String, ResolvedAssertion>> {
        fetched
            .iter()
            // Filter claim and ingredient thumbnails since we will be processing these separately
            .filter(|a| {
                !FILTER_LABELS
                    .iter()
                    .any(|label| a.label().starts_with(label))
            })
            .map(|a| ResolvedAssertion::from_assertion(a, claim, store).map(|ra| (a.label(), ra)))
            .collect()
    }

    /// Resolves the fetched data into serializable ingredient entities
    fn resolve_ingredients(
        fetched: &[&Assertion],
        claim: &Claim,
        store: &Store,
    ) -> Result<Vec<ResolvedAssertion>> {
        fetched
            .iter()
            // Filter claim and ingredient thumbnails since we will be processing these separately
            .filter(|a| a.label().starts_with(INGREDIENT_LABEL_BASE))
            .map(|a| ResolvedAssertion::from_assertion(a, claim, store))
            .collect()
    }

    /// Gets the claim thumbnail assertion, if it exists
    fn get_claim_thumbnail(fetched: &[&Assertion]) -> Result<Option<Thumbnail>> {
        fetched
            .iter()
            .find(|a| a.label().starts_with(CLAIM_THUMBNAIL_LABEL_BASE))
            .map(|a| Thumbnail::extract_assertion(a))
            .map_or(Ok(None), |t| t.map(Some))
            .map_err(|_err| SdkError::IngredientThumbnailExtraction)
    }

    /// Extracts the verifiable credential data
    fn get_verifiable_credentials(claim: &Claim) -> Vec<Value> {
        claim
            .get_verifiable_credentials()
            .iter()
            .filter_map(|d| match d {
                AssertionData::AssertionJson(s) => serde_json::from_str(s).ok(),
                // TODO: See if we can streamline deserialization of AssertionData
                // TODO: Can verifiable credentials be stored as CBOR?
                _ => None,
            })
            .collect()
    }

    /// Converts a claim into a manifest entry that can be serialized
    pub fn from_claim(claim: &Claim, store: &Store, status: &[ValidationStatus]) -> Result<Self> {
        let fetched = Self::fetch_assertions(claim, store);
        let is_active_manifest = store.provenance_claim() == Some(claim);
        let errors = if is_active_manifest {
            Some(status.to_owned())
        } else {
            None
        };

        let signature = Signature {
            issuer: claim.signing_issuer(),
            time: claim.signing_time().map(|st| st.to_rfc3339()),
        };

        Ok(ManifestEntry {
            label: claim.label().to_owned(),
            claim_generator: claim.claim_generator().to_owned(),
            format: claim.format().to_owned(),
            title: claim.title().map(ToOwned::to_owned),
            instance_id: claim.instance_id().to_owned(),
            signature,
            assertions: Self::resolve_assertions(&fetched, claim, store)
                .map_err(|err| SdkError::AssertionConversion(err.to_string()))?,
            ingredients: Self::resolve_ingredients(&fetched, claim, store)
                .map_err(|_| SdkError::IngredientConversion)?,
            thumbnail: Self::get_claim_thumbnail(&fetched)?,
            credentials: Self::get_verifiable_credentials(claim),
            errors,
        })
    }
}
