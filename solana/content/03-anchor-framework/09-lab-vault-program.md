# Lab: SOL Vault Program

Build a program where users can deposit and withdraw SOL. This introduces CPIs and PDA signing.

## What You'll Build

- `initialize` -- create a vault for a user
- `deposit` -- user sends SOL into the vault
- `withdraw` -- user takes SOL back from the vault

## The Program

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;

        msg!("Deposited {} lamports", amount);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);

        let vault_balance = ctx.accounts.vault.to_account_info().lamports();
        let rent_minimum = Rent::get()?.minimum_balance(8 + Vault::SPACE);
        let available = vault_balance.saturating_sub(rent_minimum);

        require!(available >= amount, VaultError::InsufficientFunds);

        // Transfer SOL from vault PDA back to user
        // For PDAs, we modify lamports directly instead of CPI
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;

        msg!("Withdrew {} lamports", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Vault::SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
        has_one = authority,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
        has_one = authority,
    )]
    pub vault: Account<'info, Vault>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,  // 32
    pub bump: u8,           // 1
}

impl Vault {
    pub const SPACE: usize = 32 + 1;
}

#[error_code]
pub enum VaultError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,

    #[msg("Insufficient funds in the vault")]
    InsufficientFunds,
}
```

## Key Concepts Demonstrated

### SOL Transfer via CPI

The deposit uses a CPI to the System Program:

```rust
system_program::transfer(
    CpiContext::new(system_program, Transfer { from, to }),
    amount,
)?;
```

### Direct Lamport Manipulation

For withdrawing from a PDA, you can directly modify lamport balances since your program owns the vault account:

```rust
**ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
**ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;
```

### Protecting Rent

The withdraw checks that the vault keeps enough SOL for rent exemption:

```rust
let rent_minimum = Rent::get()?.minimum_balance(8 + Vault::SPACE);
let available = vault_balance.saturating_sub(rent_minimum);
```

## Exercise

Extend this program:

1. Add a `close` instruction that withdraws all remaining SOL and closes the vault account
2. Add a `deposited_total` field to track cumulative deposits
3. Write tests for all scenarios, including attempting to over-withdraw

---

**Key Takeaways**
- CPI to System Program for SOL transfers (deposit)
- Direct lamport manipulation for PDA-owned SOL (withdraw)
- Always protect rent-exempt minimum balance
- `saturating_sub` prevents underflow

**Next:** [10-lab-notes-program.md](./10-lab-notes-program.md)
