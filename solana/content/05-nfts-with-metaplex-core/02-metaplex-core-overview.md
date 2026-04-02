# Metaplex Core Overview

## The Evolution of Solana NFTs

Solana has had multiple NFT standards:

| Standard | Era | Accounts per NFT | Notes |
|----------|-----|-------------------|-------|
| Token Metadata (legacy) | 2021+ | 3-5 accounts | Most NFTs today |
| Bubblegum (compressed) | 2023+ | Shared tree | Cheap, limited features |
| **Metaplex Core** | 2024+ | **1 account** | Modern, recommended |

Metaplex Core is the newest and simplest. Use it for all new NFT projects.

## Why Core?

### Simpler (1 Account per NFT)

Legacy NFTs required multiple accounts: mint, token account, metadata, master edition. Core stores everything in a single account.

### Cheaper

Fewer accounts = less rent = lower cost to mint.

| Standard | Cost per NFT |
|----------|-------------|
| Token Metadata | ~0.02 SOL |
| Core | ~0.004 SOL |

### Plugin System

Instead of baking every feature into the standard, Core uses **plugins** for optional features:

- **Royalties** -- enforce creator royalties on transfers
- **Freeze Delegate** -- allow a program to freeze/unfreeze assets
- **Transfer Delegate** -- allow a program to transfer assets
- **Burn Delegate** -- allow a program to burn assets
- **Attributes** -- on-chain key-value data
- **Edition** -- numbered editions (1 of 100)

### Enforced Royalties

The legacy standard had "optional" royalties that marketplaces could bypass. Core's royalty plugin is enforced at the protocol level.

## Core Architecture

```
Collection (asset)
├── name, uri
├── plugins: [royalties, ...]
├── update_authority
│
├── Asset #1
│   ├── owner
│   ├── name, uri
│   └── plugins (inherited from collection + per-asset)
│
├── Asset #2
│   ├── owner
│   ├── name, uri
│   └── plugins
│
└── ...
```

## The Metaplex Umi SDK

Metaplex provides **Umi**, a TypeScript framework for interacting with their programs:

```bash
npm install @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/mpl-core
```

Umi abstracts away the complexity of building transactions:

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";

const umi = createUmi("https://api.devnet.solana.com")
    .use(mplCore());
```

Umi uses its own types (UmiPublicKey, UmiKeypair) which differ slightly from `@solana/web3.js`. The SDK provides conversion helpers.

---

**Key Takeaways**
- Metaplex Core is the modern NFT standard: 1 account per NFT, cheaper, plugin-based
- Plugins add features like royalties, freeze, transfer delegation
- Core enforces royalties at the protocol level (not optional like legacy)
- Use the Umi SDK for TypeScript interactions with Metaplex programs

**Next:** [03-collections-and-minting.md](./03-collections-and-minting.md)
