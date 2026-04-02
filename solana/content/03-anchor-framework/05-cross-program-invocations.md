# Cross-Program Invocations (CPIs)

A CPI is when your program calls another program's instruction. This is how your program transfers tokens, creates accounts, or interacts with any other on-chain program.

## Why CPIs?

Your program can't directly manipulate token balances -- the Token Program owns those accounts. To transfer tokens, your program must ask the Token Program to do it via a CPI.

```
Your Program  →  CPI  →  Token Program  →  Modifies token accounts
```

## CPI Structure

Every CPI needs three things:

1. **The target program** (which program to call)
2. **The accounts** (what accounts the target program needs)
3. **The instruction data** (parameters for the call)

## Basic CPI: Transfer SOL

```rust
use anchor_lang::system_program;

pub fn send_sol(ctx: Context<SendSol>, amount: u64) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.sender.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            },
        ),
        amount,
    )?;
    Ok(())
}

#[derive(Accounts)]
pub struct SendSol<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(mut)]
    pub recipient: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}
```

## CPI: Transfer SPL Tokens

```rust
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.from_token_account.to_account_info(),
        to: ctx.accounts.to_token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

## CPI with PDA Signer

When a PDA needs to authorize the CPI (e.g., transferring tokens from a program-owned vault):

```rust
pub fn withdraw_from_vault(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let authority_key = ctx.accounts.authority.key();
    let seeds = &[
        b"vault".as_ref(),
        authority_key.as_ref(),
        &[ctx.accounts.vault.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        },
        signer_seeds,
    );

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

The difference: `CpiContext::new_with_signer` takes an extra `signer_seeds` argument that lets the PDA "sign" the transaction.

## Adding anchor-spl

To use token CPIs, add `anchor-spl` to your `Cargo.toml`:

```toml
[dependencies]
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
```

And import what you need:

```rust
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer, MintTo, Burn};
use anchor_spl::associated_token::AssociatedToken;
```

## Common CPIs You'll Use

| Operation | Program | Anchor Helper |
|-----------|---------|--------------|
| Transfer SOL | System Program | `system_program::transfer` |
| Transfer tokens | Token Program | `token::transfer` |
| Mint tokens | Token Program | `token::mint_to` |
| Burn tokens | Token Program | `token::burn` |
| Create ATA | Associated Token | `associated_token::create` |

---

**Key Takeaways**
- CPIs let your program call other programs (Token Program, System Program, etc.)
- Use `CpiContext::new` when a signer (wallet) authorizes the CPI
- Use `CpiContext::new_with_signer` when a PDA authorizes the CPI
- Add `anchor-spl` to your dependencies for token operations
- Every account the target program needs must be included in your accounts struct

**Next:** [06-errors-and-events.md](./06-errors-and-events.md)
