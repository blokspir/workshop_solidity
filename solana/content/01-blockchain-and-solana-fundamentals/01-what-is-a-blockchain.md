# What Is a Blockchain?

If you've only done traditional web development, a blockchain might feel alien. This section bridges the gap using concepts you already know.

## The Database Analogy

In a normal web app, you have a database (PostgreSQL, MongoDB, etc.) that stores your data. One company runs that database, and they control everything: who can read, who can write, who can delete.

A blockchain is a **shared database** with special properties:

1. **No single owner** -- thousands of computers (validators) each hold a copy
2. **Append-only** -- you can add data, but you can't modify or delete old data
3. **Transparent** -- anyone can read any data
4. **Trustless** -- you don't need to trust any single party; the math enforces the rules

## Blocks, Transactions, and Consensus

Data is added to a blockchain in **blocks**:

1. Users create **transactions** (instructions to change state, like "send 5 tokens to Alice")
2. Transactions are grouped into a **block**
3. Validators agree on which block to add next (**consensus**)
4. Once a block is confirmed, the transactions in it are permanent (**finality**)

Think of it like a Google Sheet where:
- Thousands of people each have a copy
- Anyone can add rows (transactions)
- Nobody can edit or delete old rows
- Everyone's copy is kept in sync automatically

## Why Would You Use This?

Traditional databases are faster and cheaper. You use a blockchain when you need:

| Need | Why blockchain helps |
|------|---------------------|
| **Ownership proof** | The database entry (token/NFT) lives in the user's wallet, not your server |
| **Trustless payments** | Smart contracts auto-execute payments. No middleman can withhold funds. |
| **Transparency** | All transactions are public and verifiable |
| **Permissionless** | Anyone can interact with your program without your permission |
| **Censorship resistance** | No single entity can shut down or modify the system |

If you don't need any of these properties, a regular database is the better choice.

## What Is a Smart Contract?

In traditional apps, your business logic runs on a server you control.

On a blockchain, business logic is deployed as a **smart contract** (Solana calls them **programs**). Once deployed, the program:

- Runs on every validator
- Cannot be changed (unless you've set it up to be upgradeable)
- Executes exactly as written -- no one can alter its behavior
- Is publicly readable by anyone

This is powerful for financial operations: a royalty split smart contract will always split royalties correctly, because the code enforces it and nobody can override it.

## Wallets

A **wallet** is how users interact with the blockchain. It consists of:

- A **private key** (secret -- proves you own the wallet)
- A **public key** (public -- your address on the blockchain)

The private key signs transactions. The public key identifies you. This is the same public-key cryptography used in HTTPS and SSH.

If you've used SSH keys to push to GitHub, you already understand the concept.

---

**Key Takeaways**
- A blockchain is a shared, append-only database with no single owner
- Data is added in blocks via transactions, agreed upon by consensus
- Smart contracts (programs) are code deployed on-chain that executes trustlessly
- You use blockchain when you need ownership, trustless logic, or transparency
- Wallets use public/private key pairs, same as SSH

**Next:** [02-how-solana-is-different.md](./02-how-solana-is-different.md)
