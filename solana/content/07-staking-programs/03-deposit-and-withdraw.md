# Deposit and Withdraw

## Deposit (Staking Tokens)

The deposit instruction transfers tokens from the user to the program's vault:

```rust
pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, StakeError::InvalidAmount);

    // Transfer tokens from user to vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
    );
    token::transfer(cpi_ctx, amount)?;

    // Update user stake
    let user_stake = &mut ctx.accounts.user_stake;
    let clock = Clock::get()?;

    if user_stake.staked_amount == 0 {
        user_stake.staked_at = clock.unix_timestamp;
        user_stake.last_claimed_at = clock.unix_timestamp;
    }

    user_stake.staked_amount = user_stake
        .staked_amount
        .checked_add(amount)
        .unwrap();

    // Update pool total
    let pool = &mut ctx.accounts.pool;
    pool.total_staked = pool.total_staked.checked_add(amount).unwrap();

    emit!(DepositEvent {
        user: ctx.accounts.user.key(),
        amount,
        total_staked: user_stake.staked_amount,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
```

### Deposit Accounts

```rust
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"stake_pool", pool.mint.as_ref()],
        bump = pool.bump,
    )]
    pub pool: Account<'info, StakePool>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserStake::SPACE,
        seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump = pool.vault_bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

## Withdraw (Unstaking Tokens)

Withdrawing requires PDA signing because the vault is owned by the program:

```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    require!(amount > 0, StakeError::InvalidAmount);

    let user_stake = &mut ctx.accounts.user_stake;
    require!(
        user_stake.staked_amount >= amount,
        StakeError::InsufficientStake
    );

    // Transfer tokens from vault back to user (PDA signing)
    let pool_key = ctx.accounts.pool.key();
    let seeds = &[
        b"vault".as_ref(),
        pool_key.as_ref(),
        &[ctx.accounts.pool.vault_bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.vault.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    token::transfer(cpi_ctx, amount)?;

    // Update user stake
    user_stake.staked_amount = user_stake
        .staked_amount
        .checked_sub(amount)
        .unwrap();

    // Update pool total
    let pool = &mut ctx.accounts.pool;
    pool.total_staked = pool.total_staked.checked_sub(amount).unwrap();

    let clock = Clock::get()?;
    emit!(WithdrawEvent {
        user: ctx.accounts.user.key(),
        amount,
        remaining_staked: user_stake.staked_amount,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
```

## Key Patterns

### `init_if_needed` for First Deposit

The UserStake account is created on first deposit and reused for subsequent deposits. This avoids requiring a separate "initialize user" step.

### PDA Signing for Vault Withdrawals

The vault is a PDA, so it has no private key. The program "signs" on behalf of the vault by providing the seeds:

```rust
let signer_seeds = &[&seeds[..]];
CpiContext::new_with_signer(program, accounts, signer_seeds);
```

### Checked Math

Always use `checked_add` and `checked_sub` to prevent integer overflow/underflow:

```rust
staked_amount = staked_amount.checked_add(amount).unwrap();
```

---

**Key Takeaways**
- Deposit: user signs the transfer (CPI with `CpiContext::new`)
- Withdraw: vault PDA "signs" the transfer (CPI with `CpiContext::new_with_signer`)
- `init_if_needed` creates the user stake account on first interaction
- Always use checked math for amounts
- Emit events for off-chain tracking

**Next:** [04-reward-calculation.md](./04-reward-calculation.md)
