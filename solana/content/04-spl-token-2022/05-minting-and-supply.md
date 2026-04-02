# Minting, Supply Management, and Burning

Once your token mint is created, you need to mint the initial supply, potentially burn tokens, and decide when to lock down the supply.

## Minting Tokens

Only the **mint authority** can create new tokens:

```typescript
import { mintTo, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

await mintTo(
    connection,
    payer,                    // fee payer
    mintPublicKey,            // the token mint
    destinationTokenAccount,  // where to send the tokens
    mintAuthority,            // must be the mint authority
    1_000_000_000_000_000n,  // amount (1 million tokens with 9 decimals)
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
);
```

### Minting Strategy for a Fixed Supply Token

1. Create the mint
2. Create the treasury token account
3. Mint the entire supply to the treasury
4. Revoke mint authority (so no one can ever mint more)

```typescript
// Mint entire supply (e.g., 1 billion tokens with 9 decimals)
const totalSupply = BigInt(1_000_000_000) * BigInt(10 ** 9);

await mintTo(
    connection, payer, mintPublicKey,
    treasuryTokenAccount, mintAuthority,
    totalSupply, [], undefined, TOKEN_2022_PROGRAM_ID,
);
```

## Revoking Mint Authority

Once you revoke the mint authority, **no one can ever create new tokens**. The supply is permanently fixed.

```typescript
import { setAuthority, AuthorityType, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

await setAuthority(
    connection,
    payer,
    mintPublicKey,
    currentMintAuthority,     // current authority
    AuthorityType.MintTokens, // which authority to change
    null,                     // set to null = revoke forever
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
);

console.log("Mint authority revoked. Supply is now permanently fixed.");
```

This is irreversible. Once revoked, there is no way to mint new tokens.

## Burning Tokens

Burning permanently destroys tokens, reducing the total supply:

```typescript
import { burn, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

await burn(
    connection,
    payer,
    tokenAccountPublicKey,  // account to burn FROM
    mintPublicKey,           // the token mint
    owner,                   // owner of the token account
    1_000_000_000n,         // amount to burn (1 token with 9 decimals)
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
);
```

### Programmatic Burn in Anchor

```rust
use anchor_spl::token_2022;

pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
    token_2022::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_2022::Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
    )?;

    msg!("Burned {} tokens", amount);
    Ok(())
}
```

### Burn-on-Mint Pattern

A common pattern: burn tokens when users perform certain actions (like minting an NFT):

```
User wants to mint NFT
├── User pays X tokens
├── Program burns X tokens (reducing supply)
└── Program mints NFT to user
```

This creates deflationary pressure -- the token becomes scarcer over time.

## Supply Queries

Check current supply from the client:

```typescript
import { getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

const mintInfo = await getMint(
    connection,
    mintPublicKey,
    "confirmed",
    TOKEN_2022_PROGRAM_ID,
);

console.log("Current supply:", mintInfo.supply.toString());
console.log("Decimals:", mintInfo.decimals);
console.log("Mint authority:", mintInfo.mintAuthority?.toString() || "REVOKED");
```

---

**Key Takeaways**
- Mint tokens with `mintTo` -- only the mint authority can do this
- For a fixed supply: mint everything upfront, then revoke mint authority forever
- `setAuthority(..., null)` revokes an authority permanently
- Burning destroys tokens and reduces total supply
- Burn-on-action creates deflationary economics

**Next:** [06-associated-token-accounts.md](./06-associated-token-accounts.md)
