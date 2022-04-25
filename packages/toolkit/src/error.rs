// Copyright 2021 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("could not convert the manifest to an object: {0}")]
    ManifestConversion(String),

    #[error(transparent)]
    SerdeInput(#[from] serde_wasm_bindgen::Error),

    #[error("could not process assertion: {0}")]
    AssertionConversion(String),

    #[error("could not process ingredient")]
    IngredientConversion,

    #[error("could not extract ingredient from thumbnail")]
    IngredientThumbnailExtraction,

    #[error("javascript conversion error")]
    JavaScriptConversion,

    #[error(transparent)]
    C2pa(#[from] c2pa_toolkit::Error),

    #[error(transparent)]
    C2paAssertionDecode(#[from] c2pa_toolkit::assertion::AssertionDecodeError),
}

pub type Result<T> = std::result::Result<T, Error>;
