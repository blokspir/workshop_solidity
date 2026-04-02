# Exercise 3: Token Staking Vault

**Modules:** 03, 04, 07
**Time:** 60-90 minutes

## Requirements

Build a complete staking program where users lock tokens and earn time-based rewards.

### Instructions

- `initialize_pool` -- create the staking pool with a reward rate
- `fund_rewards` -- deposit reward tokens into the reward vault
- `deposit` -- user stakes tokens
- `claim` -- user claims accumulated rewards
- `withdraw` -- user unstakes tokens (auto-claims pending rewards first)

### Reward Calculation

```
pending_rewards = staked_amount * reward_rate * seconds_elapsed / PRECISION
PRECISION = 1_000_000
```

### Accounts

- `StakePool` PDA: authority, mint, reward_rate, total_staked
- `StakeVault` PDA token account: holds staked tokens
- `RewardVault` PDA token account: holds reward tokens
- `UserStake` PDA (per user): owner, staked_amount, last_claimed_at

## Deliverables

1. A fully functional Anchor staking program
2. TypeScript tests that:
   - Initialize the pool with reward_rate = 100 (0.0001 per token per second)
   - Fund the reward vault with 10,000 tokens
   - User deposits 1,000 tokens
   - Wait 2 seconds
   - User claims rewards (should be > 0)
   - User deposits 500 more tokens
   - User withdraws 500 tokens (auto-claims first)
   - User withdraws remaining and verify balance is restored

## Hints

<details>
<summary>Hint 1: Token Vault as PDA</summary>

```rust
#[account(
    init,
    payer = authority,
    seeds = [b"stake_vault", pool.key().as_ref()],
    bump,
    token::mint = mint,
    token::authority = stake_vault,  // self-authority
)]
pub stake_vault: Account<'info, TokenAccount>,
```

</details>

<details>
<summary>Hint 2: Separate Reward Vault</summary>

Keep staked tokens and reward tokens in separate vaults. This makes accounting clean and prevents mixing user deposits with rewards.

</details>

<details>
<summary>Hint 3: Timing in Tests</summary>

```typescript
// Wait 2 seconds for rewards to accumulate
await new Promise(resolve => setTimeout(resolve, 2000));
```

Rewards will be small but non-zero. Use `.toNumber()` and compare `> 0`.

</details>

## Self-Check

- [ ] Depositing increases user's staked_amount and pool's total_staked
- [ ] Rewards accumulate over time (claim after waiting returns > 0 tokens)
- [ ] Withdrawing returns exact amount deposited
- [ ] Cannot withdraw more than staked
- [ ] Cannot claim with 0 staked
- [ ] Multiple deposits accumulate correctly
- [ ] Pool total_staked is always accurate

## Solution Outline

```
Accounts:
  StakePool: seeds=[b"pool", mint] → authority, mint, reward_rate, total_staked
  StakeVault: seeds=[b"stake_vault", pool] → token account
  RewardVault: seeds=[b"reward_vault", pool] → token account
  UserStake: seeds=[b"user_stake", pool, user] → owner, staked_amount, last_claimed_at

initialize_pool: Create pool + both vaults
fund_rewards: Transfer tokens to reward vault
deposit: Transfer user→vault, update user_stake + pool
claim: Calculate rewards, transfer reward_vault→user, update last_claimed_at
withdraw: Claim first, then transfer vault→user, update totals
```
