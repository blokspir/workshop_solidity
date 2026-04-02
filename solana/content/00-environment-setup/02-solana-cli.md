# Install and Configure the Solana CLI

The Solana CLI is the command-line tool for interacting with the Solana blockchain. You'll use it to manage wallets, check balances, deploy programs, and more.

## Installation

### macOS / Linux / WSL

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

After installation, add Solana to your PATH by adding this to your `~/.bashrc` or `~/.zshrc`:

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Then reload your shell:

```bash
source ~/.bashrc   # or source ~/.zshrc
```

## Verify Installation

```bash
solana --version
```

Expected output (version may differ):

```
solana-cli 1.18.x (src:xxxxxxxx; feat:xxxxxxxxx, client:Agave)
```

## Configure for Devnet

Solana has multiple networks (clusters). For development, you'll use **devnet** -- a free test network where tokens have no real value.

```bash
solana config set --url devnet
```

Verify your configuration:

```bash
solana config get
```

Output should show:

```
Config File: /home/yourname/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/yourname/.config/solana/id.json
Commitment: confirmed
```

## Understanding the Networks

| Network | URL | Purpose |
|---------|-----|---------|
| **localnet** | `http://localhost:8899` | Local testing (runs on your machine) |
| **devnet** | `https://api.devnet.solana.com` | Development and testing (free test SOL) |
| **testnet** | `https://api.testnet.solana.com` | Stress testing (less commonly used) |
| **mainnet-beta** | `https://api.mainnet-beta.solana.com` | Production (real money) |

You'll switch between localnet and devnet during development, and only touch mainnet when deploying for real.

## Useful CLI Commands

```bash
solana balance              # Check your wallet balance
solana address              # Show your wallet public key
solana airdrop 2            # Get 2 free SOL on devnet
solana logs                 # Stream program logs (useful for debugging)
solana program show <ID>    # Check if a program is deployed
```

---

**Key Takeaways**
- The Solana CLI is your primary tool for interacting with the blockchain
- Always develop on devnet (free test tokens) before touching mainnet
- `solana config set --url devnet` switches your CLI to the devnet network

**Next:** [03-anchor-cli.md](./03-anchor-cli.md) -- Install the Anchor framework
