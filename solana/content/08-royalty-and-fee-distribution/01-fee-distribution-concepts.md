# Fee Distribution Concepts

## The Fee Flow

When a transaction happens on a platform (buying an NFT, using a service), fees are generated. Instead of all fees going to one wallet, they're split automatically:

```
User pays 100 tokens for an NFT
├── Creator: 70 tokens (70%)
├── Burn: 10 tokens (10%) → destroyed permanently
├── Treasury: 10 tokens (10%) → community fund
└── Staker Pool: 10 tokens (10%) → distributed to stakers
```

This is enforced by a smart contract, so the split is transparent and tamper-proof.

## Why On-Chain Fee Distribution?

| Approach | Trust Required | Transparency |
|----------|---------------|-------------|
| Manual (admin sends payments) | High | Low |
| Backend code splits fees | Medium | Low |
| **Smart contract auto-splits** | **None** | **Full** |

Smart contract distribution means:
- Nobody can change the split without going through governance
- Every distribution is visible on-chain
- Creators are guaranteed their share immediately
- Burn is real -- tokens are actually destroyed

## Design Patterns

### Pattern 1: Instant Split

Fee is split the moment the transaction happens. All recipients receive their share in the same transaction.

**Pros:** Immediate distribution, simple
**Cons:** More accounts per transaction, higher compute

### Pattern 2: Accumulate and Claim

Fees accumulate in a pool. Recipients claim their share when they want.

**Pros:** Fewer accounts per transaction, scales to many recipients
**Cons:** Recipients must actively claim, more complex

### Pattern 3: Hybrid

Some recipients (creator, treasury) receive instantly. Others (staker pool) accumulate for later claiming.

This is the most practical approach for a real platform.

## The Split Configuration

Store split ratios in a config account:

```rust
#[account]
pub struct FeeConfig {
    pub authority: Pubkey,          // who can update the config
    pub creator_share_bps: u16,     // basis points (7000 = 70%)
    pub burn_share_bps: u16,        // basis points (1000 = 10%)
    pub treasury_share_bps: u16,    // basis points (1000 = 10%)
    pub staker_share_bps: u16,      // basis points (1000 = 10%)
    pub treasury: Pubkey,           // treasury wallet
    pub bump: u8,
}
```

Basis points ensure shares always total 10000 (100%):

```rust
require!(
    config.creator_share_bps + config.burn_share_bps
    + config.treasury_share_bps + config.staker_share_bps == 10000,
    FeeError::InvalidShares
);
```

---

**Key Takeaways**
- Fee distribution splits transaction fees among multiple recipients automatically
- Smart contract enforcement means no trust required -- code guarantees the split
- Hybrid pattern: instant distribution for some, accumulate-and-claim for others
- Use basis points (1/100th of a percent) for precise share configuration
- Shares must always total 10000 (100%)

**Next:** [02-multi-recipient-splits.md](./02-multi-recipient-splits.md)
