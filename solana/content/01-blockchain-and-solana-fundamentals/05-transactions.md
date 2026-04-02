# Transactions

A **transaction** is a signed message sent to the Solana network. It contains one or more instructions bundled together.

## Transaction Structure

```
Transaction
├── Signatures[]        ← Who signed this transaction
├── Message
│   ├── Header          ← How many signers, read-only accounts, etc.
│   ├── Account Keys[]  ← All accounts referenced by any instruction
│   ├── Recent Blockhash ← Proves the tx is recent (prevents replay)
│   └── Instructions[]   ← The actual operations to perform
```

## Key Properties

### Atomic

All instructions in a transaction either succeed or fail together. If instruction 3 out of 5 fails, all 5 are rolled back. This is like a database transaction.

This is powerful: you can bundle "create account" + "initialize data" + "transfer tokens" into one transaction, knowing that if any step fails, everything reverts.

### Signed

Every transaction must be signed by at least one keypair (the fee payer). Additional signers can be required depending on the instructions.

### Size-Limited

A transaction has a maximum size of **1,232 bytes**. This limits how many instructions you can fit into one transaction. For complex operations, you might need multiple transactions.

### Fees

The fee payer (first signer) pays a small fee for the transaction. On Solana, fees are extremely low (typically ~0.000005 SOL, about $0.001 USD).

Fees go to validators as compensation for processing transactions.

## Transaction Lifecycle

```
1. Client creates transaction
   ↓
2. Client signs with wallet
   ↓
3. Transaction sent to RPC node
   ↓
4. RPC forwards to validator leader
   ↓
5. Leader includes it in a block
   ↓
6. Block is confirmed by other validators
   ↓
7. Transaction is finalized (~5 seconds)
```

## Confirmation Levels

When you send a transaction, you can choose how long to wait for confirmation:

| Level | Meaning | Wait Time |
|-------|---------|-----------|
| `processed` | One validator processed it | ~400ms |
| `confirmed` | 66% of validators confirmed | ~5s |
| `finalized` | Irreversible, won't be rolled back | ~12s |

For most development, `confirmed` is sufficient. Use `finalized` for critical financial operations.

## Multiple Instructions in One Transaction

A common pattern is bundling related operations:

```typescript
const transaction = new Transaction();

// Instruction 1: Create the token account
transaction.add(createAccountInstruction);

// Instruction 2: Initialize the token account
transaction.add(initializeAccountInstruction);

// Instruction 3: Mint tokens into it
transaction.add(mintToInstruction);

// All three succeed or all three fail
await sendAndConfirmTransaction(connection, transaction, [payer]);
```

This atomicity is one of the most useful properties for building reliable applications.

## Exercise

Open the Solana Explorer (https://explorer.solana.com/?cluster=devnet) and find a recent transaction. Look at:

1. The signatures section -- who signed it?
2. The instruction list -- what operations did it perform?
3. The account inputs -- which accounts were read/written?
4. The fee -- how much did it cost?

---

**Key Takeaways**
- A transaction bundles one or more instructions into an atomic operation
- All instructions succeed or all fail (atomicity)
- Transactions must be signed and have a size limit of 1,232 bytes
- Fees are extremely low (~$0.001 per transaction)
- `confirmed` commitment is sufficient for most operations

**Next:** [06-program-derived-addresses.md](./06-program-derived-addresses.md)
