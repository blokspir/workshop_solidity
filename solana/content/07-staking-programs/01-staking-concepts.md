# Staking Concepts

## What Is Staking?

Staking means locking tokens in a smart contract for a period of time. In return, the user gets benefits:

- **Rewards** -- earn more tokens over time
- **Premium features** -- access to exclusive platform features
- **Governance** -- voting power in community decisions
- **Priority** -- higher priority in queues, contests, etc.

## How Staking Works (High Level)

```
1. User deposits tokens into the staking program's vault
2. Program records: who staked, how much, when
3. Time passes...
4. User claims rewards (calculated based on amount and time)
5. User can withdraw original tokens (unstake)
```

## Design Decisions

Before building, you need to decide:

### Reward Source

Where do reward tokens come from?

| Source | How It Works |
|--------|-------------|
| **Pre-funded pool** | Treasury deposits reward tokens into a pool. Stakers earn from this pool. |
| **Inflation (minting)** | Program mints new tokens as rewards. Requires mint authority. |
| **Fee redistribution** | Platform fees are distributed to stakers proportionally. |

### Reward Calculation

How are rewards calculated?

| Method | Formula | Best For |
|--------|---------|---------|
| **Fixed rate** | `staked_amount * rate * time` | Simple, predictable |
| **Proportional** | `(your_stake / total_staked) * reward_pool` | Fair distribution |
| **Tiered** | Higher rates for larger/longer stakes | Incentivizing commitment |

### Lock Period

| Type | Behavior |
|------|----------|
| **Flexible** | Withdraw anytime |
| **Fixed lock** | Cannot withdraw until lock period ends |
| **Cooldown** | Request withdrawal, wait X days, then withdraw |

For learning, we'll implement a **flexible staking** system with **time-based fixed rate** rewards.

## Account Architecture

```
Program
├── StakePool (global PDA)
│   ├── authority
│   ├── reward_rate
│   ├── total_staked
│   └── mint
│
├── StakeVault (PDA token account)
│   └── holds all staked tokens
│
├── UserStake (per-user PDA)
│   ├── owner
│   ├── staked_amount
│   ├── staked_at (timestamp)
│   ├── last_claimed_at
│   └── accumulated_rewards
│
└── RewardVault (PDA token account)
    └── holds reward tokens to distribute
```

---

**Key Takeaways**
- Staking = lock tokens → earn rewards/features over time
- Key design decisions: reward source, calculation method, lock period
- Program needs: a pool config, a token vault, and per-user stake accounts
- PDAs are used for everything: pool, vaults, user accounts

**Next:** [02-program-design.md](./02-program-design.md)
