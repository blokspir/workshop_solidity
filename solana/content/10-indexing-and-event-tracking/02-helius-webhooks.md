# Helius Webhooks

## What Are Helius Webhooks?

Helius monitors the Solana blockchain and sends HTTP POST requests to your server whenever specified events occur. Think of it as a push notification for on-chain activity.

## Getting Started

1. Sign up at https://helius.dev
2. Create an API key (free tier includes webhook access)
3. Get your API key from the dashboard

## Creating a Webhook

### Via the Helius Dashboard

The simplest way: go to the Helius dashboard → Webhooks → Create New.

### Via the API

```typescript
const response = await fetch("https://api.helius.xyz/v0/webhooks?api-key=YOUR_API_KEY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        webhookURL: "https://your-server.com/api/webhook",
        transactionTypes: ["Any"],
        accountAddresses: ["YOUR_PROGRAM_ID"],
        webhookType: "enhanced",
    }),
});

const webhook = await response.json();
console.log("Webhook ID:", webhook.webhookID);
```

## Webhook Types

| Type | Data Included | Best For |
|------|--------------|---------|
| `enhanced` | Parsed transaction data with human-readable info | Most use cases |
| `raw` | Raw transaction data | Custom parsing |
| `discord` | Formatted for Discord webhooks | Notifications |

Use `enhanced` for production -- it parses token transfers, NFT mints, and program interactions automatically.

## What You Can Listen For

### By Account Address

Monitor specific accounts for any changes:

```json
{
    "accountAddresses": ["YOUR_PROGRAM_ID", "SPECIFIC_MINT_ADDRESS"]
}
```

### By Transaction Type

Filter for specific transaction types:

```json
{
    "transactionTypes": ["NFT_MINT", "NFT_SALE", "TRANSFER", "SWAP"]
}
```

Available types include: `NFT_MINT`, `NFT_SALE`, `NFT_LISTING`, `TRANSFER`, `SWAP`, `TOKEN_MINT`, `BURN`, and more.

### By Program

Monitor all transactions that interact with your program:

```json
{
    "accountAddresses": ["YOUR_PROGRAM_ID"]
}
```

## Enhanced Webhook Payload

When an event occurs, Helius sends a POST request:

```json
[
    {
        "description": "Alice transferred 100 tokens to Bob",
        "type": "TRANSFER",
        "source": "SYSTEM_PROGRAM",
        "fee": 5000,
        "feePayer": "Alice_pubkey",
        "signature": "5yxR...",
        "slot": 123456789,
        "timestamp": 1700000000,
        "tokenTransfers": [
            {
                "fromTokenAccount": "alice_ata",
                "toTokenAccount": "bob_ata",
                "fromUserAccount": "alice_wallet",
                "toUserAccount": "bob_wallet",
                "tokenAmount": 100,
                "mint": "token_mint_address",
                "tokenStandard": "Fungible"
            }
        ],
        "nativeTransfers": [],
        "accountData": [...]
    }
]
```

## Helius DAS API

For NFT-specific data, Helius provides the Digital Asset Standard API:

```typescript
// Get all NFTs owned by a wallet
const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_KEY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByOwner",
        params: {
            ownerAddress: "WALLET_ADDRESS",
            page: 1,
            limit: 20,
        },
    }),
});

const { result } = await response.json();
console.log("NFTs:", result.items);
```

---

**Key Takeaways**
- Helius webhooks send POST requests to your server when on-chain events occur
- Use `enhanced` type for pre-parsed, human-readable transaction data
- Filter by account addresses and/or transaction types
- DAS API provides pre-indexed NFT data (owner, metadata, collection)
- Free tier is sufficient for development and small projects

**Next:** [03-processing-events.md](./03-processing-events.md)
