# Multisig Wallets and Authority Management

## Why Multisig?

A single private key controlling your treasury or program upgrade authority is a single point of failure. If the key is compromised, everything is lost.

A **multisig wallet** requires multiple approvals (e.g., 2 of 3 signers) for any action. This protects against:

- Single key compromise
- Rogue team member
- Accidental transactions

## Squads Protocol

Squads is the standard multisig solution on Solana.

Website: https://squads.so

### Creating a Multisig

Via the Squads web app:

1. Go to https://app.squads.so
2. Connect your wallet
3. Create a new Squad
4. Add members (their wallet addresses)
5. Set the threshold (e.g., 2 of 3 must approve)

### Using Multisig for Treasury

1. Create a Squad multisig
2. Set your fee distribution program's treasury to the Squad address
3. Any withdrawal from the treasury requires multiple approvals
4. Team members approve transactions through the Squads web UI

### Using Multisig for Program Upgrade

Transfer your program's upgrade authority to the Squad:

```bash
solana program set-upgrade-authority <PROGRAM_ID> \
    --new-upgrade-authority <SQUAD_ADDRESS>
```

Now upgrading the program requires multiple team members to approve.

## Authority Management

### Revoking Mint Authority

After minting the total supply:

```bash
spl-token authorize <MINT_ADDRESS> mint --disable
```

Or programmatically (covered in Module 04).

### Revoking Upgrade Authority

To make a program immutable (can never be changed):

```bash
solana program set-upgrade-authority <PROGRAM_ID> --final
```

This is irreversible. The program can never be upgraded again. Only do this when you're absolutely sure the program is bug-free.

### Authority Checklist for Launch

| Authority | Action | When |
|-----------|--------|------|
| Mint authority | Revoke after minting total supply | Before public announcement |
| Freeze authority | Revoke (unless needed for compliance) | At launch |
| Token fee authority | Transfer to multisig | Before launch |
| Program upgrade authority | Transfer to multisig | Before launch |
| Treasury | Use multisig from the start | Day 1 |

---

**Key Takeaways**
- Never use a single private key for treasury or upgrade authority in production
- Squads Protocol provides multisig wallets on Solana
- Transfer critical authorities to a multisig before launching
- Revoking mint authority makes token supply permanently fixed
- Revoking upgrade authority makes programs immutable (irreversible)

**Next:** [04-noncustodial-design.md](./04-noncustodial-design.md)
