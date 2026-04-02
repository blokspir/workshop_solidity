# Deployment Guide

## Deploying to Devnet

### Step 1: Configure for Devnet

```bash
solana config set --url devnet
```

### Step 2: Ensure You Have SOL

```bash
solana balance
# If low:
solana airdrop 5
```

### Step 3: Build

```bash
anchor build
```

### Step 4: Sync Keys

```bash
anchor keys sync
anchor build  # rebuild with correct program ID
```

### Step 5: Deploy

```bash
anchor deploy
```

### Step 6: Verify

```bash
solana program show <PROGRAM_ID>
```

Check on Solana Explorer: `https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet`

## Deploying to Mainnet-Beta

### Prerequisites

- [ ] All tests pass
- [ ] Tested thoroughly on devnet
- [ ] Security review completed
- [ ] Authorities planned (multisig, revocations)
- [ ] Real SOL for deployment (~2-5 SOL depending on program size)

### Step 1: Configure for Mainnet

```bash
solana config set --url mainnet-beta
```

### Step 2: Use a Dedicated Deploy Keypair

Don't use your personal wallet for deployment. Create a dedicated keypair:

```bash
solana-keygen new -o deploy-keypair.json
```

Fund it with enough SOL for deployment.

### Step 3: Build and Deploy

```bash
anchor build
anchor deploy --provider.wallet deploy-keypair.json
```

### Step 4: Transfer Upgrade Authority to Multisig

```bash
solana program set-upgrade-authority <PROGRAM_ID> \
    --new-upgrade-authority <SQUAD_MULTISIG_ADDRESS>
```

### Step 5: Verify on Explorer

Check `https://explorer.solana.com/address/<PROGRAM_ID>`

## Program Upgrades

Solana programs are upgradeable by default. The upgrade authority can push new code.

### Upgrading on Devnet

```bash
# Make changes to your code
anchor build
anchor upgrade target/deploy/my_program.so --program-id <PROGRAM_ID>
```

### Upgrading via Multisig

When the upgrade authority is a multisig:

1. Create an upgrade proposal in Squads
2. Each required signer approves
3. Execute the proposal

### Making a Program Immutable

If you want the program to be forever unchangeable:

```bash
solana program set-upgrade-authority <PROGRAM_ID> --final
```

This is permanent and irreversible.

## Verifiable Builds

Verifiable builds let anyone confirm that the deployed bytecode matches the source code:

```bash
# Install the verifiable build tool
cargo install --git https://github.com/AnchorLang/anchor anchor-cli --locked

# Build with verification
anchor build --verifiable

# Verify a deployed program
anchor verify <PROGRAM_ID>
```

This is important for trust -- users can verify that the deployed program matches the published source code.

## Deployment Checklist

### Before Devnet
- [ ] All tests pass locally (`anchor test`)
- [ ] Space calculations are correct
- [ ] Error codes are descriptive
- [ ] Events are emitted for important actions

### Before Mainnet
- [ ] Thorough devnet testing (weeks, not hours)
- [ ] Security audit (for programs handling real funds)
- [ ] Upgrade authority → multisig
- [ ] Treasury → multisig
- [ ] Mint authority → revoked (if fixed supply)
- [ ] Freeze authority → revoked (unless needed)
- [ ] Verifiable build published
- [ ] IDL published for client verification
- [ ] Monitoring and alerting set up
- [ ] Rollback plan documented

## Cost Estimates

| Item | Approximate Cost |
|------|-----------------|
| Program deployment (small) | 1-2 SOL |
| Program deployment (medium) | 2-5 SOL |
| Program deployment (large) | 5-10 SOL |
| Token creation | 0.01 SOL |
| NFT minting | 0.004 SOL |
| Transaction fee | 0.000005 SOL |

---

**Key Takeaways**
- Devnet deployment: `anchor build` → `anchor deploy` (free devnet SOL)
- Mainnet: use a dedicated deploy keypair, transfer authority to multisig after
- Programs are upgradeable by default; use `--final` only when certain
- Verifiable builds let anyone confirm source matches deployed code
- Always follow the deployment checklist before mainnet

**Next:** [Module 12 - Capstone Exercises](../12-capstone-exercises/)
