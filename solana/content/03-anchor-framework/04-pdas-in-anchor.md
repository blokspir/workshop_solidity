# PDAs in Anchor

Module 01 introduced PDAs conceptually. Now let's see how to use them in practice with Anchor.

## Creating a PDA Account

```rust
#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::SPACE,
        seeds = [b"profile", user.key().as_ref()],
        bump,
    )]
    pub profile: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}
```

What happens:
1. Anchor derives the PDA address from `seeds = [b"profile", user_pubkey]`
2. Creates a new account at that address
3. Sets the owner to your program
4. Stores the bump in `ctx.bumps.profile`

## Storing the Bump

Always store the bump in your account data. This saves compute units on future lookups:

```rust
#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub name: String,
    pub bump: u8,        // store the bump!
}

pub fn create_profile(ctx: Context<CreateProfile>, name: String) -> Result<()> {
    let profile = &mut ctx.accounts.profile;
    profile.authority = ctx.accounts.user.key();
    profile.name = name;
    profile.bump = ctx.bumps.profile;  // save the bump
    Ok(())
}
```

## Reading/Writing a PDA Account

When accessing an existing PDA, pass the stored bump:

```rust
#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"profile", user.key().as_ref()],
        bump = profile.bump,   // use stored bump (cheaper)
        has_one = authority,
    )]
    pub profile: Account<'info, UserProfile>,
}
```

Using `bump = profile.bump` (stored bump) is cheaper than `bump` alone (which recalculates it).

## PDA Signing (for CPIs)

PDAs can "sign" transactions via the program. This is how your program authorizes transfers from PDA-owned token vaults:

```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let seeds = &[
        b"vault",
        ctx.accounts.authority.key().as_ref(),
        &[ctx.accounts.vault.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    // Transfer tokens FROM the PDA vault TO the user
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        },
        signer_seeds,  // the PDA "signs" the transfer
    );

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

The pattern:
1. Reconstruct the seeds that derive the PDA (including bump)
2. Pass the seeds to `CpiContext::new_with_signer`
3. The Solana runtime verifies the seeds match the PDA address

## Common PDA Patterns

### Global Config

One per program:

```rust
seeds = [b"config"]
```

### Per-User Account

One per user:

```rust
seeds = [b"profile", user.key().as_ref()]
```

### Per-User Per-Entity

One per user per thing (e.g., user's stake in a pool):

```rust
seeds = [b"stake", pool.key().as_ref(), user.key().as_ref()]
```

### Token Vault

A PDA that holds tokens:

```rust
seeds = [b"vault", mint.key().as_ref()]
```

## Accessing the `#[instruction]` Data in Seeds

Sometimes seeds depend on instruction parameters. Use `#[instruction]`:

```rust
#[derive(Accounts)]
#[instruction(note_id: u64)]
pub struct CreateNote<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(
        init,
        payer = author,
        space = 8 + NoteData::SPACE,
        seeds = [b"note", author.key().as_ref(), &note_id.to_le_bytes()],
        bump,
    )]
    pub note: Account<'info, NoteData>,

    pub system_program: Program<'info, System>,
}
```

The `#[instruction(note_id: u64)]` gives the account struct access to the instruction parameter.

---

**Key Takeaways**
- Use `seeds` and `bump` in account constraints to create/validate PDAs
- Always store the bump in your account data to save compute on future access
- PDAs can "sign" via `CpiContext::new_with_signer` using their seeds
- Use `#[instruction(...)]` when PDA seeds depend on instruction parameters
- Common patterns: global config, per-user, per-user-per-entity

**Next:** [05-cross-program-invocations.md](./05-cross-program-invocations.md)
