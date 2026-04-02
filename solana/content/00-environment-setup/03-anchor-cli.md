# Install the Anchor Framework

Anchor is the most popular framework for building Solana programs. It provides a layer of abstractions on top of raw Solana development, similar to how Express.js simplifies Node.js HTTP servers.

## Why Anchor?

Without Anchor, writing Solana programs involves:
- Manual account serialization/deserialization
- Hand-written account validation
- Raw byte manipulation for data storage
- Verbose boilerplate for every instruction

Anchor handles all of this with macros and conventions, letting you focus on business logic.

## Installation

### Install AVM (Anchor Version Manager)

AVM lets you install and switch between Anchor versions, similar to nvm for Node.js.

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --force
```

This compilation takes a few minutes. Be patient.

### Install Anchor CLI via AVM

```bash
avm install latest
avm use latest
```

## Verify Installation

```bash
anchor --version
```

Expected output:

```
anchor-cli 0.30.x
```

## What Anchor Gives You

| Feature | Without Anchor | With Anchor |
|---------|---------------|-------------|
| Account validation | Manual checks in every instruction | Declarative with `#[derive(Accounts)]` |
| Serialization | Manual Borsh encoding/decoding | Automatic via macros |
| Error handling | Raw error codes | Named errors with `#[error_code]` |
| Testing | Manual RPC calls | TypeScript test framework |
| Building | Complex cargo/bpf commands | `anchor build` |
| IDL generation | None | Automatic interface descriptions |

You'll explore all of these in Module 03.

## Quick Sanity Check

Create a temporary project to verify everything works:

```bash
anchor init test-project
cd test-project
anchor build
```

If `anchor build` completes without errors, your toolchain is working. You can delete this project afterwards:

```bash
cd ..
rm -rf test-project
```

If you get errors, the most common issues are:
- Rust version too old: run `rustup update`
- Solana CLI not found: check your PATH
- Missing system dependencies on Linux: `sudo apt install -y pkg-config build-essential libudev-dev`

---

**Key Takeaways**
- Anchor is the standard framework for Solana program development
- Install it via AVM (Anchor Version Manager) for easy version switching
- `anchor build` is the command you'll run most often during development

**Next:** [04-node-and-yarn.md](./04-node-and-yarn.md) -- Node.js and Yarn for test scripts
