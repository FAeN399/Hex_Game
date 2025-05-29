use tokio::net::TcpListener;
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;
use futures_util::{StreamExt, SinkExt};

pub struct Session {
    pub id: Uuid,
}

impl Session {
    pub async fn run(addr: &str) -> anyhow::Result<()> {
        let listener = TcpListener::bind(addr).await?;
        let (stream, _) = listener.accept().await?;
        let mut ws = tokio_tungstenite::accept_async(stream).await?;
        while let Some(msg) = ws.next().await {
            let msg = msg?;
            if msg.is_text() || msg.is_binary() {
                ws.send(Message::Text(msg.into_text()?)).await?;
            }
        }
        Ok(())
    }
}
