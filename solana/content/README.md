# Solana Blockchain Development -- Self-Study Curriculum

A comprehensive, modular learning path that takes you from zero blockchain knowledge to building full-stack Solana applications. Designed for developers with TypeScript and React experience.

---

## Prerequisites

Before starting, you should be comfortable with:

- **TypeScript** -- variables, functions, async/await, interfaces, generics
- **React** -- components, hooks (useState, useEffect, useRef), context
- **Next.js** -- basic pages, API routes, server vs client components
- **npm / yarn** -- installing packages, running scripts
- **Git** -- basic version control
- **Terminal / command line** -- navigating directories, running commands

No blockchain or Rust experience is required. The curriculum starts from scratch.

---

## Curriculum Map

| # | Module | Time | What You Learn |
|---|--------|------|----------------|
| 00 | [Environment Setup](./00-environment-setup/) | 1-2h | Install Rust, Solana CLI, Anchor. Deploy hello world. |
| 01 | [Blockchain & Solana Fundamentals](./01-blockchain-and-solana-fundamentals/) | 3-4h | How blockchains work. Solana's account model, programs, transactions, PDAs. |
| 02 | [Rust Essentials for Solana](./02-rust-essentials-for-solana/) | 3-4h | Ownership, structs, enums, traits, error handling, macros, Borsh. |
| 03 | [Anchor Framework](./03-anchor-framework/) | 4-5h | The main tool for writing Solana programs. Accounts, constraints, CPIs, testing. |
| 04 | [SPL Token-2022](./04-spl-token-2022/) | 3-4h | Creating fungible tokens with transfer fees, metadata, fixed supply. |
| 05 | [NFTs with Metaplex Core](./05-nfts-with-metaplex-core/) | 3-4h | Minting NFTs, collections, metadata, royalty enforcement. |
| 06 | [Permanent Storage (Arweave/Irys)](./06-permanent-storage-arweave-irys/) | 2h | Uploading metadata and files to permanent decentralized storage. |
| 07 | [Staking Programs](./07-staking-programs/) | 3-4h | Token locking, vault PDAs, reward calculation and distribution. |
| 08 | [Royalty & Fee Distribution](./08-royalty-and-fee-distribution/) | 3h | Auto-split fees to multiple recipients, claim mechanisms. |
| 09 | [Frontend Wallet Integration](./09-frontend-wallet-integration/) | 4-5h | Connect wallets, send transactions, read on-chain data from Next.js. |
| 10 | [Indexing & Event Tracking](./10-indexing-and-event-tracking/) | 2-3h | Helius webhooks, syncing on-chain events to a database. |
| 11 | [Security & Deployment](./11-security-and-deployment/) | 3-4h | Common vulnerabilities, multisig, deploying to devnet and mainnet. |
| 12 | [Capstone Exercises](./12-capstone-exercises/) | 4-6h | Five guided projects that combine everything. |

**Total estimated time: 38-48 hours** (roughly 5-7 full working days)

---

## Recommended Learning Path

### Phase 1: Foundations (Modules 00-02)
Get the tools installed, understand how Solana works, learn enough Rust to read and modify programs.

### Phase 2: Core Development (Modules 03-05)
Master Anchor, create tokens, mint NFTs. This is where you build real things.

### Phase 3: Advanced Programs (Modules 06-08)
Permanent storage, staking, and fee distribution. These are the building blocks of any token economy.

### Phase 4: Full-Stack Integration (Modules 09-10)
Connect everything to a frontend. Make your programs usable by real people.

### Phase 5: Production (Modules 11-12)
Security hardening, deployment, and capstone projects that tie it all together.

---

## How to Use These Materials

1. **Go in order.** Each module builds on the previous ones.
2. **Type the code yourself.** Don't copy-paste. Typing builds muscle memory.
3. **Run every example.** If there's a command or code block, run it.
4. **Do every exercise.** The exercises are where the real learning happens.
5. **Break things on purpose.** Change values, remove lines, see what errors you get.
6. **Use AI as a pair programmer.** When you're stuck on Rust syntax, ask AI to explain or generate code -- but make sure you understand what it generates.

---

## Key Resources

| Resource | URL |
|----------|-----|
| Solana Docs | https://solana.com/docs |
| Anchor Book | https://www.anchor-lang.com/ |
| Metaplex Docs | https://developers.metaplex.com/ |
| Solana Cookbook | https://solanacookbook.com/ |
| Rust Book | https://doc.rust-lang.org/book/ |
| Solana Playground | https://beta.solpg.io/ |
| Helius Docs | https://docs.helius.dev/ |
| Solana Explorer | https://explorer.solana.com/ |
| Solscan | https://solscan.io/ |

---

## Conventions Used in These Materials

- `bash` code blocks are terminal commands
- `rust` code blocks are Anchor/Rust program code
- `typescript` code blocks are client-side or test code
- **Exercise** sections are things you should build yourself
- **Key Takeaways** at the end of each file summarize the important points
- **Next** links at the bottom tell you where to go next
