# Creating a Token with Token-2022

Creating a Token-2022 mint requires several steps, each adding the extensions you need.

## The Process

1. Calculate the space needed for the mint + all extensions
2. Create the account with enough SOL for rent
3. Initialize each extension
4. Initialize the mint itself

## Using the Solana CLI (Quick Method)

For quick testing, you can create tokens directly from the CLI:

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
    --decimals 9 \
    --transfer-fee 100 10000 \
    --enable-metadata
```

- `--decimals 9` -- 9 decimal places (standard, like SOL)
- `--transfer-fee 100 10000` -- 1% fee (100 basis points, max 10000 tokens)
- `--enable-metadata` -- allows adding metadata

## Programmatic Creation (TypeScript)

For production, you'll create tokens programmatically:

```typescript
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    createInitializeTransferFeeConfigInstruction,
    getMintLen,
} from "@solana/spl-token";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const payer = Keypair.fromSecretKey(/* your keypair */);
const mintKeypair = Keypair.generate();

const decimals = 9;
const feeBasisPoints = 100;  // 1%
const maxFee = BigInt(10_000_000_000);  // 10 tokens max fee

// Step 1: Calculate space needed
const extensions = [ExtensionType.TransferFeeConfig];
const mintLen = getMintLen(extensions);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

// Step 2: Build the transaction
const transaction = new Transaction().add(
    // Create the account
    SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
    }),

    // Initialize transfer fee extension
    createInitializeTransferFeeConfigInstruction(
        mintKeypair.publicKey,
        payer.publicKey,     // transfer fee config authority
        payer.publicKey,     // withdraw withheld authority
        feeBasisPoints,
        maxFee,
        TOKEN_2022_PROGRAM_ID,
    ),

    // Initialize the mint
    createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        payer.publicKey,     // mint authority
        null,                // freeze authority (null = no freeze)
        TOKEN_2022_PROGRAM_ID,
    ),
);

// Step 3: Send
await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair]);
console.log("Mint created:", mintKeypair.publicKey.toString());
```

## Key Concepts

### Decimals

Tokens store amounts as integers. Decimals define how to display them:

| Decimals | Stored Value | Display Value |
|----------|-------------|---------------|
| 0 | 100 | 100 |
| 6 | 1000000 | 1.000000 |
| 9 | 1000000000 | 1.000000000 |

Standard is 9 decimals for utility tokens, 6 for stablecoins.

### Authorities

When creating a mint, you set several authority keys:

| Authority | What It Controls |
|-----------|-----------------|
| Mint Authority | Can mint new tokens |
| Freeze Authority | Can freeze token accounts |
| Transfer Fee Config Authority | Can change fee parameters |
| Withdraw Withheld Authority | Can harvest collected fees |

Authorities can be revoked (set to null) to make the token trustless. Once revoked, they cannot be restored.

### Order of Instructions Matters

Extensions MUST be initialized BEFORE the mint:

```
1. createAccount         ← create the account
2. initializeExtension   ← set up extensions (fees, metadata, etc.)
3. initializeMint        ← initialize the mint itself LAST
```

If you initialize the mint first, extension initialization will fail.

---

**Key Takeaways**
- Token-2022 creation: create account → initialize extensions → initialize mint (order matters)
- Calculate space with `getMintLen()` including all extension types
- Authorities control who can mint, freeze, and manage fees
- Standard decimals: 9 for utility tokens, 6 for stablecoins

**Next:** [03-transfer-fees.md](./03-transfer-fees.md)
