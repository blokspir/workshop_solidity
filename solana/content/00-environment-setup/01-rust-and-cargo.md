# Install Rust and Cargo

Solana programs are written in Rust. Even if you'll use AI to help write most of the Rust code, you need the compiler installed locally to build and test programs.

## What You're Installing

- **Rust** -- the programming language compiler
- **Cargo** -- Rust's package manager and build tool (comes with Rust)
- **rustup** -- the tool that manages Rust versions

Think of it like this: rustup is to Rust what nvm is to Node.js.

## Installation

### macOS / Linux / WSL

Open a terminal and run:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

When prompted, choose option 1 (default installation).

After installation, load the environment:

```bash
source $HOME/.cargo/env
```

### Windows

If you're on Windows, you have two options:

1. **Recommended:** Use WSL2 (Windows Subsystem for Linux) and follow the Linux instructions above
2. **Alternative:** Download and run the installer from https://rustup.rs

WSL2 is strongly recommended because Solana tooling works most reliably on Linux.

## Verify Installation

```bash
rustc --version
cargo --version
```

You should see version numbers for both. Example output:

```
rustc 1.78.0 (9b00956e5 2024-04-29)
cargo 1.78.0 (54d8815d0 2024-03-26)
```

The exact versions don't matter as long as they're recent (2024+).

## What Cargo Does

You'll interact with Cargo constantly. Here are the commands you'll use most:

| Command | What it does |
|---------|-------------|
| `cargo build` | Compile your project |
| `cargo test` | Run tests |
| `cargo add <package>` | Add a dependency |
| `cargo check` | Check for errors without building (faster) |

For Solana development, you'll mostly use Anchor's CLI (which calls Cargo under the hood), but knowing these commands helps when debugging.

---

**Key Takeaways**
- Rust is installed via rustup, which manages versions and toolchains
- Cargo is Rust's build tool and package manager, similar to npm for Node.js
- WSL2 is recommended for Windows users

**Next:** [02-solana-cli.md](./02-solana-cli.md) -- Install the Solana CLI
