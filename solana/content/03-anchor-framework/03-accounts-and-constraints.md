# Accounts and Constraints

The `#[derive(Accounts)]` struct is where most of the Anchor magic happens. This file covers every account type and constraint you'll use.

## Account Types

### `Signer<'info>`

Verifies that the account signed the transaction:

```rust
pub authority: Signer<'info>,
```

Use for: the user initiating the action (payer, owner, admin).

### `Account<'info, T>`

A deserialized data account of type T:

```rust
pub user_profile: Account<'info, UserProfile>,
```

Anchor automatically:
- Checks the account is owned by your program
- Deserializes the data into the struct type T
- Checks the discriminator matches

### `SystemAccount<'info>`

An account owned by the System Program (a regular wallet):

```rust
pub recipient: SystemAccount<'info>,
```

Use for: transferring SOL to a wallet.

### `Program<'info, T>`

Verifies the account is a specific program:

```rust
pub system_program: Program<'info, System>,
pub token_program: Program<'info, Token>,
```

### `UncheckedAccount<'info>`

An account with no validation. Dangerous -- use only when you handle validation yourself:

```rust
/// CHECK: Validated in instruction logic
pub some_account: UncheckedAccount<'info>,
```

The `/// CHECK:` comment is required by Anchor. It documents why the account is unchecked.

## Constraints

Constraints are validations applied via `#[account(...)]`.

### `mut` -- Writable

```rust
#[account(mut)]
pub user_profile: Account<'info, UserProfile>,
```

Marks the account as writable. Required for any account you modify.

### `init` -- Create a New Account

```rust
#[account(
    init,
    payer = authority,
    space = 8 + 32 + 8,
)]
pub new_account: Account<'info, MyData>,
```

Creates and initializes a new account. Requires:
- `payer` -- who pays for the rent
- `space` -- how many bytes to allocate

When using `init`, the System Program must be included in the accounts.

### `init_if_needed` -- Create or Reuse

```rust
#[account(
    init_if_needed,
    payer = authority,
    space = 8 + 32 + 8,
)]
pub account: Account<'info, MyData>,
```

Creates the account if it doesn't exist, otherwise uses the existing one. Enable this with a feature flag in `Cargo.toml`:

```toml
[dependencies]
anchor-lang = { version = "0.30.1", features = ["init-if-needed"] }
```

### `seeds` and `bump` -- PDA Validation

```rust
#[account(
    seeds = [b"user_profile", authority.key().as_ref()],
    bump,
)]
pub user_profile: Account<'info, UserProfile>,
```

Validates that the account is the correct PDA for the given seeds.

Combined with `init`:

```rust
#[account(
    init,
    payer = authority,
    space = UserProfile::SPACE,
    seeds = [b"user_profile", authority.key().as_ref()],
    bump,
)]
pub user_profile: Account<'info, UserProfile>,
```

### `has_one` -- Field Match

```rust
#[account(
    mut,
    has_one = authority,
)]
pub user_profile: Account<'info, UserProfile>,
pub authority: Signer<'info>,
```

Validates that `user_profile.authority == authority.key()`. The field name in the data struct must match the account name.

### `constraint` -- Custom Validation

```rust
#[account(
    constraint = user_profile.is_active @ MyError::AccountInactive,
)]
pub user_profile: Account<'info, UserProfile>,
```

Any boolean expression. The `@` specifies the error to return if validation fails.

### `close` -- Close an Account

```rust
#[account(
    mut,
    close = authority,
)]
pub account_to_close: Account<'info, MyData>,
```

Closes the account and sends its rent SOL to the specified account.

### `realloc` -- Resize an Account

```rust
#[account(
    mut,
    realloc = 8 + 32 + (4 + new_length),
    realloc::payer = authority,
    realloc::zero = false,
)]
pub expandable: Account<'info, MyData>,
```

Changes the account size. Useful when data grows (e.g., adding items to a list).

## Putting It Together

A real-world example combining multiple constraints:

```rust
#[derive(Accounts)]
#[instruction(content: String)]
pub struct UpdateNote<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(
        mut,
        seeds = [b"note", author.key().as_ref(), &note.id.to_le_bytes()],
        bump = note.bump,
        has_one = author,
        constraint = note.is_active @ NoteError::NoteArchived,
    )]
    pub note: Account<'info, NoteData>,
}
```

This validates:
1. `author` signed the transaction
2. `note` is the correct PDA
3. `note.author` matches the signer
4. `note.is_active` is true

All before your handler code runs.

---

**Key Takeaways**
- Account types (`Signer`, `Account`, `Program`, etc.) define what kind of account is expected
- Constraints (`init`, `mut`, `seeds`, `has_one`, `constraint`) add validation rules
- Anchor checks all constraints before your handler runs -- invalid inputs are rejected automatically
- `init` creates accounts; `close` destroys them; `realloc` resizes them
- `has_one` checks that an account field matches another account in the struct

**Next:** [04-pdas-in-anchor.md](./04-pdas-in-anchor.md)
