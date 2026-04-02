# Lab: Build a Staking Program

Build a complete staking program with deposit, withdraw, claim, and reward calculation.

## What You'll Build

Instructions:
- `initialize_pool` -- create the staking pool with reward rate
- `deposit` -- stake tokens
- `withdraw` -- unstake tokens (claims pending rewards first)
- `claim` -- claim accumulated rewards
- `fund_rewards` -- add tokens to the reward pool

## Project Setup

```bash
anchor init staking
cd staking
```

Add `anchor-spl` to `programs/staking/Cargo.toml`:

```toml
[dependencies]
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
```

## The Program

Replace `programs/staking/src/lib.rs` with a program that implements all the patterns from this module. The key structure:

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("11111111111111111111111111111111");

pub const PRECISION: u64 = 1_000_000;

#[program]
pub mod staking {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>, reward_rate: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.mint = ctx.accounts.mint.key();
        pool.total_staked = 0;
        pool.reward_rate = reward_rate;
        pool.bump = ctx.bumps.pool;
        pool.vault_bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, StakeError::InvalidAmount);

        // Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        let user_stake = &mut ctx.accounts.user_stake;
        let clock = Clock::get()?;

        if user_stake.staked_amount == 0 {
            user_stake.owner = ctx.accounts.user.key();
            user_stake.pool = ctx.accounts.pool.key();
            user_stake.staked_at = clock.unix_timestamp;
            user_stake.last_claimed_at = clock.unix_timestamp;
        }

        user_stake.staked_amount = user_stake.staked_amount.checked_add(amount).unwrap();
        ctx.accounts.pool.total_staked = ctx.accounts.pool.total_staked.checked_add(amount).unwrap();

        msg!("Deposited {} tokens. Total staked: {}", amount, user_stake.staked_amount);
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let clock = Clock::get()?;
        let user_stake = &ctx.accounts.user_stake;

        let pending = calculate_rewards(
            user_stake.staked_amount,
            ctx.accounts.pool.reward_rate,
            user_stake.last_claimed_at,
            clock.unix_timestamp,
        )?;
        require!(pending > 0, StakeError::NothingToClaim);

        // Transfer rewards (PDA signing)
        let mint_key = ctx.accounts.pool.mint;
        let seeds = &[b"vault".as_ref(), ctx.accounts.pool.to_account_info().key.as_ref(), &[ctx.accounts.pool.vault_bump]];
        let signer = &[&seeds[..]];

        // In a real program, rewards come from a separate reward vault
        // This simplified version demonstrates the pattern
        msg!("Claimed {} reward tokens", pending);

        let user_stake = &mut ctx.accounts.user_stake;
        user_stake.last_claimed_at = clock.unix_timestamp;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, StakeError::InvalidAmount);

        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.staked_amount >= amount, StakeError::InsufficientStake);

        // Transfer tokens from vault back to user (PDA signing)
        let pool_key = ctx.accounts.pool.key();
        let seeds = &[b"vault".as_ref(), pool_key.as_ref(), &[ctx.accounts.pool.vault_bump]];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        user_stake.staked_amount = user_stake.staked_amount.checked_sub(amount).unwrap();
        ctx.accounts.pool.total_staked = ctx.accounts.pool.total_staked.checked_sub(amount).unwrap();

        msg!("Withdrew {} tokens. Remaining: {}", amount, user_stake.staked_amount);
        Ok(())
    }
}

pub fn calculate_rewards(staked: u64, rate: u64, last_claimed: i64, now: i64) -> Result<u64> {
    if staked == 0 { return Ok(0); }
    let elapsed = (now - last_claimed) as u64;
    let rewards = (staked as u128)
        .checked_mul(rate as u128).unwrap()
        .checked_mul(elapsed as u128).unwrap()
        .checked_div(PRECISION as u128).unwrap();
    Ok(rewards as u64)
}

// === Account structs ===

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = 8 + StakePool::SPACE, seeds = [b"stake_pool", mint.key().as_ref()], bump)]
    pub pool: Account<'info, StakePool>,
    #[account(init, payer = authority, seeds = [b"vault", pool.key().as_ref()], bump, token::mint = mint, token::authority = vault)]
    pub vault: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"stake_pool", pool.mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakePool>,
    #[account(init_if_needed, payer = user, space = 8 + UserStake::SPACE, seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()], bump)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut, seeds = [b"vault", pool.key().as_ref()], bump = pool.vault_bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"stake_pool", pool.mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakePool>,
    #[account(mut, seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()], bump = user_stake.bump, has_one = owner @ StakeError::Unauthorized)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut, seeds = [b"vault", pool.key().as_ref()], bump = pool.vault_bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    pub user: Signer<'info>,
    #[account(seeds = [b"stake_pool", pool.mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakePool>,
    #[account(mut, seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()], bump = user_stake.bump, has_one = owner @ StakeError::Unauthorized)]
    pub user_stake: Account<'info, UserStake>,
    pub token_program: Program<'info, Token>,
}

// === Data ===

#[account]
pub struct StakePool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_staked: u64,
    pub reward_rate: u64,
    pub bump: u8,
    pub vault_bump: u8,
}
impl StakePool { pub const SPACE: usize = 32 + 32 + 8 + 8 + 1 + 1; }

#[account]
pub struct UserStake {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub staked_amount: u64,
    pub staked_at: i64,
    pub last_claimed_at: i64,
    pub bump: u8,
}
impl UserStake { pub const SPACE: usize = 32 + 32 + 8 + 8 + 8 + 1; }

#[error_code]
pub enum StakeError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Insufficient staked balance")]
    InsufficientStake,
    #[msg("No rewards to claim")]
    NothingToClaim,
    #[msg("Unauthorized")]
    Unauthorized,
}

#[event]
pub struct DepositEvent { pub user: Pubkey, pub amount: u64, pub total_staked: u64, pub timestamp: i64 }
#[event]
pub struct WithdrawEvent { pub user: Pubkey, pub amount: u64, pub remaining_staked: u64, pub timestamp: i64 }
#[event]
pub struct ClaimEvent { pub user: Pubkey, pub amount: u64, pub timestamp: i64 }
```

## Exercise

1. Build the program: `anchor build`
2. Write TypeScript tests that:
   - Initialize a pool with a reward rate
   - Create a test token and mint tokens to a test user
   - Deposit tokens into the pool
   - Wait (use `await new Promise(r => setTimeout(r, 2000))`)
   - Claim rewards and verify the calculation
   - Withdraw and verify balance restoration
3. Test edge cases: deposit 0, withdraw more than staked, claim with nothing staked

---

**Key Takeaways**
- The staking program combines PDAs, CPIs, PDA signing, and time-based math
- `init_if_needed` simplifies first-time user onboarding
- PDA signing is the core pattern for vault withdrawals
- Always validate amounts and use checked math
- This pattern is reusable for any token locking mechanism

**Next:** [Module 08 - Royalty & Fee Distribution](../08-royalty-and-fee-distribution/)
