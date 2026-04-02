# Program Basics

Let's break down every part of an Anchor program. By the end of this file, you'll understand the anatomy of any Anchor program.

## The Full Structure

An Anchor program has three sections:

```rust
use anchor_lang::prelude::*;

// 1. Program ID
declare_id!("11111111111111111111111111111111");

// 2. Instruction Handlers
#[program]
pub mod my_program {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, name: String) -> Result<()> {
        // business logic here
        Ok(())
    }

    pub fn update_user(ctx: Context<UpdateUser>, name: String) -> Result<()> {
        // business logic here
        Ok(())
    }
}

// 3. Account Definitions
#[derive(Accounts)]
pub struct CreateUser<'info> {
    // accounts this instruction needs
}

#[derive(Accounts)]
pub struct UpdateUser<'info> {
    // accounts this instruction needs
}

// 4. Data Accounts
#[account]
pub struct UserData {
    pub name: String,
    pub authority: Pubkey,
}
```

## Section 1: `declare_id!`

```rust
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

This is your program's on-chain address. It's generated when you first build (`anchor build`) and can be synced with `anchor keys sync`.

## Section 2: `#[program]` Module

The `#[program]` module contains your instruction handlers. Each public function is an instruction that clients can call.

```rust
#[program]
pub mod my_program {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, name: String) -> Result<()> {
        let user = &mut ctx.accounts.user_account;
        user.name = name;
        user.authority = ctx.accounts.authority.key();
        Ok(())
    }
}
```

Every handler:
- Takes `ctx: Context<T>` as the first parameter (T is the accounts struct)
- Can take additional parameters (instruction data sent by the client)
- Returns `Result<()>`
- Accesses accounts through `ctx.accounts`

### Context

The `Context` struct gives you access to:

```rust
ctx.accounts    // the validated accounts
ctx.program_id  // your program's public key
ctx.bumps       // PDA bumps (when using seeds)
```

## Section 3: Account Structs

Each instruction has a corresponding `#[derive(Accounts)]` struct that defines what accounts it needs:

```rust
#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32 + (4 + 64),
    )]
    pub user_account: Account<'info, UserData>,

    pub system_program: Program<'info, System>,
}
```

Anchor validates these accounts automatically before your handler runs. If any validation fails, the instruction is rejected.

## Section 4: Data Account Structs

```rust
#[account]
pub struct UserData {
    pub authority: Pubkey,   // 32 bytes
    pub name: String,        // 4 + len bytes
}
```

These define the shape of data stored on-chain. The `#[account]` macro adds:
- Borsh serialization/deserialization
- An 8-byte discriminator (for type checking)

## The Full Flow

When a client calls `create_user`:

```
1. Client sends transaction with:
   - Instruction: "create_user"
   - Accounts: [authority, user_account, system_program]
   - Data: { name: "Alice" }
         ↓
2. Anchor deserializes and validates all accounts
   - Is authority a signer? ✓
   - Should user_account be created? ✓ (init)
   - Is system_program the real System Program? ✓
         ↓
3. Your handler runs:
   - Sets user.name = "Alice"
   - Sets user.authority = authority's public key
         ↓
4. Anchor serializes the modified accounts back to on-chain bytes
         ↓
5. Transaction confirms
```

All the validation and serialization happens automatically. You only write step 3.

---

**Key Takeaways**
- An Anchor program has: `declare_id!`, a `#[program]` module, account structs, and data structs
- Instruction handlers take `Context<T>` and return `Result<()>`
- Account validation happens automatically before your handler runs
- You focus on business logic; Anchor handles the plumbing

**Next:** [03-accounts-and-constraints.md](./03-accounts-and-constraints.md)
