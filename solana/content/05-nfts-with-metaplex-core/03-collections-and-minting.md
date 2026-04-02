# Collections and Minting

## Creating a Collection

A collection is the parent container for your NFTs:

```typescript
import { createCollection } from "@metaplex-foundation/mpl-core";
import { generateSigner } from "@metaplex-foundation/umi";

const collectionSigner = generateSigner(umi);

await createCollection(umi, {
    collection: collectionSigner,
    name: "My NFT Collection",
    uri: "https://arweave.net/collection-metadata.json",
}).sendAndConfirm(umi);

console.log("Collection created:", collectionSigner.publicKey);
```

The collection metadata JSON (at the URI) should look like:

```json
{
    "name": "My NFT Collection",
    "description": "A collection of unique digital assets",
    "image": "https://arweave.net/collection-image.png",
    "external_url": "https://example.com"
}
```

## Minting an NFT into a Collection

```typescript
import { create } from "@metaplex-foundation/mpl-core";
import { generateSigner } from "@metaplex-foundation/umi";

const assetSigner = generateSigner(umi);

await create(umi, {
    asset: assetSigner,
    collection: collectionSigner.publicKey,
    name: "Asset #1",
    uri: "https://arweave.net/asset-1-metadata.json",
}).sendAndConfirm(umi);

console.log("NFT minted:", assetSigner.publicKey);
```

The asset metadata JSON:

```json
{
    "name": "Asset #1",
    "description": "A unique digital asset",
    "image": "https://arweave.net/asset-1-image.png",
    "attributes": [
        { "trait_type": "Style", "value": "Anime" },
        { "trait_type": "Rarity", "value": "Rare" },
        { "trait_type": "Generation Model", "value": "v2.0" }
    ],
    "properties": {
        "files": [
            {
                "uri": "https://arweave.net/asset-1-image.png",
                "type": "image/png"
            }
        ]
    }
}
```

## Minting from an Anchor Program

When minting is triggered by your smart contract (e.g., user burns tokens → gets NFT):

```rust
use anchor_lang::prelude::*;
use mpl_core::instructions::CreateV2CpiBuilder;

pub fn mint_nft(ctx: Context<MintNft>, name: String, uri: String) -> Result<()> {
    CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.asset.to_account_info())
        .collection(Some(&ctx.accounts.collection.to_account_info()))
        .authority(Some(&ctx.accounts.collection_authority.to_account_info()))
        .payer(&ctx.accounts.payer.to_account_info())
        .owner(Some(&ctx.accounts.owner.to_account_info()))
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name(name)
        .uri(uri)
        .invoke()?;

    Ok(())
}
```

## Transferring NFTs

```typescript
import { transfer } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";

await transfer(umi, {
    asset: publicKey("ASSET_ADDRESS"),
    newOwner: publicKey("NEW_OWNER_ADDRESS"),
}).sendAndConfirm(umi);
```

## Burning NFTs

```typescript
import { burn } from "@metaplex-foundation/mpl-core";

await burn(umi, {
    asset: publicKey("ASSET_ADDRESS"),
}).sendAndConfirm(umi);
```

Only the asset owner (or a burn delegate) can burn.

## Fetching NFT Data

```typescript
import { fetchAsset, fetchCollection } from "@metaplex-foundation/mpl-core";

// Fetch a single asset
const asset = await fetchAsset(umi, publicKey("ASSET_ADDRESS"));
console.log("Name:", asset.name);
console.log("Owner:", asset.owner);
console.log("URI:", asset.uri);

// Fetch a collection
const collection = await fetchCollection(umi, publicKey("COLLECTION_ADDRESS"));
console.log("Collection:", collection.name);

// Fetch all assets in a collection
import { fetchAssetsByCollection } from "@metaplex-foundation/mpl-core";
const assets = await fetchAssetsByCollection(umi, publicKey("COLLECTION_ADDRESS"));
console.log("Total assets:", assets.length);
```

---

**Key Takeaways**
- Create a collection first, then mint NFTs into it
- Each NFT needs a metadata JSON file hosted on permanent storage (Arweave)
- Umi SDK handles all the transaction building for create, transfer, burn
- Assets can be fetched individually or by collection
- Minting can be done from TypeScript scripts or from Anchor programs via CPI

**Next:** [04-metadata-and-attributes.md](./04-metadata-and-attributes.md)
