# Program Derived Addresses (PDAs)

PDAs are one of Solana's most powerful concepts. If accounts are the "tables" of Solana, PDAs are the "primary keys" that let you find the right row.

## The Problem PDAs Solve

Imagine you're building a notes app. Each user can create notes. You need to store each note on-chain in its own account. But how do you find a specific user's note later?

On a traditional database, you'd query: `SELECT * FROM notes WHERE user_id = ? AND note_id = ?`

On Solana, there's no query language. You need to know the exact **address** of the account. PDAs let you **deterministically derive** an address from known inputs.

## What Is a PDA?

A PDA is an account address that is:

1. **Derived** from a set of **seeds** (arbitrary byte strings) and a **program ID**
2. **Deterministic** -- the same seeds always produce the same address
3. **Not on the ed25519 curve** -- meaning no one has a private key for this address

That third point is critical: because no one has a private key, only the program itself can sign for PDA accounts. This makes them safe for storing program state.

## How Seeds Work

Seeds are the inputs used to derive a PDA. They can be any combination of bytes:

```
PDA Address = derive(seeds, program_id)
```

Examples:

```
// A global config account (one per program)
seeds = ["config"]

// A user's profile (one per user)
seeds = ["user_profile", user_public_key]

// A specific note by a specific user
seeds = ["note", user_public_key, note_id]
```

The seeds act like a composite primary key in a database.

## The Bump

When deriving a PDA, the algorithm sometimes produces an address that IS on the ed25519 curve (meaning someone could have a private key for it). To avoid this, the algorithm tries adding a "bump" value (starting at 255, decrementing) until it finds an address that's off the curve.

```
seeds = ["user_profile", user_public_key]
bump = 254  (the canonical bump -- first value that works)

PDA = derive(seeds + [bump], program_id)
```

The bump is stored and passed in subsequent calls so the PDA can be re-derived.

In Anchor, bump handling is mostly automatic. You'll see it as:

```rust
#[account(
    seeds = [b"user_profile", user.key().as_ref()],
    bump
)]
pub user_profile: Account<'info, UserProfile>,
```

Anchor finds and verifies the bump for you.

## PDA Patterns

### Global Singleton

One account for the entire program (e.g., global config):

```rust
seeds = [b"global_config"]
```

### Per-User Account

One account per user:

```rust
seeds = [b"user_vault", user.key().as_ref()]
```

### Per-User Per-Entity

One account per combination (e.g., user's stake in a specific pool):

```rust
seeds = [b"stake", pool.key().as_ref(), user.key().as_ref()]
```

### Counter/Sequential

Using a numeric counter for ordered items:

```rust
seeds = [b"note", user.key().as_ref(), &note_count.to_le_bytes()]
```

## Why PDAs Matter

PDAs are everywhere in Solana development:

- **Token accounts** are PDAs derived from the wallet address and token mint
- **Staking vaults** use PDAs to store locked tokens securely
- **NFT metadata** accounts are PDAs derived from the mint address
- **User profiles**, **game state**, **marketplace listings** -- all PDAs

Every time your program needs to store data, you'll create a PDA.

## Exercise

Think about a social media app. What PDAs would you define for:

1. A user profile
2. A post by a user
3. A like on a post
4. A follow relationship between two users

Write out the seeds for each one.

---

**Key Takeaways**
- PDAs are deterministic addresses derived from seeds + a program ID
- They act like composite primary keys for finding on-chain data
- No one has a private key for a PDA, so only the program can control it
- Seeds can be any bytes: strings, public keys, numbers
- The bump ensures the address is off the ed25519 curve
- Anchor handles bump calculation automatically

**Next:** [07-tokens-and-explorers.md](./07-tokens-and-explorers.md)
