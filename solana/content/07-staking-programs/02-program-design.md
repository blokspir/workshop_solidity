# Program Design

## Account Structures

### StakePool -- Global Configuration

```rust
#[account]
pub struct StakePool {
    pub authority: Pubkey,        // 32 - admin who can update the pool
    pub mint: Pubkey,             // 32 - which token is being staked
    pub total_staked: u64,        // 8  - total tokens across all stakers
    pub reward_rate: u64,         // 8  - reward tokens per staked token per second
    pub bump: u8,                 // 1
    pub vault_bump: u8,           // 1
}

impl StakePool {
    pub const SPACE: usize = 32 + 32 + 8 + 8 + 1 + 1;
}
```

### UserStake -- Per-User Tracking

```rust
#[account]
pub struct UserStake {
    pub owner: Pubkey,            // 32 - the user who staked
    pub pool: Pubkey,             // 32 - which pool this belongs to
    pub staked_amount: u64,       // 8  - how many tokens they've staked
    pub staked_at: i64,           // 8  - when they first staked
    pub last_claimed_at: i64,     // 8  - when they last claimed rewards
    pub bump: u8,                 // 1
}

impl UserStake {
    pub const SPACE: usize = 32 + 32 + 8 + 8 + 8 + 1;
}
```

## PDA Seeds

```rust
// Pool: one per program (or per mint if multi-token)
seeds = [b"stake_pool", mint.key().as_ref()]

// Vault: holds the staked tokens
seeds = [b"vault", pool.key().as_ref()]

// User stake: one per user per pool
seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()]
```

## Instruction Flow

### Initialize Pool

```
Authority calls initialize_pool(reward_rate)
├── Creates StakePool PDA
├── Creates Vault token account (PDA)
└── Sets reward_rate and mint
```

### Deposit (Stake)

```
User calls deposit(amount)
├── Transfer tokens from user → vault (CPI to Token Program)
├── Create UserStake if first time (or update existing)
├── Update user's staked_amount += amount
├── Update pool's total_staked += amount
└── Record timestamp
```

### Claim Rewards

```
User calls claim()
├── Calculate pending rewards since last_claimed_at
├── Transfer reward tokens from reward_vault → user
├── Update last_claimed_at = now
```

### Withdraw (Unstake)

```
User calls withdraw(amount)
├── Claim any pending rewards first
├── Transfer tokens from vault → user (PDA signing)
├── Update user's staked_amount -= amount
├── Update pool's total_staked -= amount
└── Close UserStake if staked_amount == 0
```

## Token Flow Diagram

```
User's Token Account
    │
    │ deposit()
    ▼
Stake Vault (PDA) ──── holds all staked tokens
    │
    │ withdraw()
    ▼
User's Token Account

Reward Vault (PDA) ──── holds reward tokens
    │
    │ claim()
    ▼
User's Token Account
```

---

**Key Takeaways**
- StakePool holds global config, UserStake holds per-user state
- Token vault is a PDA-owned token account (program controls it)
- Deposit transfers tokens from user to vault; withdraw does the reverse
- PDA signing is required for vault → user transfers

**Next:** [03-deposit-and-withdraw.md](./03-deposit-and-withdraw.md)
