# Anchor Project Structure

Every Anchor project follows the same structure. Understanding what each file does saves you from confusion later.

## Creating a Project

```bash
anchor init my_project
cd my_project
```

## Directory Layout

```
my_project/
├── Anchor.toml                 # Anchor configuration
├── Cargo.toml                  # Rust workspace config
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript config
├── programs/
│   └── my_project/
│       ├── Cargo.toml          # Program dependencies
│       └── src/
│           └── lib.rs          # Your program code
├── tests/
│   └── my_project.ts           # TypeScript tests
├── app/                        # (optional) frontend code
├── migrations/
│   └── deploy.ts               # deployment script
└── target/                     # build output (gitignored)
    ├── deploy/
    │   └── my_project.so       # compiled program binary
    └── idl/
        └── my_project.json     # generated IDL
```

## Key Files

### Anchor.toml

The project configuration file:

```toml
[features]
seeds = false
skip-lint = false

[programs.devnet]
my_project = "YOUR_PROGRAM_ID"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

Important settings:
- `[programs.devnet]` -- your program ID per cluster
- `[provider]` -- which cluster and wallet to use
- `[scripts]` -- the test runner command

### programs/my_project/src/lib.rs

This is where your program code lives. A fresh project looks like:

```rust
use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod my_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

### programs/my_project/Cargo.toml

Rust dependencies for your program:

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"    # add this when working with tokens
```

### target/idl/my_project.json

The **IDL** (Interface Description Language) is generated automatically when you build. It describes your program's interface: what instructions it has, what accounts they expect, and what data types they use.

The IDL is used by TypeScript clients to interact with your program -- similar to an OpenAPI/Swagger spec for REST APIs.

## Common Commands

| Command | What It Does |
|---------|-------------|
| `anchor build` | Compile the Rust program |
| `anchor test` | Build + start local validator + run tests |
| `anchor deploy` | Deploy to configured cluster |
| `anchor keys list` | Show program ID |
| `anchor keys sync` | Sync program ID to lib.rs and Anchor.toml |

## Multi-File Programs

As your program grows, split it into multiple files:

```
programs/my_project/src/
├── lib.rs              # program entry + instruction handlers
├── state.rs            # account structs
├── errors.rs           # error codes
├── instructions/
│   ├── mod.rs          # re-exports
│   ├── create.rs       # create instruction
│   ├── update.rs       # update instruction
│   └── delete.rs       # delete instruction
└── constants.rs        # constants
```

Module 03 starts with everything in `lib.rs` for simplicity. You'll split into files as programs get larger.

---

**Key Takeaways**
- `Anchor.toml` configures cluster, wallet, and program IDs
- Your program code lives in `programs/<name>/src/lib.rs`
- The IDL (generated at build time) describes your program's interface
- `anchor build`, `anchor test`, and `anchor deploy` are your main commands

**Next:** [02-program-basics.md](./02-program-basics.md)
