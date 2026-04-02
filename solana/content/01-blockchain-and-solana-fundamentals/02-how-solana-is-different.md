# How Solana Is Different

Solana is one of many blockchains. The most well-known is Ethereum. Here's why Solana is different and why it matters for development.

## Speed and Cost

| Metric | Ethereum | Solana |
|--------|----------|--------|
| Transactions per second | ~15-30 | ~4,000+ |
| Block time | ~12 seconds | ~400 milliseconds |
| Transaction cost | $1-50+ | $0.00025 |
| Finality | ~6 minutes | ~5 seconds |

For applications that need fast, cheap transactions (minting NFTs, micropayments, games), Solana's speed and cost are significant advantages.

## Proof of History

Most blockchains have a "how do we agree on the order of events" problem. Ethereum uses Proof of Stake with a slot-based system. Solana invented **Proof of History (PoH)** -- a cryptographic clock that timestamps events before consensus.

Think of it like this:
- **Without PoH:** Validators receive transactions and argue about what order they happened in
- **With PoH:** Transactions arrive already timestamped. Validators just verify the timestamps.

You don't need to deeply understand PoH to develop on Solana, but it explains why Solana is so fast.

## Parallel Execution

On Ethereum, transactions are processed one at a time (sequential).

On Solana, transactions that touch **different accounts** can be processed simultaneously (parallel). This is like the difference between a single-lane road and a highway.

This has a development implication: when you write a Solana transaction, you must declare upfront which accounts it will read from and write to. Solana uses this information to parallelize.

## Programming Language

| | Ethereum | Solana |
|---|----------|--------|
| Smart contract language | Solidity (JS-like) | Rust |
| VM / runtime | EVM | SVM (Sealevel) |
| Framework | Hardhat, Foundry | Anchor |

Solana programs are written in Rust (with a framework called Anchor). Rust has a steeper learning curve than Solidity, but the Anchor framework simplifies a lot of the complexity.

## The Account Model (Preview)

This is the biggest conceptual difference. In Ethereum:
- A smart contract has its own storage (state) built-in
- You call methods on the contract, and it reads/writes its own storage

In Solana:
- Programs (smart contracts) are **stateless** -- they hold no data
- All data lives in separate **accounts**
- A program reads and writes data by receiving accounts as inputs to instructions

This is covered in depth in the next file. It's the single most important concept to understand.

## Development Experience

Solana's developer experience has improved dramatically:

- **Anchor** makes writing programs feel similar to writing a REST API
- **TypeScript SDKs** mean your frontend code looks familiar
- **Fast iteration** -- builds take seconds, deploys take seconds, transactions confirm in ~400ms
- **Cheap testing** -- devnet SOL is free, and transactions cost fractions of a cent

The main challenge is Rust's learning curve, which Module 02 addresses.

---

**Key Takeaways**
- Solana is much faster and cheaper than Ethereum (~400ms blocks, $0.00025 per tx)
- Proof of History is the innovation that enables this speed
- Programs (smart contracts) are stateless; all data lives in separate accounts
- You'll write Rust with the Anchor framework for smart contracts, TypeScript for everything else

**Next:** [03-the-account-model.md](./03-the-account-model.md)
