# Exercise 1: Create a Platform Token

**Modules:** 04 (SPL Token-2022)
**Time:** 45-60 minutes

## Requirements

Create a Token-2022 fungible token with these specifications:

1. **Name:** "Platform Token" (symbol: "PLAT")
2. **Decimals:** 9
3. **Total supply:** 1 billion tokens (1,000,000,000)
4. **Transfer fee:** 1% (100 basis points), max fee of 10 tokens
5. **On-chain metadata:** name, symbol, and a URI pointing to a metadata JSON
6. **Fixed supply:** After minting, revoke the mint authority permanently

## Deliverables

Write a TypeScript script that:

1. Creates the Token-2022 mint with transfer fee and metadata extensions
2. Creates a treasury ATA and mints the full supply to it
3. Creates a second wallet and transfers 10,000 tokens to it
4. Prints the recipient's balance (should be less than 10,000 due to fee)
5. Burns 1,000 tokens from the treasury
6. Revokes the mint authority
7. Attempts to mint more tokens (should fail)
8. Prints final supply

## Hints

<details>
<summary>Hint 1: Extension Order</summary>

Initialize extensions BEFORE the mint. Order: createAccount → initMetadataPointer → initTransferFee → initMint → initMetadata.

</details>

<details>
<summary>Hint 2: Space Calculation</summary>

Use `getMintLen([ExtensionType.TransferFeeConfig, ExtensionType.MetadataPointer])` and add extra space for metadata content. Add a buffer of 256 bytes.

</details>

<details>
<summary>Hint 3: Transfer Fee Observation</summary>

After transferring 10,000 tokens with 1% fee, the recipient should receive 9,900 tokens (100 withheld as fee).

</details>

## Self-Check

- [ ] Token appears on Solana Explorer with correct name and symbol
- [ ] Transfer fee is deducted (recipient gets less than sent amount)
- [ ] Mint authority is null after revocation
- [ ] Minting after revocation throws an error
- [ ] Total supply = 1 billion - burned amount

## Solution Outline

```
1. Generate mint keypair
2. Calculate space for mint + extensions
3. Build transaction: createAccount + initMetadataPointer + initTransferFee + initMint + initMetadata
4. Send transaction (signers: payer + mint keypair)
5. Create treasury ATA
6. mintTo(treasury, 1 billion * 10^9)
7. Create recipient ATA
8. transfer(treasury → recipient, 10000 * 10^9)
9. getAccount(recipient) → verify balance < 10000
10. burn(treasury, 1000 * 10^9)
11. setAuthority(mint, MintTokens, null)
12. try { mintTo(...) } catch → expected failure
13. getMint() → print supply
```
