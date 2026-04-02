# Lab: Build a Fee Splitter

Build a program that accepts a payment and splits it among multiple recipients.

## What You'll Build

- `initialize_config` -- set up the fee split configuration
- `distribute` -- accept an amount and split it to creator, burn, treasury, and staker pool
- `update_config` -- change the split ratios (admin only)

## Core Logic

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer, Burn};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod fee_splitter {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        creator_bps: u16,
        burn_bps: u16,
        treasury_bps: u16,
        staker_bps: u16,
    ) -> Result<()> {
        require!(
            creator_bps + burn_bps + treasury_bps + staker_bps == 10000,
            FeeError::SharesMustTotal10000
        );

        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.creator_share_bps = creator_bps;
        config.burn_share_bps = burn_bps;
        config.treasury_share_bps = treasury_bps;
        config.staker_share_bps = staker_bps;
        config.treasury = ctx.accounts.treasury.key();
        config.total_distributed = 0;
        config.total_burned = 0;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn distribute(ctx: Context<Distribute>, amount: u64) -> Result<()> {
        require!(amount > 0, FeeError::InvalidAmount);
        let config = &ctx.accounts.config;

        let creator_amount = share(amount, config.creator_share_bps);
        let burn_amount = share(amount, config.burn_share_bps);
        let treasury_amount = share(amount, config.treasury_share_bps);
        let staker_amount = amount - creator_amount - burn_amount - treasury_amount;

        // Pay creator
        if creator_amount > 0 {
            token::transfer(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.source.to_account_info(),
                    to: ctx.accounts.creator_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ), creator_amount)?;
        }

        // Burn
        if burn_amount > 0 {
            token::burn(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.source.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ), burn_amount)?;
        }

        // Treasury
        if treasury_amount > 0 {
            token::transfer(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.source.to_account_info(),
                    to: ctx.accounts.treasury_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ), treasury_amount)?;
        }

        // Staker pool
        if staker_amount > 0 {
            token::transfer(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.source.to_account_info(),
                    to: ctx.accounts.staker_pool_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ), staker_amount)?;
        }

        // Track totals
        let config = &mut ctx.accounts.config;
        config.total_distributed += amount;
        config.total_burned += burn_amount;

        emit!(FeeDistributed {
            total: amount,
            creator: creator_amount,
            burned: burn_amount,
            treasury: treasury_amount,
            stakers: staker_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

fn share(total: u64, bps: u16) -> u64 {
    ((total as u128) * (bps as u128) / 10000) as u64
}

#[account]
pub struct FeeConfig {
    pub authority: Pubkey,
    pub creator_share_bps: u16,
    pub burn_share_bps: u16,
    pub treasury_share_bps: u16,
    pub staker_share_bps: u16,
    pub treasury: Pubkey,
    pub total_distributed: u64,
    pub total_burned: u64,
    pub bump: u8,
}

#[error_code]
pub enum FeeError {
    #[msg("Shares must total 10000 basis points")]
    SharesMustTotal10000,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
}

#[event]
pub struct FeeDistributed {
    pub total: u64,
    pub creator: u64,
    pub burned: u64,
    pub treasury: u64,
    pub stakers: u64,
    pub timestamp: i64,
}
```

## Exercise

1. Add an `update_config` instruction that only the authority can call
2. Add a per-asset royalty account that overrides the creator share
3. Write tests that distribute 1000 tokens and verify each recipient's balance
4. Test with odd amounts (e.g., 997 tokens) and verify no tokens are lost to rounding
5. Track cumulative stats: total distributed, total burned, per-creator earnings

---

**Key Takeaways**
- Fee splitting is multiple CPIs (transfers + burn) in one instruction
- Basis points (10000 = 100%) keep math clean
- Always give remainder to last recipient to prevent rounding dust
- Track totals on-chain for transparency
- This pattern is composable: call it from any marketplace or minting instruction

**Next:** [Module 09 - Frontend Wallet Integration](../09-frontend-wallet-integration/)
