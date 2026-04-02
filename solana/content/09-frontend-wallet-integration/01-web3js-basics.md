# @solana/web3.js Basics

`@solana/web3.js` is the core JavaScript SDK for interacting with Solana. Everything else builds on top of it.

## Installation

```bash
npm install @solana/web3.js
```

## Connection

A `Connection` connects to a Solana RPC node:

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

// Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Mainnet (use a dedicated RPC provider for production)
const connection = new Connection("https://your-rpc-provider.com", "confirmed");

// Custom RPC (Helius, QuickNode, etc.)
const connection = new Connection("https://rpc.helius.xyz/?api-key=YOUR_KEY", "confirmed");
```

For production, never use the public RPC endpoints (`api.mainnet-beta.solana.com`). They have rate limits. Use a provider like Helius, QuickNode, or Alchemy.

## PublicKey

A `PublicKey` represents an address on Solana:

```typescript
import { PublicKey } from "@solana/web3.js";

// From a string
const pubkey = new PublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");

// Program IDs
const SYSTEM_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

// Derive a PDA (same as Anchor's seeds + bump)
const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), userPublicKey.toBuffer()],
    programId
);
```

## Reading Account Data

```typescript
// Get SOL balance
const balance = await connection.getBalance(publicKey);
console.log("Balance:", balance / 1e9, "SOL");

// Get account info (raw)
const accountInfo = await connection.getAccountInfo(publicKey);
if (accountInfo) {
    console.log("Data length:", accountInfo.data.length);
    console.log("Owner:", accountInfo.owner.toString());
    console.log("Lamports:", accountInfo.lamports);
}
```

## Building Transactions

```typescript
import {
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    Keypair,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const transaction = new Transaction().add(
    SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: recipient,
        lamports: 0.1 * LAMPORTS_PER_SOL,
    })
);

const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [sender]  // signers
);

console.log("Transaction:", signature);
```

## Using BN for Large Numbers

Token amounts are u64 (up to ~18 quintillion). JavaScript's `number` loses precision above 2^53. Use `BN` from `@coral-xyz/anchor`:

```typescript
import { BN } from "@coral-xyz/anchor";

const amount = new BN(1_000_000_000);  // 1 token with 9 decimals
const big = new BN("1000000000000000000");  // large number as string
```

---

**Key Takeaways**
- `Connection` connects to an RPC node; use a dedicated provider for production
- `PublicKey` represents addresses; use `findProgramAddressSync` to derive PDAs
- Transactions bundle instructions and require signers
- Use `BN` for token amounts to avoid precision loss

**Next:** [02-wallet-adapter-setup.md](./02-wallet-adapter-setup.md)
