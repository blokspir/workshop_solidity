# Per-Asset Royalties

## Why Per-Asset?

Some platforms need different royalty configurations per NFT:

- Premium NFTs might have higher creator royalties
- Collaborative works split royalties among multiple creators
- Different asset types (images vs music) might have different fee structures

## Royalty Account Per Asset

Create a PDA for each asset's royalty configuration:

```rust
#[account]
pub struct AssetRoyalty {
    pub asset: Pubkey,              // 32 - the NFT this royalty applies to
    pub creator: Pubkey,            // 32 - primary creator
    pub creator_share_bps: u16,     // 2  - creator's share
    pub secondary_creator: Option<Pubkey>,  // 1 + 32 - optional co-creator
    pub secondary_share_bps: u16,   // 2  - co-creator's share
    pub total_earned: u64,          // 8  - lifetime earnings tracker
    pub bump: u8,                   // 1
}

impl AssetRoyalty {
    pub const SPACE: usize = 32 + 32 + 2 + (1 + 32) + 2 + 8 + 1;
}
```

PDA seeds:

```rust
seeds = [b"royalty", asset.key().as_ref()]
```

## Setting Royalties at Mint Time

When minting an NFT, also create its royalty config:

```rust
pub fn mint_with_royalty(
    ctx: Context<MintWithRoyalty>,
    name: String,
    uri: String,
    creator_share_bps: u16,
) -> Result<()> {
    // Mint the NFT...

    // Set up royalty tracking
    let royalty = &mut ctx.accounts.asset_royalty;
    royalty.asset = ctx.accounts.asset.key();
    royalty.creator = ctx.accounts.creator.key();
    royalty.creator_share_bps = creator_share_bps;
    royalty.secondary_creator = None;
    royalty.secondary_share_bps = 0;
    royalty.total_earned = 0;
    royalty.bump = ctx.bumps.asset_royalty;

    Ok(())
}
```

## Distribution Using Asset Royalties

When an NFT is sold, look up its specific royalty config:

```rust
pub fn process_sale(ctx: Context<ProcessSale>, price: u64) -> Result<()> {
    let royalty = &ctx.accounts.asset_royalty;
    let platform_config = &ctx.accounts.fee_config;

    // Calculate platform fee
    let platform_fee = calculate_share(price, platform_config.total_fee_bps)?;
    let seller_receives = price.checked_sub(platform_fee).unwrap();

    // Split platform fee using asset-specific royalty
    let creator_amount = calculate_share(platform_fee, royalty.creator_share_bps)?;

    // Pay creator
    transfer_to_creator(ctx, creator_amount)?;

    // Track earnings
    let royalty = &mut ctx.accounts.asset_royalty;
    royalty.total_earned = royalty.total_earned.checked_add(creator_amount).unwrap();

    // Distribute remainder (burn, treasury, stakers)
    let remainder = platform_fee.checked_sub(creator_amount).unwrap();
    distribute_remainder(ctx, remainder)?;

    Ok(())
}
```

## Tracking Lifetime Earnings

The `total_earned` field lets you display creator earnings:

```typescript
// Client-side: fetch creator's total royalty earnings
const royaltyAccount = await program.account.assetRoyalty.fetch(royaltyPda);
console.log("Total earned:", royaltyAccount.totalEarned.toString());
```

You can also aggregate across all assets by fetching all AssetRoyalty accounts for a creator:

```typescript
const creatorRoyalties = await program.account.assetRoyalty.all([
    {
        memcmp: {
            offset: 8 + 32,  // after discriminator + asset
            bytes: creatorPublicKey.toBase58(),
        },
    },
]);

const totalEarnings = creatorRoyalties.reduce(
    (sum, r) => sum + r.account.totalEarned.toNumber(), 0
);
```

---

**Key Takeaways**
- Per-asset royalty PDAs allow different splits per NFT
- Seeds: `[b"royalty", asset_key]` for easy lookup
- Track lifetime earnings for transparency and creator dashboards
- Asset-specific royalties are set at mint time and can be immutable or updatable

**Next:** [04-lab-fee-splitter.md](./04-lab-fee-splitter.md)
