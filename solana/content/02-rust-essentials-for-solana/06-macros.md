# Macros

Macros are code that generates code. They're used extensively in Anchor. You don't need to write macros, but you need to recognize them.

## Two Types of Macros

### 1. Function-like Macros (with `!`)

Called with `!` and look like function calls:

```rust
println!("Hello, {}!", name);       // print to console
vec![1, 2, 3];                      // create a vector
format!("Hello, {}!", name);        // create a formatted String
msg!("Log message: {}", value);     // Solana program logging
```

These generate code at compile time. `println!` generates different code depending on how many arguments you pass -- something a regular function can't do.

### 2. Attribute Macros (with `#[...]`)

Placed above items (structs, functions, modules) to transform them:

```rust
#[derive(Debug, Clone)]        // auto-implement traits
struct Point { x: f64, y: f64 }

#[test]                          // mark as a test function
fn test_something() { }

#[allow(unused_variables)]       // suppress a warning
fn example() { let x = 5; }
```

## Anchor Macros You'll See Everywhere

### `declare_id!`

Sets the program's on-chain address:

```rust
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

### `#[program]`

Marks the module containing your instructions:

```rust
#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}
```

### `#[derive(Accounts)]`

Generates account validation code:

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init, payer = payer, space = 8 + 32)]
    pub data_account: Account<'info, MyData>,

    pub system_program: Program<'info, System>,
}
```

### `#[account]`

Marks a struct as an on-chain account and adds serialization:

```rust
#[account]
pub struct MyData {
    pub value: u64,
    pub authority: Pubkey,
}
```

### `#[account(...)]` (constraints)

Adds validation rules to accounts:

```rust
#[account(mut)]                    // account must be writable
#[account(init, payer = x, space = 100)]  // create new account
#[account(seeds = [b"vault"], bump)]       // PDA validation
#[account(has_one = authority)]            // field must match
#[account(constraint = amount > 0)]       // custom validation
```

### `msg!`

Logging in Solana programs (instead of `println!`):

```rust
msg!("Transfer of {} tokens from {} to {}", amount, from, to);
```

These logs appear in transaction details on explorers and in `solana logs` output.

### `require!`

Validation with error:

```rust
require!(amount > 0, MyError::InvalidAmount);
require_keys_eq!(ctx.accounts.authority.key(), expected_key, MyError::WrongAuthority);
```

### `emit!`

Emitting events (for indexers to listen to):

```rust
emit!(TransferEvent {
    from: ctx.accounts.from.key(),
    to: ctx.accounts.to.key(),
    amount,
});
```

## How to Read Macro-Heavy Code

When you see a macro you don't recognize:

1. **Look at what's around it** -- the context usually makes the purpose clear
2. **Check the Anchor docs** -- most Solana macros are from Anchor
3. **Think of it as code generation** -- the macro writes boilerplate code for you

You don't need to understand the macro implementation, just what it produces.

---

**Key Takeaways**
- Function-like macros use `!`: `msg!()`, `vec![]`, `require!()`
- Attribute macros use `#[...]`: `#[program]`, `#[account]`, `#[derive(...)]`
- Anchor's macros handle most of the boilerplate in Solana programs
- You don't write macros -- you use them. Recognize the pattern and know what they do.

**Next:** [07-borsh-serialization.md](./07-borsh-serialization.md)
