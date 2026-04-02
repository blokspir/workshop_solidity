# Noncustodial Design

## What Does Noncustodial Mean?

**Custodial:** The platform holds users' assets. If the platform goes down, users lose their assets. (Like a bank.)

**Noncustodial:** Users hold their own assets in their own wallets. The platform facilitates interactions but never has control over user funds. (Like cash in your pocket.)

## Principles

### 1. Users Hold Their Own Tokens

Tokens live in the user's wallet (their ATA), not in a platform-controlled account.

```
// CUSTODIAL (bad): platform holds all tokens
Platform Wallet
├── Alice's tokens: 1000
├── Bob's tokens: 500
└── Charlie's tokens: 750

// NONCUSTODIAL (good): users hold their own tokens
Alice's Wallet → ATA: 1000 tokens
Bob's Wallet   → ATA: 500 tokens
Charlie's Wallet → ATA: 750 tokens
```

### 2. Users Sign Their Own Transactions

Every action that affects a user's assets requires their wallet signature. The platform cannot move tokens without user approval.

```rust
// The user must be a Signer -- platform can't forge this
pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    // ctx.accounts.user is a Signer -- they approved this
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

### 3. PDA Vaults Are Controlled by Code, Not People

When tokens need to be locked (staking, escrow), they go into a PDA vault. The PDA is controlled by the smart contract's code, not by any person's private key.

```
User stakes tokens:
User's Wallet → PDA Vault (controlled by program code)

User unstakes:
PDA Vault → User's Wallet (program verifies the user's stake)
```

No team member can access the PDA vault. Only the program's code can.

### 4. NFTs Live in User Wallets

When a user mints an NFT, it goes directly to their wallet. The platform never holds it.

```rust
// NFT is minted to the user's wallet, not a platform account
owner: ctx.accounts.user.key(),  // user's public key
```

### 5. Platform Can't Freeze or Take Assets

If the token has no freeze authority (revoked at launch), nobody can freeze a user's token account. Their assets are truly theirs.

## Design Patterns

### Safe: Platform as Facilitator

```
User wants to buy NFT
├── User signs the transaction (approves the purchase)
├── Program transfers tokens from User → Seller
├── Program transfers NFT from Seller → User
└── Program takes fee automatically
```

The platform's code facilitates the trade, but the user initiates and approves it.

### Unsafe: Platform as Custodian

```
User deposits tokens to platform
├── Tokens go to Platform's wallet
├── Platform tracks balance in a database
├── User requests withdrawal
└── Platform (hopefully) sends tokens back
```

If the platform's wallet is compromised or the team disappears, users lose everything.

## What If Staking Requires Locking?

Staking is an exception where tokens leave the user's wallet. The key difference is:

- Tokens go to a **PDA vault** (code-controlled), not a human-controlled wallet
- The user can always unstake and get their tokens back (the code guarantees it)
- No team member can access the staked tokens

```rust
// Only the user who staked can withdraw
#[account(
    has_one = owner,  // must be the staker
)]
pub user_stake: Account<'info, UserStake>,
```

---

**Key Takeaways**
- Noncustodial = users hold their own assets, platform facilitates interactions
- Every user action requires their wallet signature
- PDA vaults are controlled by code, not people
- Revoke freeze authority so nobody can freeze user accounts
- Staking uses PDA vaults with guaranteed withdrawal rights

**Next:** [05-deployment-guide.md](./05-deployment-guide.md)
