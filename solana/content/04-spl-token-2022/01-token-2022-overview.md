# Token-2022 Overview

## SPL Token vs Token-2022

Solana has two token programs:

| Feature | SPL Token (legacy) | Token-2022 |
|---------|-------------------|------------|
| Program ID | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Transfer fees | Not supported | Built-in |
| On-chain metadata | Requires Metaplex | Native extension |
| Interest-bearing tokens | Not supported | Built-in |
| Confidential transfers | Not supported | Built-in |
| Transfer hooks | Not supported | Built-in |
| Status | Stable, widely used | Newer, growing adoption |

Token-2022 is backwards-compatible with SPL Token for basic operations but adds powerful extensions. For new projects, Token-2022 is the recommended choice.

## Key Extensions

Extensions are features you enable when creating a token mint. Once set, they're permanent.

### Transfer Fee

Automatically collects a percentage on every transfer. The fee stays in the recipient's token account and can be harvested by the fee authority.

Use case: platform takes a cut of every transaction.

### Metadata

Stores token name, symbol, and URI directly on-chain. No external metadata program needed.

### Mint Close Authority

Allows closing an empty mint account to recover rent. The original Token Program doesn't support this.

### Permanent Delegate

A permanent delegate can transfer or burn tokens from any holder. Useful for regulated assets.

### Transfer Hook

Executes a custom program on every transfer. Enables complex logic like royalty enforcement, compliance checks, or transfer restrictions.

### Non-transferable

Creates soulbound tokens that cannot be transferred once received.

### Interest-bearing

Displays a dynamic balance that includes accumulated interest, without actually minting new tokens.

## Which Extensions Will We Use?

For a typical project token:

- **Transfer Fee** -- collect a small cut on every transfer (goes to treasury/burn)
- **Metadata** -- store token name, symbol, and logo URI on-chain
- **Mint Close Authority** -- nice to have for cleanup

These three cover most use cases. You can add more extensions as needed.

---

**Key Takeaways**
- Token-2022 is the modern replacement for SPL Token with extension support
- Extensions are configured at mint creation time and cannot be changed later
- Transfer Fee and Metadata are the most commonly used extensions
- Use Token-2022 for all new token projects

**Next:** [02-creating-a-token.md](./02-creating-a-token.md)
