# Hello World: Deploy Your First Program

Time to verify everything works end-to-end. You'll create an Anchor project, build it, test it, and deploy it to devnet.

## Step 1: Create a New Anchor Project

```bash
anchor init hello-solana
cd hello-solana
```

This creates a project with:

```
hello-solana/
├── Anchor.toml           # Project configuration
├── Cargo.toml            # Rust workspace configuration
├── package.json          # Node.js dependencies
├── programs/
│   └── hello-solana/
│       ├── Cargo.toml    # Program dependencies
│       └── src/
│           └── lib.rs    # Your program code
├── tests/
│   └── hello-solana.ts   # TypeScript tests
└── tsconfig.json
```

## Step 2: Look at the Generated Code

Open `programs/hello-solana/src/lib.rs`:

```rust
use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

#[program]
pub mod hello_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

Don't worry about understanding every line yet. Module 03 covers all of this in detail. For now, know that:

- `declare_id!` identifies your program on-chain
- `#[program]` marks the module containing your instructions
- `initialize` is an instruction that logs a message
- `#[derive(Accounts)]` defines what accounts the instruction needs

## Step 3: Build

```bash
anchor build
```

This compiles your Rust program into a deployable binary. The first build takes a few minutes as it downloads and compiles dependencies.

If the build succeeds, you'll see output ending with something like:

```
Finished `release` profile [optimized] target(s) in 30.42s
```

## Step 4: Run Tests

Install dependencies first:

```bash
yarn install
```

Then run the tests:

```bash
anchor test
```

This starts a local Solana validator, deploys your program to it, runs your TypeScript tests, and shuts down the validator. You should see:

```
hello-solana
  ✔ Is initialized! (xxx ms)

1 passing
```

## Step 5: Deploy to Devnet

Make sure you have devnet SOL:

```bash
solana balance
```

If it's 0, airdrop some:

```bash
solana airdrop 5
```

Sync your program ID:

```bash
anchor keys sync
```

Rebuild with the correct ID:

```bash
anchor build
```

Deploy:

```bash
anchor deploy
```

If successful, you'll see:

```
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: /home/yourname/.config/solana/id.json
Deploying program "hello_solana"...
Program path: /home/yourname/hello-solana/target/deploy/hello_solana.so
Program Id: <YOUR_PROGRAM_ID>

Deploy success
```

## Step 6: Verify on Explorer

Copy your Program Id from the deploy output and paste it into the Solana Explorer:

```
https://explorer.solana.com/address/<YOUR_PROGRAM_ID>?cluster=devnet
```

You should see your program listed as an executable account.

## Congratulations

Your full toolchain is working:
- Rust compiled your code
- Anchor built and packaged it
- Solana CLI deployed it to devnet
- You can see it on the blockchain explorer

If anything failed, go back to the specific installation step and troubleshoot. Common fixes:
- `anchor build` fails → run `rustup update` and try again
- `anchor test` fails → run `yarn install` first
- `anchor deploy` fails → make sure you have devnet SOL and are on the devnet cluster

---

**Key Takeaways**
- `anchor init` creates a new project with all the scaffolding you need
- `anchor build` compiles your Rust code into a deployable program
- `anchor test` runs your TypeScript tests against a local validator
- `anchor deploy` pushes your program to the configured cluster (devnet)

**Next:** [Module 01 - Blockchain & Solana Fundamentals](../01-blockchain-and-solana-fundamentals/)
