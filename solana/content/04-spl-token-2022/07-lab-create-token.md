# Lab: Create a Complete Token

Build a Token-2022 token with transfer fees, metadata, fixed supply, and test transferring + burning.

## What You'll Build

A TypeScript script that:
1. Creates a Token-2022 mint with transfer fees and metadata
2. Mints 1 billion tokens to a treasury
3. Transfers tokens between accounts (observing fee deduction)
4. Burns tokens
5. Revokes mint authority

## Setup

Create a new project:

```bash
mkdir token-lab && cd token-lab
npm init -y
npm install @solana/web3.js @solana/spl-token @solana/spl-token-metadata
npm install -D typescript ts-node @types/node
npx tsc --init
```

## The Script

Create `create-token.ts`:

```typescript
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    ExtensionType,
    createInitializeMintInstruction,
    createInitializeTransferFeeConfigInstruction,
    createInitializeMetadataPointerInstruction,
    getMintLen,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    transfer,
    burn,
    setAuthority,
    AuthorityType,
    getAccount,
    getMint,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
    createInitializeInstruction,
    pack,
} from "@solana/spl-token-metadata";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function main() {
    // Load your devnet keypair
    const payer = Keypair.fromSecretKey(
        // Replace with your keypair or load from file
        Uint8Array.from(JSON.parse(require("fs").readFileSync(
            require("os").homedir() + "/.config/solana/id.json", "utf-8"
        )))
    );

    console.log("Payer:", payer.publicKey.toString());
    console.log("Balance:", await connection.getBalance(payer.publicKey) / LAMPORTS_PER_SOL, "SOL");

    // === Step 1: Create mint with extensions ===
    const mintKeypair = Keypair.generate();
    const decimals = 9;
    const feeBasisPoints = 100; // 1%
    const maxFee = BigInt(10) * BigInt(10 ** decimals); // max 10 tokens

    const metadata = {
        mint: mintKeypair.publicKey,
        name: "Lab Token",
        symbol: "LAB",
        uri: "https://example.com/metadata.json",
        additionalMetadata: [] as [string, string][],
    };

    const metadataLen = pack(metadata).length;
    const mintLen = getMintLen([
        ExtensionType.TransferFeeConfig,
        ExtensionType.MetadataPointer,
    ]);
    const totalLen = mintLen + metadataLen + 4 + 4; // TYPE_SIZE + LENGTH_SIZE
    const lamports = await connection.getMinimumBalanceForRentExemption(totalLen + 256);

    const createMintTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: totalLen + 256,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
            mintKeypair.publicKey,
            payer.publicKey,
            mintKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID,
        ),
        createInitializeTransferFeeConfigInstruction(
            mintKeypair.publicKey,
            payer.publicKey,
            payer.publicKey,
            feeBasisPoints,
            maxFee,
            TOKEN_2022_PROGRAM_ID,
        ),
        createInitializeMintInstruction(
            mintKeypair.publicKey,
            decimals,
            payer.publicKey,
            null,
            TOKEN_2022_PROGRAM_ID,
        ),
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

    await sendAndConfirmTransaction(connection, createMintTx, [payer, mintKeypair]);
    console.log("\nMint created:", mintKeypair.publicKey.toString());

    // === Step 2: Create treasury ATA and mint supply ===
    const treasury = await getOrCreateAssociatedTokenAccount(
        connection, payer, mintKeypair.publicKey, payer.publicKey,
        false, "confirmed", undefined, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const totalSupply = BigInt(1_000_000_000) * BigInt(10 ** decimals);
    await mintTo(
        connection, payer, mintKeypair.publicKey,
        treasury.address, payer, totalSupply,
        [], undefined, TOKEN_2022_PROGRAM_ID,
    );
    console.log("Minted", (totalSupply / BigInt(10 ** decimals)).toString(), "tokens to treasury");

    // === Step 3: Transfer (observe fee) ===
    const recipient = Keypair.generate();
    const airdropSig = await connection.requestAirdrop(recipient.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSig);

    const recipientAta = await getOrCreateAssociatedTokenAccount(
        connection, payer, mintKeypair.publicKey, recipient.publicKey,
        false, "confirmed", undefined, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const transferAmount = BigInt(1000) * BigInt(10 ** decimals);
    await transfer(
        connection, payer, treasury.address, recipientAta.address,
        payer, transferAmount, [], undefined, TOKEN_2022_PROGRAM_ID,
    );

    const recipientAccount = await getAccount(
        connection, recipientAta.address, "confirmed", TOKEN_2022_PROGRAM_ID,
    );
    console.log("\nTransferred:", (transferAmount / BigInt(10 ** decimals)).toString(), "tokens");
    console.log("Recipient received:", recipientAccount.amount.toString(), "base units");
    console.log("(Fee was deducted automatically)");

    // === Step 4: Burn tokens ===
    const burnAmount = BigInt(100) * BigInt(10 ** decimals);
    await burn(
        connection, payer, treasury.address, mintKeypair.publicKey,
        payer, burnAmount, [], undefined, TOKEN_2022_PROGRAM_ID,
    );

    const mintInfo = await getMint(connection, mintKeypair.publicKey, "confirmed", TOKEN_2022_PROGRAM_ID);
    console.log("\nBurned:", (burnAmount / BigInt(10 ** decimals)).toString(), "tokens");
    console.log("Remaining supply:", mintInfo.supply.toString(), "base units");

    // === Step 5: Revoke mint authority ===
    await setAuthority(
        connection, payer, mintKeypair.publicKey,
        payer, AuthorityType.MintTokens, null,
        [], undefined, TOKEN_2022_PROGRAM_ID,
    );
    console.log("\nMint authority REVOKED. Supply is now permanently fixed.");
}

main().catch(console.error);
```

## Running the Script

```bash
npx ts-node create-token.ts
```

## What to Observe

1. The mint is created with transfer fee and metadata extensions
2. 1 billion tokens are minted to the treasury
3. When transferring 1000 tokens, the recipient gets slightly less (1% fee withheld)
4. Burning reduces the total supply
5. After revoking mint authority, no more tokens can ever be minted

## Exercise

Extend the script to:
1. Harvest the withheld transfer fees from the recipient's account
2. Query and display the token metadata
3. Try to mint tokens after revoking authority (should fail)

---

**Key Takeaways**
- Creating a full token requires: account creation, extension init, mint init, metadata init
- Transfer fees are automatically deducted -- no extra code needed in transfers
- Burn reduces supply; revoke mint authority makes it permanent
- This is the full lifecycle of a platform utility token

**Next:** [Module 05 - NFTs with Metaplex Core](../05-nfts-with-metaplex-core/)
