# Lab: Counter Program

Build a simple counter program to practice the basics. This is the "Hello World" of Anchor.

## What You'll Build

A program with three instructions:
- `initialize` -- create a counter set to 0
- `increment` -- add 1 to the counter
- `decrement` -- subtract 1 from the counter (but not below 0)

## Step 1: Create the Project

```bash
anchor init counter
cd counter
```

## Step 2: Write the Program

Replace the contents of `programs/counter/src/lib.rs`:

```rust
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.count = 0;
        counter.bump = ctx.bumps.counter;
        Ok(())
    }

    pub fn increment(ctx: Context<Modify>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1).unwrap();
        msg!("Counter incremented to {}", counter.count);
        Ok(())
    }

    pub fn decrement(ctx: Context<Modify>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require!(counter.count > 0, CounterError::AlreadyZero);
        counter.count = counter.count.checked_sub(1).unwrap();
        msg!("Counter decremented to {}", counter.count);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Counter::SPACE,
        seeds = [b"counter", authority.key().as_ref()],
        bump,
    )]
    pub counter: Account<'info, Counter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Modify<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump = counter.bump,
        has_one = authority,
    )]
    pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
    pub authority: Pubkey,  // 32
    pub count: u64,         // 8
    pub bump: u8,           // 1
}

impl Counter {
    pub const SPACE: usize = 32 + 8 + 1;
}

#[error_code]
pub enum CounterError {
    #[msg("Counter is already at zero")]
    AlreadyZero,
}
```

## Step 3: Build and Sync Keys

```bash
anchor build
anchor keys sync
anchor build
```

The double build is needed because `anchor keys sync` updates the program ID in `declare_id!`.

## Step 4: Write Tests

Replace `tests/counter.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { expect } from "chai";

describe("counter", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Counter as Program<Counter>;

    const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("counter"), provider.wallet.publicKey.toBuffer()],
        program.programId
    );

    it("initializes the counter", async () => {
        await program.methods
            .initialize()
            .accounts({
                authority: provider.wallet.publicKey,
                counter: counterPda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const counter = await program.account.counter.fetch(counterPda);
        expect(counter.count.toNumber()).to.equal(0);
        expect(counter.authority.toString()).to.equal(
            provider.wallet.publicKey.toString()
        );
    });

    it("increments the counter", async () => {
        await program.methods
            .increment()
            .accounts({
                authority: provider.wallet.publicKey,
                counter: counterPda,
            })
            .rpc();

        const counter = await program.account.counter.fetch(counterPda);
        expect(counter.count.toNumber()).to.equal(1);
    });

    it("increments again", async () => {
        await program.methods
            .increment()
            .accounts({
                authority: provider.wallet.publicKey,
                counter: counterPda,
            })
            .rpc();

        const counter = await program.account.counter.fetch(counterPda);
        expect(counter.count.toNumber()).to.equal(2);
    });

    it("decrements the counter", async () => {
        await program.methods
            .decrement()
            .accounts({
                authority: provider.wallet.publicKey,
                counter: counterPda,
            })
            .rpc();

        const counter = await program.account.counter.fetch(counterPda);
        expect(counter.count.toNumber()).to.equal(1);
    });

    it("cannot decrement below zero", async () => {
        // Decrement to 0 first
        await program.methods.decrement().accounts({
            authority: provider.wallet.publicKey,
            counter: counterPda,
        }).rpc();

        // Try to decrement below 0
        try {
            await program.methods.decrement().accounts({
                authority: provider.wallet.publicKey,
                counter: counterPda,
            }).rpc();
            expect.fail("Should have thrown");
        } catch (err) {
            expect(err.error.errorCode.code).to.equal("AlreadyZero");
        }
    });
});
```

## Step 5: Run Tests

```bash
anchor test
```

You should see all 5 tests passing.

## What You Practiced

- Creating a PDA-based account with `init`
- Using `has_one` for authorization
- Custom error handling with `require!` and `#[error_code]`
- Space calculation
- Storing and using the PDA bump
- TypeScript testing with account fetching

---

**Key Takeaways**
- PDA seeds: `[b"counter", authority.key()]` gives each user their own counter
- `has_one = authority` ensures only the owner can modify the counter
- `checked_add` / `checked_sub` prevent integer overflow
- Tests derive the PDA the same way the program does

**Next:** [09-lab-vault-program.md](./09-lab-vault-program.md)
