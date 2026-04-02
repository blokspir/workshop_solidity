# Reward Calculation

## Time-Based Rewards

The simplest approach: rewards accumulate based on how many tokens are staked and for how long.

### Formula

```
pending_rewards = staked_amount * reward_rate * time_elapsed / PRECISION
```

Where:
- `staked_amount` = number of tokens the user has staked
- `reward_rate` = rewards per token per second (scaled by PRECISION)
- `time_elapsed` = seconds since last claim
- `PRECISION` = scaling factor to avoid floating point (e.g., 1_000_000)

### Example

If:
- User staked 1,000 tokens
- Reward rate = 0.0001 tokens per staked token per second
- Time elapsed = 86,400 seconds (1 day)

```
pending = 1,000 * 0.0001 * 86,400 = 8.64 tokens per day
```

In code (using integer math with precision):

```
PRECISION = 1_000_000
reward_rate = 100  (= 0.0001 * PRECISION)
pending = 1_000 * 100 * 86_400 / 1_000_000 = 8,640,000 / 1_000_000 = 8 tokens
```

## Implementation

```rust
pub const PRECISION: u64 = 1_000_000;

pub fn calculate_pending_rewards(
    staked_amount: u64,
    reward_rate: u64,
    last_claimed_at: i64,
    now: i64,
) -> Result<u64> {
    if staked_amount == 0 {
        return Ok(0);
    }

    let time_elapsed = (now - last_claimed_at) as u64;

    let rewards = (staked_amount as u128)
        .checked_mul(reward_rate as u128)
        .unwrap()
        .checked_mul(time_elapsed as u128)
        .unwrap()
        .checked_div(PRECISION as u128)
        .unwrap();

    Ok(rewards as u64)
}
```

Note: We use `u128` for intermediate calculations to prevent overflow with large numbers.

## Claim Instruction

```rust
pub fn claim(ctx: Context<Claim>) -> Result<()> {
    let clock = Clock::get()?;
    let user_stake = &mut ctx.accounts.user_stake;

    let pending = calculate_pending_rewards(
        user_stake.staked_amount,
        ctx.accounts.pool.reward_rate,
        user_stake.last_claimed_at,
        clock.unix_timestamp,
    )?;

    require!(pending > 0, StakeError::NothingToClaim);

    // Transfer rewards from reward vault to user
    let pool_key = ctx.accounts.pool.key();
    let seeds = &[
        b"reward_vault".as_ref(),
        pool_key.as_ref(),
        &[ctx.accounts.pool.reward_vault_bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.reward_vault.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(cpi_ctx, pending)?;

    // Update last claimed timestamp
    user_stake.last_claimed_at = clock.unix_timestamp;

    emit!(ClaimEvent {
        user: ctx.accounts.user.key(),
        amount: pending,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
```

## Important: Claim Before Withdraw

When a user withdraws, always calculate and distribute pending rewards first. Otherwise, they lose unclaimed rewards:

```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // Step 1: Claim pending rewards first
    let pending = calculate_pending_rewards(...)?;
    if pending > 0 {
        // transfer pending rewards to user
    }

    // Step 2: Then withdraw staked tokens
    // ...
}
```

## Funding the Reward Pool

The reward vault needs to be pre-funded with tokens:

```rust
pub fn fund_rewards(ctx: Context<FundRewards>, amount: u64) -> Result<()> {
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.funder_token_account.to_account_info(),
            to: ctx.accounts.reward_vault.to_account_info(),
            authority: ctx.accounts.funder.to_account_info(),
        },
    );
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

If the reward vault runs out of tokens, claims will fail. Monitor the balance and top up as needed.

---

**Key Takeaways**
- Rewards = staked_amount * rate * time_elapsed / PRECISION
- Use u128 intermediate math to prevent overflow
- Always claim pending rewards before processing withdrawals
- Reward vault must be pre-funded with tokens
- `Clock::get()?.unix_timestamp` provides on-chain time

**Next:** [05-lab-staking-program.md](./05-lab-staking-program.md)
