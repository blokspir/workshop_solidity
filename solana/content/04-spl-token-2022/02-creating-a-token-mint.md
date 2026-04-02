# Creating a Token Mint

A **mint** is the account that defines a token: its supply, decimals, and who can mint more. Every token on Solana has exactly one mint account.

## Creating a Mint with the CLI

The fastest way to create a token for testing:

```bash
# Create a Token-2022 mint with 9 decimals
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --decimals 9
```

Output:

```
Creating token <MINT_ADDRESS>
Address:  <MINT_ADDRESS>
Decimals: 9
```

## Creating a Mint with TypeScript

For programmatic creation with full control:

```typescript
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    getMintLen,
    ExtensionType,
} from "@solana/spl-token";

async function createMint(
    connection: Connection,
    payer: Keypair,
    decimals: number
) {
    const mintKeypair = Keypair.generate();

    const extensions = [ExtensionType.TransferFeeConfig];
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
        // 1. Create the account
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        // 2. Initialize extensions (before initializing the mint!)
        // ... extension-specific instructions go here ...

        // 3. Initialize the mint
        createInitializeMintInstruction(
            mintKeypair.publicKey,
            decimals,
            payer.publicKey,      // mint authority
            payer.publicKey,      // freeze authority (or null)
            TOKEN_2022_PROGRAM_ID
        )
    );

    await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair]);
    return mintKeypair.publicKey;
}
```

## Key Concepts

### Decimals

Tokens are stored as integers on-chain. Decimals tell UIs how to display them:

| Decimals | On-chain value | Display value |
|----------|---------------|---------------|
| 9 | 1,000,000,000 | 1.0 |
| 9 | 500,000,000 | 0.5 |
| 6 | 1,000,000 | 1.0 (USDC-style) |
| 0 | 1 | 1 (NFT-style) |

Most tokens use **9 decimals** (same as SOL). Stablecoins often use 6.

### Mint Authority

The **mint authority** is the keypair (or PDA) that can create new tokens. If you want a fixed supply, you later revoke this authority.

### Freeze Authority

The **freeze authority** can freeze token accounts (preventing transfers). Set to `null` if you don't want this power.

## Order of Operations

When creating a Token-2022 mint with extensions, the order matters:

```
1. CreateAccount (allocate space)
2. Initialize extensions (TransferFee, Metadata, etc.)
3. InitializeMint (set decimals, authorities)
```

Extensions MUST be initialized before the mint is initialized.

---

**Key Takeaways**
- A mint account defines a token (supply, decimals, authority)
- Use the CLI for quick testing, TypeScript for programmatic control
- Most tokens use 9 decimals
- Extensions must be initialized before the mint itself
- Mint authority controls who can create new tokens

**Next:** [03-transfer-fees.md](./03-transfer-fees.md)
