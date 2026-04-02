# Associated Token Accounts (ATAs)

Every user needs a **token account** for each token they hold. Associated Token Accounts (ATAs) standardize where these accounts live.

## The Problem

A user can have many token accounts for the same mint. This causes chaos -- which account should you send tokens to?

ATAs solve this by deriving a **deterministic address** from the user's wallet + the token mint. For any wallet + mint combination, there's exactly one ATA address.

## How ATAs Are Derived

An ATA is a PDA derived from:

```
seeds = [wallet_address, token_program_id, mint_address]
```

This means:
- You can calculate anyone's ATA without querying the chain
- If Alice wants to receive your token, you know exactly where to send it

## Creating an ATA

```typescript
import {
    getOrCreateAssociatedTokenAccount,
    getAssociatedTokenAddressSync,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Calculate the ATA address (no network call needed)
const ata = getAssociatedTokenAddressSync(
    mintPublicKey,
    walletPublicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
);

// Create the ATA if it doesn't exist
const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,             // who pays for creation
    mintPublicKey,
    walletPublicKey,   // whose ATA to create
    false,
    "confirmed",
    undefined,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
);

console.log("ATA address:", tokenAccount.address.toString());
console.log("Balance:", tokenAccount.amount.toString());
```

## In Anchor Programs

Anchor has built-in support for ATAs:

```rust
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        init_if_needed,
        payer = sender,
        associated_token::mint = mint,
        associated_token::authority = recipient,
        associated_token::token_program = token_program,
    )]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = sender,
        associated_token::token_program = token_program,
    )]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,

    pub mint: InterfaceAccount<'info, Mint>,
    pub recipient: SystemAccount<'info>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
```

The `associated_token::mint` and `associated_token::authority` constraints validate that the token account is the correct ATA for the given mint and wallet.

## Checking Balances

```typescript
import { getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

const tokenAccount = await getAccount(
    connection,
    ataAddress,
    "confirmed",
    TOKEN_2022_PROGRAM_ID,
);

console.log("Balance:", tokenAccount.amount.toString());
console.log("Owner:", tokenAccount.owner.toString());
console.log("Mint:", tokenAccount.mint.toString());
```

---

**Key Takeaways**
- ATAs are deterministic token accounts derived from wallet + mint
- `getAssociatedTokenAddressSync` calculates the address without a network call
- `getOrCreateAssociatedTokenAccount` creates the ATA if it doesn't exist
- In Anchor, use `associated_token::mint` and `associated_token::authority` constraints
- Always use ATAs for standard token operations

**Next:** [07-lab-create-token.md](./07-lab-create-token.md)
