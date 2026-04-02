# Transfer Fees

The Transfer Fee extension automatically collects a fee on every token transfer. The fee is withheld in the recipient's token account and can be harvested by the withdraw authority.

## How Transfer Fees Work

```
Alice sends 100 tokens to Bob
├── Fee: 1% = 1 token
├── Bob receives: 99 tokens (available balance)
└── Withheld: 1 token (locked in Bob's account until harvested)
```

The fee is not sent anywhere immediately. It sits in the recipient's token account as "withheld" tokens until the withdraw authority harvests them.

## Configuration

Transfer fees are configured with two parameters:

| Parameter | Description |
|-----------|-------------|
| `feeBasisPoints` | Fee percentage in basis points (100 = 1%, 500 = 5%) |
| `maxFee` | Maximum fee per transfer (in token base units) |

The `maxFee` prevents absurdly high fees on large transfers. Set it to a reasonable cap.

### Example Configurations

| Use Case | Basis Points | Max Fee | Effective Rate |
|----------|-------------|---------|----------------|
| 1% platform fee | 100 | 10 billion | 1% up to max |
| 0.5% with cap | 50 | 1 billion | 0.5% up to 1 token |
| 2% deflationary | 200 | unlimited | 2% flat |

## Setting Up Transfer Fees

During mint creation:

```typescript
createInitializeTransferFeeConfigInstruction(
    mintPublicKey,
    feeConfigAuthority,    // can change fee parameters later
    withdrawAuthority,     // can harvest withheld fees
    feeBasisPoints,        // e.g., 100 for 1%
    maxFee,                // e.g., BigInt(10_000_000_000)
    TOKEN_2022_PROGRAM_ID,
)
```

## Harvesting Withheld Fees

Withheld fees accumulate in recipient token accounts. The withdraw authority can collect them:

```typescript
import {
    harvestWithheldTokensToMint,
    withdrawWithheldTokensFromMint,
} from "@solana/spl-token";

// Step 1: Harvest from individual accounts into the mint
await harvestWithheldTokensToMint(
    connection,
    payer,
    mintPublicKey,
    [recipientTokenAccount1, recipientTokenAccount2],
    undefined,
    TOKEN_2022_PROGRAM_ID,
);

// Step 2: Withdraw from mint to your treasury
await withdrawWithheldTokensFromMint(
    connection,
    payer,
    mintPublicKey,
    treasuryTokenAccount,
    withdrawAuthority,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
);
```

## Fee Flow Diagram

```
Transfer: Alice → Bob (100 tokens, 1% fee)
│
├── Bob's token account:
│   ├── available: 99 tokens
│   └── withheld: 1 token (locked)
│
├── harvestWithheldTokensToMint()
│   └── Moves withheld tokens from Bob's account → Mint account
│
└── withdrawWithheldTokensFromMint()
    └── Moves tokens from Mint account → Treasury token account
```

## Changing Fees

The fee config authority can update fees:

```typescript
import { setTransferFee } from "@solana/spl-token";

await setTransferFee(
    connection,
    payer,
    mintPublicKey,
    feeConfigAuthority,
    [],                  // additional signers
    200,                 // new fee: 2%
    BigInt(20_000_000_000),  // new max fee
    undefined,
    TOKEN_2022_PROGRAM_ID,
);
```

Fee changes take effect after the current epoch (a few days).

## In Anchor Programs

When transferring Token-2022 tokens in Anchor, use the `transfer_checked` instruction which respects transfer fees:

```rust
use anchor_spl::token_2022;

token_2022::transfer_checked(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        token_2022::TransferChecked {
            from: ctx.accounts.from_token.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.to_token.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    ),
    amount,
    decimals,
)?;
```

---

**Key Takeaways**
- Transfer fees are automatically collected on every transfer
- Fees are withheld in the recipient's account, not sent directly to treasury
- Two-step harvest: collect from accounts → withdraw from mint
- Fee config authority can change fees; withdraw authority can collect them
- Use `transfer_checked` in Anchor for Token-2022 transfers

**Next:** [04-token-metadata.md](./04-token-metadata.md)
