# Errors and Events

Custom errors make debugging easier. Events let off-chain systems listen to what your program does.

## Custom Errors

Define errors with `#[error_code]`:

```rust
#[error_code]
pub enum MyError {
    #[msg("The provided amount must be greater than zero")]
    InvalidAmount,

    #[msg("You are not authorized to perform this action")]
    Unauthorized,

    #[msg("This account has already been initialized")]
    AlreadyInitialized,

    #[msg("Insufficient funds for this operation")]
    InsufficientFunds,

    #[msg("The listing is no longer active")]
    ListingInactive,
}
```

### Using Errors

With `require!`:

```rust
pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    require!(amount > 0, MyError::InvalidAmount);
    require!(
        ctx.accounts.vault.balance >= amount,
        MyError::InsufficientFunds
    );
    // ...
    Ok(())
}
```

With `return Err`:

```rust
if amount == 0 {
    return Err(error!(MyError::InvalidAmount));
}
```

### Anchor's Built-in Require Variants

```rust
require!(condition, ErrorType::Variant);
require_eq!(a, b, ErrorType::Variant);
require_neq!(a, b, ErrorType::Variant);
require_gt!(a, b, ErrorType::Variant);
require_gte!(a, b, ErrorType::Variant);
require_keys_eq!(key_a, key_b, ErrorType::Variant);
require_keys_neq!(key_a, key_b, ErrorType::Variant);
```

### Error Codes in Client Logs

When a transaction fails, the error code appears in the logs:

```
Program log: AnchorError occurred. Error Code: InvalidAmount. Error Number: 6000.
Error Message: The provided amount must be greater than zero.
```

Error numbers start at 6000 (0-indexed from your enum). Anchor errors use 0-5999.

## Events

Events are data emitted by your program that off-chain systems can listen to. Think of them as log entries with structured data.

### Defining Events

```rust
#[event]
pub struct TransferEvent {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct MintEvent {
    pub minter: Pubkey,
    pub mint: Pubkey,
    pub metadata_uri: String,
}
```

### Emitting Events

```rust
pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    // ... transfer logic ...

    emit!(TransferEvent {
        from: ctx.accounts.from.key(),
        to: ctx.accounts.to.key(),
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
```

### Why Events Matter

Events are how your backend/frontend knows what happened on-chain:

1. User mints an NFT → program emits `MintEvent`
2. Your indexer (Helius webhook) catches the event
3. Your backend stores the data in a database
4. Your frontend displays the activity feed

Without events, you'd have to parse raw transaction data, which is much harder.

### Listening to Events (Client Side)

```typescript
program.addEventListener("TransferEvent", (event) => {
    console.log("Transfer:", event.from.toString(), "→", event.to.toString());
    console.log("Amount:", event.amount.toString());
});
```

## Using Clock for Timestamps

Solana provides a `Clock` sysvar for getting the current time:

```rust
use anchor_lang::prelude::*;

pub fn create_with_timestamp(ctx: Context<Create>) -> Result<()> {
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;  // i64, seconds since epoch

    ctx.accounts.data.created_at = now;
    Ok(())
}
```

---

**Key Takeaways**
- Define custom errors with `#[error_code]` for clear failure messages
- Use `require!` macros for clean validation
- Events (`#[event]` + `emit!`) let off-chain systems track on-chain activity
- Error codes start at 6000 in Anchor
- Use `Clock::get()?.unix_timestamp` for on-chain timestamps

**Next:** [07-testing-with-anchor.md](./07-testing-with-anchor.md)
