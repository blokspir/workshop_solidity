# Why Permanent Storage

## The Problem

An NFT's value depends on its content. If you mint an NFT that points to `https://myserver.com/image.png` and your server goes down, the NFT still exists on-chain but its content is gone. The owner has a token pointing to nothing.

This has happened many times in the NFT space. Projects shut down, servers expire, and owners are left with broken links.

## Storage Options Compared

| Storage | Permanent? | Decentralized? | Cost Model | Best For |
|---------|-----------|---------------|------------|---------|
| **Your server** | No | No | Monthly hosting | Nothing (don't do this) |
| **AWS S3** | No (depends on payment) | No | Monthly | Temporary/dev only |
| **IPFS** | Depends on pinning | Yes | Pin service fees | Content-addressed, but needs pinning |
| **Arweave** | **Yes (200+ years)** | Yes | **One-time payment** | NFT metadata, permanent files |
| **Filecoin** | Yes (with deals) | Yes | Periodic deals | Large datasets |

## Why Arweave Wins for NFTs

1. **Pay once, store forever** -- no recurring costs, no renewal, no risk of expiry
2. **Content-addressed** -- the URL is derived from the data hash; content can't be changed
3. **Decentralized** -- no single point of failure
4. **Industry standard** -- Metaplex, Magic Eden, and most Solana NFT tools use Arweave

## How It Works

```
You upload a file to Arweave
├── File is replicated across Arweave nodes worldwide
├── You receive a transaction ID (hash of the data)
├── The URL is: https://arweave.net/{TRANSACTION_ID}
└── This URL works forever (as long as the Arweave network exists)
```

The URL never changes and the content at that URL can never be modified. This immutability is a feature -- it guarantees the NFT's content is what it claims to be.

## The Metadata Chain

For an NFT, you typically upload two things:

```
1. Upload the image/file → get arweave URI for the file
2. Upload the metadata JSON (referencing the file URI) → get arweave URI for metadata
3. Mint the NFT with the metadata URI
```

```
NFT (on-chain)
  └── uri: "https://arweave.net/META_HASH"
          └── metadata.json
              ├── name: "My NFT"
              ├── image: "https://arweave.net/IMAGE_HASH"
              └── attributes: [...]
```

---

**Key Takeaways**
- Never host NFT content on your own server -- it will break eventually
- Arweave provides permanent, pay-once storage
- Content is immutable and content-addressed (URL = hash of data)
- Upload files first, then metadata JSON that references them

**Next:** [02-arweave-and-irys.md](./02-arweave-and-irys.md)
