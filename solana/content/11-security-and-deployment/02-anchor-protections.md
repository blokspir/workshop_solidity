# Anchor's Built-In Protections

Anchor prevents many common vulnerabilities automatically. Here's what it does for you.

## Automatic Protections

### 1. Account Discriminator

Every Anchor account has an 8-byte discriminator (hash of the account name). When you use `Account<'info, T>`, Anchor checks that the first 8 bytes match. This prevents type confusion attacks.

### 2. Owner Checks

`Account<'info, T>` verifies the account is owned by your program. You can't accidentally accept an account owned by a different program.

### 3. Signer Verification

`Signer<'info>` verifies the account signed the transaction. No manual signature checks needed.

### 4. Program Verification

`Program<'info, T>` verifies the account is the expected program. Prevents someone from passing a fake program.

### 5. PDA Derivation

`seeds = [...]` and `bump` verify the account is at the correct PDA address. Can't pass a random account claiming to be a PDA.

### 6. Serialization Safety

Anchor uses Borsh serialization with length prefixes for variable-length types. Buffer overflow attacks through malformed data are prevented.

## What Anchor Does NOT Protect

### Business Logic Errors

Anchor can't know your business rules:

```rust
// Anchor won't catch this -- it's a business logic bug
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // Missing: check that amount <= vault.balance
    // Missing: check that the withdrawal period has passed
    // Missing: check that the user hasn't already withdrawn today
}
```

### Cross-Account Validation

`has_one` helps, but complex relationships need manual checks:

```rust
// You need to manually verify:
require!(
    ctx.accounts.listing.seller == ctx.accounts.seller.key(),
    MyError::WrongSeller
);
require!(
    ctx.accounts.listing.mint == ctx.accounts.nft_mint.key(),
    MyError::WrongNft
);
```

### Arithmetic Safety

Anchor doesn't auto-wrap your math in checked operations. You must use `checked_add`, `checked_sub`, etc. explicitly.

### Rate Limiting / Abuse Prevention

On-chain programs can't rate-limit. If someone spams your program with valid transactions, they'll all succeed. Rate limiting must happen at the RPC or frontend level.

## Best Practice: Defense in Depth

Even with Anchor's protections, add explicit checks:

```rust
pub fn transfer_ownership(ctx: Context<TransferOwnership>) -> Result<()> {
    // Anchor already checks signer and account types, but add business logic:
    require!(
        ctx.accounts.current_owner.key() == ctx.accounts.asset.authority,
        MyError::NotOwner
    );
    require!(
        ctx.accounts.new_owner.key() != ctx.accounts.current_owner.key(),
        MyError::SameOwner
    );

    ctx.accounts.asset.authority = ctx.accounts.new_owner.key();
    Ok(())
}
```

---

**Key Takeaways**
- Anchor automatically handles: discriminators, owner checks, signer verification, PDA validation
- You still must handle: business logic, cross-account validation, arithmetic safety
- Always add explicit `require!` checks for business rules
- Defense in depth: trust Anchor's protections but add your own too

**Next:** [03-multisig-and-authorities.md](./03-multisig-and-authorities.md)
