# Token Metadata (Token-2022 Extension)

Token-2022's metadata extension stores token name, symbol, and URI directly on the mint account. No separate metadata program needed.

## Why On-Chain Metadata?

With the original SPL Token, metadata required the Metaplex Token Metadata program -- a separate account and program. Token-2022 embeds metadata directly in the mint, simplifying everything.

## Adding Metadata During Creation

```typescript
import {
    createInitializeMetadataPointerInstruction,
    TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    pack,
} from "@solana/spl-token-metadata";

// The metadata to store
const metadata = {
    mint: mintKeypair.publicKey,
    name: "My Token",
    symbol: "MTK",
    uri: "https://arweave.net/your-metadata-json",
    additionalMetadata: [
        ["description", "A platform utility token"],
        ["website", "https://example.com"],
    ],
};

// Calculate space for metadata
const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
const metadataLen = pack(metadata).length;
const mintLen = getMintLen([ExtensionType.TransferFeeConfig, ExtensionType.MetadataPointer]);
const totalLen = mintLen + metadataExtension + metadataLen;

const transaction = new Transaction().add(
    // Create account with enough space
    SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: totalLen,
        lamports: await connection.getMinimumBalanceForRentExemption(totalLen),
        programId: TOKEN_2022_PROGRAM_ID,
    }),

    // Point metadata to the mint itself
    createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        payer.publicKey,      // metadata authority
        mintKeypair.publicKey, // metadata address (self-referencing)
        TOKEN_2022_PROGRAM_ID,
    ),

    // Initialize transfer fee (if using)
    // ...

    // Initialize mint
    createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        payer.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID,
    ),

    // Initialize metadata
    createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
    }),
);
```

## The Metadata URI

The `uri` field typically points to a JSON file hosted on Arweave (permanent storage):

```json
{
    "name": "My Token",
    "symbol": "MTK",
    "description": "A platform utility token for the ecosystem",
    "image": "https://arweave.net/your-logo-image",
    "external_url": "https://example.com",
    "attributes": []
}
```

Wallets and explorers read this JSON to display the token's logo and description.

## Updating Metadata

If you kept the update authority:

```typescript
await createUpdateFieldInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mintPublicKey,
    updateAuthority: payer.publicKey,
    field: "name",
    value: "Updated Token Name",
});
```

## Reading Metadata

```typescript
import { getTokenMetadata } from "@solana/spl-token";

const metadata = await getTokenMetadata(
    connection,
    mintPublicKey,
    "confirmed",
    TOKEN_2022_PROGRAM_ID,
);

console.log("Name:", metadata.name);
console.log("Symbol:", metadata.symbol);
console.log("URI:", metadata.uri);
```

---

**Key Takeaways**
- Token-2022 metadata stores name, symbol, and URI directly on the mint
- The metadata pointer points to the mint itself (self-referencing)
- URI should link to a JSON file with full metadata (hosted on Arweave)
- Metadata must be initialized AFTER the mint is initialized (exception to the usual order)
- Additional key-value pairs can be stored as `additionalMetadata`

**Next:** [05-minting-and-supply.md](./05-minting-and-supply.md)
