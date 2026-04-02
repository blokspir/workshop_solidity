# Common Solana Program Vulnerabilities

## 1. Missing Signer Checks

**The Bug:** An instruction doesn't verify that a required account actually signed the transaction.

```rust
// VULNERABLE: anyone can call this pretending to be the authority
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // transfers from vault to authority... but didn't check the signer!
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub authority: AccountInfo<'info>,  // NOT verified as signer!
    #[account(mut)]
    pub vault: Account<'info, Vault>,
}
```

**The Fix:** Use `Signer<'info>`:

```rust
#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub authority: Signer<'info>,  // Anchor verifies this signed the tx
    #[account(mut, has_one = authority)]
    pub vault: Account<'info, Vault>,
}
```

## 2. Missing Owner Checks

**The Bug:** An account is accepted without verifying it's owned by the expected program.

```rust
// VULNERABLE: attacker could pass a fake account with spoofed data
pub vault: AccountInfo<'info>,  // no owner check!
```

**The Fix:** Use `Account<'info, T>` which checks the owner automatically:

```rust
pub vault: Account<'info, Vault>,  // Anchor checks owner == your program
```

## 3. PDA Seed Collisions

**The Bug:** PDA seeds don't include enough information, leading to collisions.

```rust
// VULNERABLE: all users share the same PDA!
seeds = [b"vault"]

// CORRECT: each user gets their own PDA
seeds = [b"vault", user.key().as_ref()]
```

## 4. Integer Overflow / Underflow

**The Bug:** Arithmetic wraps around at the type's maximum or minimum value.

```rust
// VULNERABLE: if count is 0, this wraps to u64::MAX
let new_count = count - 1;

// SAFE: returns an error instead of wrapping
let new_count = count.checked_sub(1).ok_or(MyError::Underflow)?;
```

Always use checked math: `checked_add`, `checked_sub`, `checked_mul`, `checked_div`.

## 5. Reinitialization Attacks

**The Bug:** An account can be initialized multiple times, resetting its data.

```rust
// VULNERABLE: if init allows re-initialization, attacker resets the vault
#[account(init, ...)]
pub vault: Account<'info, Vault>,
```

**The Fix:** Anchor's `init` already prevents this -- it checks the account has no data. But if you use `init_if_needed`, add your own check:

```rust
#[account(
    init_if_needed,
    ...
)]
pub vault: Account<'info, Vault>,

// In the handler:
require!(!vault.is_initialized, MyError::AlreadyInitialized);
```

## 6. Closing Account Vulnerabilities

**The Bug:** An account is closed but its data isn't properly zeroed, or it can be "revived" in the same transaction.

**The Fix:** Use Anchor's `close` constraint, which handles zeroing:

```rust
#[account(
    mut,
    close = authority,
    has_one = authority,
)]
pub account_to_close: Account<'info, MyData>,
```

## 7. Type Confusion

**The Bug:** An account of one type is accepted where another type is expected.

Anchor's 8-byte discriminator prevents this. Each account type has a unique discriminator based on its name. If you pass a `Counter` where a `Vault` is expected, the discriminator check fails.

## Security Checklist

Before deploying any program:

- [ ] Every authority account uses `Signer<'info>`
- [ ] Every data account uses `Account<'info, T>` (not `AccountInfo`)
- [ ] PDA seeds include all necessary identifiers
- [ ] All arithmetic uses checked operations
- [ ] `has_one` validates account relationships
- [ ] No unnecessary `init_if_needed` (prefer `init`)
- [ ] Sensitive instructions validate all preconditions with `require!`
- [ ] Events are emitted for important state changes
- [ ] Error messages are descriptive

---

**Key Takeaways**
- Always use `Signer` for accounts that must sign, `Account<T>` for data accounts
- Include all necessary identifiers in PDA seeds to prevent collisions
- Use checked math for all arithmetic operations
- Anchor's discriminator prevents type confusion attacks
- Follow the checklist before every deployment

**Next:** [02-anchor-protections.md](./02-anchor-protections.md)
