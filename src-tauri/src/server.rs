use axum::{
    Router,
    http::{HeaderValue, Method, header},
    routing::get,
};
use tower_http::cors::CorsLayer;

async fn hello() -> &'static str {
    "Hello from Axum"
}

pub async fn start() {
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:1420".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::CONTENT_TYPE, header::CONTENT_LENGTH]);

    let app = Router::new().route("/", get(hello)).layer(cors);
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .expect("failed to bind Axum listener");

    axum::serve(listener, app)
        .await
        .expect("Axum server failed");
}
