# NFT Concepts on Solana

## What Is an NFT?

An NFT (Non-Fungible Token) is a unique digital asset on the blockchain. Unlike fungible tokens (where every token is identical), each NFT is distinct.

| Fungible Token | NFT |
|---------------|-----|
| 1 USDC = 1 USDC | NFT #1 ≠ NFT #2 |
| Interchangeable | Unique |
| Divisible (0.5 USDC) | Indivisible (can't split an NFT) |
| Balance = number | Balance = 0 or 1 |

## NFTs Are Not Just Images

On Solana, an NFT is any unique digital asset:

- **Art / images** -- the most common association
- **Prompts** -- AI prompts with metadata (text, style, parameters)
- **Music** -- audio files with ownership proof
- **Video** -- clips, animations
- **Game items** -- weapons, skins, characters
- **Access passes** -- membership, subscription, event tickets
- **Certificates** -- proof of completion, credentials
- **Domain names** -- .sol domains are NFTs

The NFT is the ownership record. The actual content (image, audio, etc.) is stored off-chain (typically on Arweave) and referenced by a URI in the NFT metadata.

## How NFTs Work on Solana

An NFT consists of:

1. **On-chain account** -- stores the NFT data (owner, collection, plugins)
2. **Metadata URI** -- points to a JSON file with name, description, image, attributes
3. **Off-chain content** -- the actual image/audio/video (hosted on Arweave)

```
On-chain (Solana)
├── Asset account
│   ├── owner: Alice's wallet
│   ├── collection: MyCollection
│   ├── name: "Cosmic Dragon #42"
│   ├── uri: "https://arweave.net/abc123"
│   └── plugins: [royalties, freeze, etc.]
│
Off-chain (Arweave)
└── metadata.json
    ├── name: "Cosmic Dragon #42"
    ├── description: "A rare cosmic dragon"
    ├── image: "https://arweave.net/xyz789"
    └── attributes: [{ trait: "Element", value: "Fire" }]
```

## Collections

NFTs are organized into **collections**. A collection is itself an NFT that groups related assets:

```
Collection: "Cosmic Dragons"
├── Cosmic Dragon #1
├── Cosmic Dragon #2
├── Cosmic Dragon #3
└── ... up to any number
```

Collections enable:
- Marketplace filtering (show all NFTs from a collection)
- Verification (this NFT genuinely belongs to the project)
- Collection-level royalty settings

---

**Key Takeaways**
- NFTs are unique digital assets -- not just images, any digital content
- On-chain data stores ownership and metadata URI; off-chain stores actual content
- Collections group related NFTs together
- The NFT is the ownership proof; the content lives on permanent storage

**Next:** [02-metaplex-core-overview.md](./02-metaplex-core-overview.md)
