# Why Indexing

## The Problem

On Solana, data is stored in accounts. To display an activity feed ("who minted what, when"), you'd need to:

1. Fetch all relevant accounts
2. Parse transaction history for each account
3. Deserialize and filter the data
4. Sort by timestamp

This is slow (multiple RPC calls), expensive (rate-limited), and doesn't work in real-time.

## What an Indexer Does

An indexer listens for on-chain events as they happen and stores them in a traditional database:

```
Solana blockchain → Event happens (mint, transfer, stake)
                        ↓
                    Indexer catches the event
                        ↓
                    Stores in PostgreSQL/MongoDB
                        ↓
                    Frontend queries the database (fast!)
```

## Before vs After Indexing

| Task | Without Indexer | With Indexer |
|------|----------------|-------------|
| "Show last 20 mints" | Parse 100s of transactions | `SELECT * FROM mints ORDER BY time LIMIT 20` |
| "Show Alice's NFTs" | Fetch all token accounts, filter | `SELECT * FROM nfts WHERE owner = 'Alice'` |
| "Total tokens staked" | Fetch all stake accounts, sum | `SELECT SUM(amount) FROM stakes` |
| "Live activity feed" | Poll every 5 seconds | WebSocket push on new event |
| Response time | 2-5 seconds | < 50ms |

## Indexing Options on Solana

| Service | How It Works | Pricing |
|---------|-------------|---------|
| **Helius Webhooks** | HTTP webhooks on account/transaction events | Free tier + paid plans |
| **Helius DAS API** | Pre-indexed NFT/token data | Part of Helius plan |
| **Shyft** | Similar to Helius | Free tier + paid |
| **Custom gRPC** | Stream from validator directly | Self-hosted, complex |
| **The Graph** | Subgraphs for Solana | Newer, limited |

**Helius** is the most popular choice for Solana projects. It provides both webhooks (for custom events) and the DAS API (for NFT data).

---

**Key Takeaways**
- Direct on-chain queries are too slow for production UI
- Indexers listen for events and store data in a fast database
- Helius is the standard indexing service for Solana
- Your backend queries the database instead of the blockchain

**Next:** [02-helius-webhooks.md](./02-helius-webhooks.md)
