# Create a Devnet Wallet

Every interaction with Solana requires a wallet (keypair). The Solana CLI can generate one for you.

## Generate a Keypair

```bash
solana-keygen new
```

You'll see output like:

```
Generating a new keypair

For added security, enter a BIP39 passphrase

NOTE! This passphrase improves security of the backup seed phrase NOT of the
keypair file itself, which is stored as insecure plain text

BIP39 Passphrase (empty for none):
```

Press Enter to skip the passphrase (this is a devnet wallet, not real money).

The keypair is saved to `~/.config/solana/id.json`. This file contains your private key -- never share it or commit it to git.

## View Your Address

```bash
solana address
```

This shows your **public key** (wallet address). It looks like:

```
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

## Get Free Devnet SOL

On devnet, you can request free SOL for testing:

```bash
solana airdrop 5
```

Check your balance:

```bash
solana balance
```

```
5 SOL
```

If the airdrop fails (rate limited), wait a minute and try again with a smaller amount:

```bash
solana airdrop 1
```

You can also use web faucets:
- https://faucet.solana.com
- https://solfaucet.com

## Important: This Is a Dev Wallet

This wallet is for **development only**. The rules:

1. **Never** put real SOL in this wallet
2. **Never** commit `id.json` to git
3. **Never** reuse this keypair on mainnet
4. For mainnet, you'll use a separate hardware wallet or browser wallet (Phantom, etc.)

## Verify Everything Is Connected

Run this to confirm your setup:

```bash
solana config get
solana address
solana balance
```

You should see: devnet URL, your public key, and a balance > 0.

---

**Key Takeaways**
- `solana-keygen new` creates a new wallet keypair at `~/.config/solana/id.json`
- `solana airdrop` gives you free devnet SOL for testing
- Never use your dev wallet for real funds

**Next:** [07-hello-world-deploy.md](./07-hello-world-deploy.md) -- Deploy your first program
