use axum::http::{HeaderValue, Method, header};
use tower_http::cors::{AllowOrigin, CorsLayer};

const TAURI_DEV_URL: &str = "http://localhost:1420";

/// Whether an `Origin` header value points at a localhost origin, on any port.
fn is_localhost_origin(origin: &HeaderValue) -> bool {
    let Ok(origin) = origin.to_str() else {
        return false;
    };

    let Some((scheme, authority)) = origin.split_once("://") else {
        return false;
    };

    if !scheme.eq_ignore_ascii_case("http") && !scheme.eq_ignore_ascii_case("https") {
        return false;
    }

    let authority = authority.split('/').next().unwrap_or_default();

    // Strip the (optional) port, taking care of IPv6 literals such as `[::1]:5173`.
    let host = match authority.strip_prefix('[') {
        Some(rest) => rest.split(']').next().unwrap_or_default(),
        None => authority.split(':').next().unwrap_or_default(),
    };

    matches!(
        host.to_ascii_lowercase().as_str(),
        "localhost" | "127.0.0.1" | "::1"
    )
}

pub(super) fn cors_layer() -> CorsLayer {
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::CONTENT_TYPE, header::CONTENT_LENGTH]);

    if cfg!(debug_assertions) {
        // In development the UI can also be served from a regular browser on an
        // arbitrary local port, so accept every localhost origin.
        cors.allow_origin(AllowOrigin::predicate(|origin, _request_parts| {
            is_localhost_origin(origin)
        }))
    } else {
        cors.allow_origin(TAURI_DEV_URL.parse::<HeaderValue>().unwrap())
    }
}

#[cfg(test)]
mod tests {
    use axum::http::HeaderValue;

    use super::is_localhost_origin;

    #[test]
    fn accepts_localhost_origins_on_any_port() {
        for origin in [
            "http://localhost",
            "http://localhost:1420",
            "http://localhost:5173",
            "https://localhost:8443",
            "http://127.0.0.1:3000",
            "http://[::1]:5173",
            "HTTP://LOCALHOST:1234",
        ] {
            let origin = HeaderValue::from_str(origin).unwrap();
            assert!(is_localhost_origin(&origin), "{origin:?}");
        }
    }

    #[test]
    fn rejects_non_localhost_origins() {
        for origin in [
            "https://example.com",
            "http://localhost.example.com:1420",
            "http://127.0.0.1.example.com",
            "http://192.168.0.2:5173",
            "https://tauri.localhost",
            "tauri://localhost",
            "null",
            "not an origin",
        ] {
            let origin = HeaderValue::from_str(origin).unwrap();
            assert!(!is_localhost_origin(&origin), "{origin:?}");
        }
    }
}
