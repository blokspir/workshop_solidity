# Exercise 2: NFT Minting with Token Burn

**Modules:** 03, 04, 05, 06
**Time:** 60-90 minutes

## Requirements

Build an Anchor program where users burn tokens to mint an NFT.

### Flow

1. User has platform tokens (from Exercise 1 or a test mint)
2. User calls `mint_nft` instruction
3. Program burns X tokens from the user
4. Program mints a Metaplex Core NFT to the user
5. Program emits a `NftMinted` event

### Program Instructions

- `initialize` -- set the mint price (tokens to burn), collection address, and authority
- `mint_nft` -- burn tokens from user, mint NFT to user

### Accounts

- `Config` PDA -- stores mint price, collection, authority, total minted count
- Uses the Metaplex Core program for NFT minting via CPI

## Deliverables

1. An Anchor program with `initialize` and `mint_nft` instructions
2. TypeScript tests that:
   - Initialize the config with a mint price of 100 tokens
   - Create a test token and fund a user
   - Mint an NFT (verify tokens burned, NFT received)
   - Verify the total minted counter incremented
   - Verify the `NftMinted` event was emitted

## Hints

<details>
<summary>Hint 1: Burning in CPI</summary>

Use `token::burn` CPI with the user as the authority (they must sign to approve the burn).

</details>

<details>
<summary>Hint 2: Metaplex Core CPI</summary>

Use `mpl_core::instructions::CreateV2CpiBuilder` for the NFT minting CPI. The collection authority (your program's PDA) must sign.

</details>

<details>
<summary>Hint 3: Config PDA</summary>

```rust
seeds = [b"config"]
```

Store: authority, mint (token to burn), collection, price, total_minted, bump.

</details>

## Self-Check

- [ ] Token burn reduces user's balance by exactly the mint price
- [ ] NFT appears in user's wallet after minting
- [ ] Total minted counter increments
- [ ] Event contains minter address, NFT address, and timestamp
- [ ] Minting fails if user doesn't have enough tokens
- [ ] Only the authority can call `initialize`

## Solution Outline

```
Program:
  Config PDA: seeds = [b"config"]
    - authority, mint, collection, price, total_minted, bump

  initialize(price: u64):
    - Set config fields

  mint_nft(name: String, uri: String):
    - require!(user has enough tokens)
    - token::burn(CPI, price amount)
    - mpl_core::create(CPI with collection authority PDA signing)
    - config.total_minted += 1
    - emit!(NftMinted { minter, nft, timestamp })

Tests:
  1. Create test SPL token, mint 1000 to user
  2. Create Metaplex Core collection
  3. Initialize config (price=100, collection, mint)
  4. User mints NFT → verify burn + NFT ownership
  5. User mints again → verify balance and count
  6. User with 0 tokens tries to mint → should fail
```
