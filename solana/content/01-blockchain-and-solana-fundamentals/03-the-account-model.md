# The Account Model

This is the single most important concept in Solana development. Everything on Solana is an account. If you understand accounts, you understand Solana.

## Everything Is an Account

On Solana, there is one data structure that holds everything: the **account**. Your wallet? An account. A deployed program? An account. A token balance? An account. An NFT? An account.

Every account has this structure:

| Field | Type | Description |
|-------|------|-------------|
| `lamports` | u64 | Balance in lamports (1 SOL = 1,000,000,000 lamports) |
| `data` | byte array | Arbitrary data stored in the account |
| `owner` | PublicKey | The program that controls this account |
| `executable` | bool | Whether this account contains a runnable program |
| `rent_epoch` | u64 | When rent was last collected |

That's it. Five fields. Every piece of data on Solana lives in an account with these five fields.

## Three Types of Accounts

### 1. Wallet Accounts (System Accounts)

Your wallet is an account with:
- `lamports`: your SOL balance
- `data`: empty (wallets don't store data)
- `owner`: the System Program
- `executable`: false

### 2. Program Accounts

A deployed program is an account with:
- `lamports`: enough to be rent-exempt
- `data`: the compiled program bytecode
- `owner`: the BPF Loader program
- `executable`: true

### 3. Data Accounts

State/data for your application:
- `lamports`: enough to be rent-exempt
- `data`: your application data (serialized as bytes)
- `owner`: your program (so only your program can modify the data)
- `executable`: false

## The Owner Rule

This is a critical security concept:

**Only the program that owns an account can modify its data.**

When you create a data account and set its owner to your program, only your program can write to it. No other program, no user, nobody else.

This is how Solana enforces data integrity without a traditional database permission system.

## Analogy: Accounts as Files

Think of Solana like a file system:

| File System | Solana |
|-------------|--------|
| File | Account |
| File contents | `data` field |
| File permissions (owner) | `owner` field |
| File size | data length |
| Directory | Program (groups related accounts) |

Just like a file is owned by a user in Linux and only that user can write to it, an account is owned by a program and only that program can modify it.

## Rent

Storing data on-chain costs resources (validators need RAM and disk). Solana charges **rent** for this storage.

However, if you deposit enough SOL in an account to cover 2 years of rent, the account becomes **rent-exempt** and lives forever without further charges.

In practice, you almost always make accounts rent-exempt. The Anchor framework handles the rent calculation automatically.

How much does rent-exemption cost? It depends on the data size:

| Data Size | Approx Rent-Exempt Cost |
|-----------|------------------------|
| 0 bytes (wallet) | ~0.001 SOL |
| 100 bytes | ~0.001 SOL |
| 1 KB | ~0.008 SOL |
| 10 KB | ~0.07 SOL |

These are tiny amounts at current SOL prices.

## Visual: How a Token Transfer Works

When Alice sends tokens to Bob, the transaction touches three accounts:

```
┌──────────────────┐
│  Alice's Token    │ ← Account 1: subtract token balance
│  Account          │    owner: Token Program
└──────────────────┘

┌──────────────────┐
│  Bob's Token      │ ← Account 2: add token balance
│  Account          │    owner: Token Program
└──────────────────┘

┌──────────────────┐
│  Token Mint       │ ← Account 3: read-only (token metadata)
│  Account          │    owner: Token Program
└──────────────────┘

The Token Program processes the instruction and
modifies Account 1 and Account 2 data.
```

The Token Program owns both token accounts, so it's the only entity that can modify their balances.

## Exercise

Open the Solana Explorer (https://explorer.solana.com/?cluster=devnet) and:

1. Look up your devnet wallet address. Notice it's an account with a SOL balance and no data.
2. Look up the System Program: `11111111111111111111111111111111`. Notice it's an executable account.
3. If you deployed the hello world program in Module 00, look up its address. Notice it's executable.

---

**Key Takeaways**
- Everything on Solana is an account with 5 fields: lamports, data, owner, executable, rent_epoch
- Programs are stateless executables. All state lives in separate data accounts.
- Only the owner program can modify an account's data (the Owner Rule)
- Rent-exemption is cheap and means your data lives forever

**Next:** [04-programs-and-instructions.md](./04-programs-and-instructions.md)
