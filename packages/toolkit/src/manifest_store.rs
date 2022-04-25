// Copyright 2021 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.
use serde::Serialize;
use std::collections::HashMap;

use crate::error::{Error, Result};
use crate::manifest::ManifestEntry;
use crate::util::log_time;
use c2pa_toolkit::{
    status_tracker::{DetailedStatusTracker, StatusTracker},
    store::Store,
    validation_status::status_for_store,
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ManifestStoreResult {
    active_manifest: Option<String>,
    manifests: HashMap<String, ManifestEntry>,
}

fn manifest_store_to_object(
    store: &Store,
    validation_log: &mut impl StatusTracker,
) -> Result<ManifestStoreResult> {
    log_time("ManifestStore::manifest_store_to_object::start");

    let status = status_for_store(store, validation_log);
    let manifests: HashMap<String, ManifestEntry> = store
        .claims()
        .iter()
        .map(|claim| {
            ManifestEntry::from_claim(claim, store, &status)
                .map(|entry| (claim.label().to_owned(), entry))
        })
        .collect::<Result<_>>()
        .map_err(|err| Error::ManifestConversion(err.to_string()))?;

    log_time("ManifestStore::manifest_store_to_object::create_manifest_map");

    Ok(ManifestStoreResult {
        active_manifest: store.provenance_label(),
        manifests,
    })
}

pub async fn get_manifest_store_data(data: &[u8], mime_type: &str) -> Result<ManifestStoreResult> {
    let mut validation_log = DetailedStatusTracker::default();

    let store = Store::load_from_memory_async(mime_type, data, true, &mut validation_log).await?;

    log_time("Store::load_from_memory_async");

    let result = manifest_store_to_object(&store, &mut validation_log)?;

    log_time("ManifestStore::manifest_store_to_object::end");

    Ok(result)
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    pub async fn test_manifest_store_data() {
        let test_asset = include_bytes!("../../../tests/assets/CAICAI.jpg");

        let result = get_manifest_store_data(test_asset, "image/jpeg").await;
        assert!(result.is_ok());
    }

    #[wasm_bindgen_test]
    pub async fn test_load_from_memory_async() {
        let mut validation_log = DetailedStatusTracker::default();
        let test_asset = include_bytes!("../../../tests/assets/CAICAI.jpg");

        let result =
            Store::load_from_memory_async("image/jpeg", test_asset, true, &mut validation_log)
                .await;
        assert!(result.is_ok());
    }
}
