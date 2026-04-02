# Lab: Build an NFT Collection

Create a collection, mint NFTs with metadata, and verify royalties.

## Setup

```bash
mkdir nft-lab && cd nft-lab
npm init -y
npm install @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/mpl-core @solana/web3.js
npm install -D typescript ts-node @types/node
npx tsc --init
```

## The Script

Create `mint-nfts.ts`:

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, createCollection, create, fetchAsset, fetchCollection, fetchAssetsByCollection } from "@metaplex-foundation/mpl-core";
import { generateSigner, keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { ruleSet } from "@metaplex-foundation/mpl-core";
import * as fs from "fs";
import * as os from "os";

async function main() {
    // Setup Umi
    const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

    // Load keypair
    const keypairFile = JSON.parse(
        fs.readFileSync(os.homedir() + "/.config/solana/id.json", "utf-8")
    );
    const keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(keypairFile)
    );
    umi.use(keypairIdentity(keypair));

    console.log("Wallet:", keypair.publicKey);

    // === Step 1: Create Collection ===
    const collectionSigner = generateSigner(umi);

    await createCollection(umi, {
        collection: collectionSigner,
        name: "AI Art Collection",
        uri: "https://example.com/collection.json",
        plugins: [
            {
                type: "Royalties",
                basisPoints: 500, // 5%
                creators: [
                    { address: keypair.publicKey, percentage: 100 },
                ],
                ruleSet: ruleSet("None"),
            },
        ],
    }).sendAndConfirm(umi);

    console.log("\nCollection created:", collectionSigner.publicKey);

    // === Step 2: Mint NFTs ===
    const nfts = [
        { name: "Cosmic Dragon #1", uri: "https://example.com/dragon1.json" },
        { name: "Cosmic Dragon #2", uri: "https://example.com/dragon2.json" },
        { name: "Cosmic Dragon #3", uri: "https://example.com/dragon3.json" },
    ];

    const mintedAssets = [];

    for (const nft of nfts) {
        const assetSigner = generateSigner(umi);

        await create(umi, {
            asset: assetSigner,
            collection: collectionSigner.publicKey,
            name: nft.name,
            uri: nft.uri,
        }).sendAndConfirm(umi);

        console.log(`Minted: ${nft.name} -> ${assetSigner.publicKey}`);
        mintedAssets.push(assetSigner.publicKey);
    }

    // === Step 3: Fetch and verify ===
    console.log("\n--- Verification ---");

    const collection = await fetchCollection(umi, collectionSigner.publicKey);
    console.log("Collection name:", collection.name);

    for (const assetKey of mintedAssets) {
        const asset = await fetchAsset(umi, assetKey);
        console.log(`\nAsset: ${asset.name}`);
        console.log(`  Owner: ${asset.owner}`);
        console.log(`  URI: ${asset.uri}`);
    }

    // Fetch all assets in collection
    const allAssets = await fetchAssetsByCollection(umi, collectionSigner.publicKey);
    console.log(`\nTotal assets in collection: ${allAssets.length}`);
}

main().catch(console.error);
```

## Run It

```bash
npx ts-node mint-nfts.ts
```

## What to Observe

1. Collection is created with 5% royalties
2. Three NFTs are minted into the collection
3. Each NFT has a unique address and shares the collection's royalty configuration
4. All NFTs can be fetched by collection

## Exercise

Extend this lab:

1. Add on-chain Attributes plugin to each NFT (rarity, power level, etc.)
2. Transfer one NFT to a different wallet (generate a new keypair)
3. Burn one NFT and verify it's gone
4. Fetch the collection again and confirm only 2 assets remain
5. Try transferring an NFT without paying royalties (it should work, but royalties are tracked for marketplace enforcement)

---

**Key Takeaways**
- Collection creation + NFT minting is straightforward with Umi
- Royalties set at collection level apply to all assets automatically
- Fetching by collection lets you enumerate all NFTs in a project
- The full flow is: upload metadata to Arweave → create collection → mint assets

**Next:** [Module 06 - Permanent Storage (Arweave/Irys)](../06-permanent-storage-arweave-irys/)
