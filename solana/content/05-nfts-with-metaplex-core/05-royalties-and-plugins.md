# Royalties and Plugins

Metaplex Core's plugin system is what makes it powerful. Plugins add optional behavior to assets and collections.

## The Royalties Plugin

Royalties automatically give the original creator a percentage of every resale:

```typescript
import { createCollection } from "@metaplex-foundation/mpl-core";
import { ruleSet } from "@metaplex-foundation/mpl-core";

await createCollection(umi, {
    collection: collectionSigner,
    name: "My Collection",
    uri: "https://arweave.net/collection.json",
    plugins: [
        {
            type: "Royalties",
            basisPoints: 500,  // 5% royalty
            creators: [
                {
                    address: creatorPublicKey,
                    percentage: 100,  // 100% of royalty goes to this creator
                },
            ],
            ruleSet: ruleSet("None"),  // no additional transfer restrictions
        },
    ],
}).sendAndConfirm(umi);
```

### Multi-Creator Royalties

Split royalties among multiple creators:

```typescript
plugins: [
    {
        type: "Royalties",
        basisPoints: 500,  // 5% total
        creators: [
            { address: creator1, percentage: 70 },  // 70% of 5% = 3.5%
            { address: creator2, percentage: 30 },  // 30% of 5% = 1.5%
        ],
        ruleSet: ruleSet("None"),
    },
]
```

### Enforced Royalties

Metaplex Core enforces royalties at the protocol level. Unlike legacy NFTs where marketplaces could skip royalties, Core makes them mandatory. The ruleSet controls which programs can transfer the asset:

```typescript
// Allow all transfers (royalty still enforced on marketplaces)
ruleSet: ruleSet("None")

// Only allow specific programs to transfer
ruleSet: ruleSet("ProgramAllowList", [
    ["MARKETPLACE_PROGRAM_ID_1"],
    ["MARKETPLACE_PROGRAM_ID_2"],
])
```

## Other Useful Plugins

### Freeze Delegate

Allows a program to freeze/unfreeze assets (prevent transfers):

```typescript
plugins: [
    {
        type: "FreezeDelegate",
        frozen: false,
        authority: { type: "Address", address: programAuthority },
    },
]
```

Use case: freeze an NFT while it's staked or listed for sale.

### Transfer Delegate

Allows a program to transfer the asset on behalf of the owner:

```typescript
plugins: [
    {
        type: "TransferDelegate",
        authority: { type: "Address", address: marketplaceProgram },
    },
]
```

Use case: marketplace escrow, instant sales.

### Burn Delegate

Allows a program to burn the asset:

```typescript
plugins: [
    {
        type: "BurnDelegate",
        authority: { type: "Address", address: programAuthority },
    },
]
```

Use case: consumable NFTs (use once and destroy).

## Collection-Level vs Asset-Level Plugins

Plugins can be set at two levels:

| Level | Applied To | Override? |
|-------|-----------|----------|
| **Collection** | All assets in the collection | Sets defaults |
| **Asset** | Individual asset | Can override collection settings |

Setting royalties at the collection level means all NFTs in the collection share the same royalty configuration:

```typescript
// Set royalties on the collection (applies to all assets)
await createCollection(umi, {
    collection: collectionSigner,
    name: "My Collection",
    uri: "...",
    plugins: [
        {
            type: "Royalties",
            basisPoints: 500,
            creators: [{ address: creator, percentage: 100 }],
            ruleSet: ruleSet("None"),
        },
    ],
}).sendAndConfirm(umi);

// Assets inherit the collection's royalty plugin
await create(umi, {
    asset: assetSigner,
    collection: collectionSigner.publicKey,
    name: "Asset #1",
    uri: "...",
    // no need to specify royalties -- inherited from collection
}).sendAndConfirm(umi);
```

---

**Key Takeaways**
- Royalties plugin enforces creator royalties on every resale (not optional)
- `basisPoints` sets the percentage (500 = 5%); `creators` split the royalty
- Freeze/Transfer/Burn delegates give programs control over assets
- Collection-level plugins apply to all assets (set once, apply everywhere)
- Rule sets control which programs are allowed to transfer assets

**Next:** [06-lab-nft-collection.md](./06-lab-nft-collection.md)
