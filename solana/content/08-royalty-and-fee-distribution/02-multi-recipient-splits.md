# Multi-Recipient Fee Splits

## The Split Instruction

Here's how to split a payment among multiple recipients in a single instruction:

```rust
pub fn distribute_fee(ctx: Context<DistributeFee>, total_amount: u64) -> Result<()> {
    let config = &ctx.accounts.fee_config;

    // Calculate each share
    let creator_amount = calculate_share(total_amount, config.creator_share_bps)?;
    let burn_amount = calculate_share(total_amount, config.burn_share_bps)?;
    let treasury_amount = calculate_share(total_amount, config.treasury_share_bps)?;
    let staker_amount = total_amount
        .checked_sub(creator_amount)
        .unwrap()
        .checked_sub(burn_amount)
        .unwrap()
        .checked_sub(treasury_amount)
        .unwrap();
    // Give remainder to stakers to avoid rounding dust

    // 1. Pay creator
    if creator_amount > 0 {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.fee_source.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            creator_amount,
        )?;
    }

    // 2. Burn tokens
    if burn_amount > 0 {
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.fee_source.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            burn_amount,
        )?;
    }

    // 3. Send to treasury
    if treasury_amount > 0 {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.fee_source.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            treasury_amount,
        )?;
    }

    // 4. Send to staker pool
    if staker_amount > 0 {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.fee_source.to_account_info(),
                    to: ctx.accounts.staker_pool_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            staker_amount,
        )?;
    }

    emit!(FeeDistributed {
        total: total_amount,
        creator: creator_amount,
        burned: burn_amount,
        treasury: treasury_amount,
        stakers: staker_amount,
    });

    Ok(())
}

fn calculate_share(total: u64, share_bps: u16) -> Result<u64> {
    Ok(((total as u128) * (share_bps as u128) / 10000) as u64)
}
```

## Handling Rounding

Integer division can lose tokens to rounding. The pattern above gives the remainder to the last recipient:

```
100 tokens, split 70/10/10/10:
├── Creator: 100 * 7000 / 10000 = 70
├── Burn: 100 * 1000 / 10000 = 10
├── Treasury: 100 * 1000 / 10000 = 10
└── Stakers: 100 - 70 - 10 - 10 = 10  ✓ no dust
```

For odd amounts:

```
99 tokens, split 70/10/10/10:
├── Creator: 99 * 7000 / 10000 = 69
├── Burn: 99 * 1000 / 10000 = 9
├── Treasury: 99 * 1000 / 10000 = 9
└── Stakers: 99 - 69 - 9 - 9 = 12  (gets the rounding benefit)
```

## Integrating with a Marketplace

When someone buys an NFT, the purchase triggers fee distribution:

```rust
pub fn buy_nft(ctx: Context<BuyNft>, price: u64) -> Result<()> {
    let config = &ctx.accounts.fee_config;
    let fee_amount = calculate_share(price, config.total_fee_bps)?;
    let seller_amount = price.checked_sub(fee_amount).unwrap();

    // Pay the seller
    transfer_tokens(ctx, seller_amount, &seller_account)?;

    // Distribute the fee
    let creator_amount = calculate_share(fee_amount, config.creator_share_bps)?;
    let burn_amount = calculate_share(fee_amount, config.burn_share_bps)?;
    // ... distribute each share
    
    Ok(())
}
```

## Staker Reward Claiming

Staker pool tokens accumulate. Individual stakers claim proportionally:

```
Staker pool has 1000 tokens
Total staked: 100,000 tokens
Alice staked: 10,000 tokens (10%)
Alice's share: 1000 * 10% = 100 tokens
```

This connects back to the staking module -- the fee distribution engine feeds the reward pool.

---

**Key Takeaways**
- Multiple CPIs in one instruction distribute fees to all recipients atomically
- Give the remainder to the last recipient to avoid rounding dust
- Burn is a CPI to `token::burn` -- tokens are permanently destroyed
- The staker share goes to a pool account; individual stakers claim proportionally
- Events track every distribution for transparency

**Next:** [03-per-asset-royalties.md](./03-per-asset-royalties.md)
