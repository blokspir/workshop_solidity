# Tokens, Clusters, and Explorers

This file covers the remaining concepts you need before diving into code.

## SOL -- The Native Token

SOL is Solana's native currency, like ETH on Ethereum. It's used for:

- Paying transaction fees
- Paying rent for account storage
- Staking (securing the network)

SOL is denominated in **lamports**. 1 SOL = 1,000,000,000 lamports (9 decimal places).

## SPL Tokens

**SPL** stands for Solana Program Library. SPL tokens are custom tokens created on Solana -- similar to ERC-20 tokens on Ethereum.

Any token that isn't SOL is an SPL token: stablecoins (USDC), project tokens, governance tokens, etc.

SPL tokens are managed by the **Token Program** (or **Token-2022 Program** for newer tokens). When you "create a token," you're creating a **mint account** through one of these programs.

### Token Account Structure

Each user needs a **token account** for each token they hold. So if Alice holds USDC and your custom token, she has:

- Her wallet (holds SOL)
- An Associated Token Account for USDC (holds her USDC balance)
- An Associated Token Account for your token (holds her token balance)

```
Alice's Wallet (SOL)
├── ATA for USDC  →  balance: 500 USDC
├── ATA for $MYTOKEN  →  balance: 1000 $MYTOKEN
└── ATA for some NFT  →  balance: 1 (NFTs have supply of 1)
```

**ATA** stands for Associated Token Account. It's a PDA derived from the user's wallet + the token mint. This means you can always calculate where a user's tokens are stored without querying.

## Clusters

Solana runs on multiple networks called **clusters**:

| Cluster | When to Use | SOL Has Value? |
|---------|-------------|----------------|
| **Localnet** | Unit testing, fastest iteration | No (local only) |
| **Devnet** | Integration testing, sharing demos | No (free airdrop) |
| **Testnet** | Stress testing validators (rarely used by devs) | No |
| **Mainnet-Beta** | Production, real users, real money | Yes |

Your development loop:
1. Write code → test on **localnet** (via `anchor test`)
2. Deploy and test → use **devnet** (free SOL)
3. Ready for production → deploy to **mainnet-beta** (real SOL)

Switch between clusters:

```bash
solana config set --url localhost    # localnet
solana config set --url devnet       # devnet
solana config set --url mainnet-beta # mainnet
```

## Block Explorers

Explorers are web UIs for browsing the blockchain. They're your go-to debugging tool.

### Solana Explorer (Official)

https://explorer.solana.com

- Switch between clusters using the dropdown
- Look up accounts, transactions, programs
- Shows decoded instruction data

### Solscan

https://solscan.io

- Better UI for token balances and NFTs
- More detailed transaction breakdowns
- Portfolio view for wallets

### SolanaFM

https://solana.fm

- Advanced analytics
- Program interaction history

### Using Explorers for Debugging

When something goes wrong:

1. Copy the transaction signature from your error logs
2. Paste it into an explorer
3. Look at the instruction details and error message
4. Check which accounts were passed and their states

This is the Solana equivalent of looking at browser Network tab or server logs.

## Exercise

Using Solana Explorer on devnet:

1. Look up the Token Program: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
2. Find a recent token transfer transaction and read through its instructions
3. Look up the Token-2022 Program: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
4. Compare the two -- notice they have similar interfaces

---

**Key Takeaways**
- SOL is the native currency; 1 SOL = 1 billion lamports
- SPL tokens are custom tokens managed by the Token Program
- Each user needs an Associated Token Account (ATA) for each token they hold
- Develop on localnet/devnet, deploy to mainnet-beta when ready
- Block explorers are essential debugging tools

**Next:** [Module 02 - Rust Essentials for Solana](../02-rust-essentials-for-solana/)
