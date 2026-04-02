# Testing with Anchor

Anchor uses TypeScript tests that interact with your program. If you've written Jest or Mocha tests for a web app, the structure will feel familiar.

## Running Tests

```bash
anchor test
```

This command:
1. Builds your program
2. Starts a local Solana validator
3. Deploys your program to it
4. Runs your TypeScript test files
5. Shuts down the validator

## Test File Structure

Tests live in `tests/` and use Mocha syntax:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import { expect } from "chai";

describe("my_program", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.MyProgram as Program<MyProgram>;

    it("creates a user", async () => {
        // test code here
    });

    it("updates a user", async () => {
        // test code here
    });
});
```

### Key Imports

- `anchor.AnchorProvider.env()` -- creates a provider from your Anchor.toml config
- `anchor.workspace.MyProgram` -- your program, loaded from the IDL
- `Program<MyProgram>` -- typed program interface (generated from the IDL)

## Calling Instructions

```typescript
it("initializes a counter", async () => {
    const counterKeypair = anchor.web3.Keypair.generate();

    await program.methods
        .initialize()                               // instruction name
        .accounts({
            counter: counterKeypair.publicKey,       // accounts
            user: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([counterKeypair])                   // additional signers
        .rpc();                                      // send transaction

    // Fetch the account and check data
    const counter = await program.account.counter.fetch(
        counterKeypair.publicKey
    );
    expect(counter.count.toNumber()).to.equal(0);
});
```

### The Pattern

```typescript
await program.methods
    .instructionName(arg1, arg2)  // instruction + data
    .accounts({ ... })             // required accounts
    .signers([...])                // additional signers (wallet signs automatically)
    .rpc();                        // execute
```

## Fetching Account Data

```typescript
// Fetch a single account
const data = await program.account.userProfile.fetch(accountPublicKey);
console.log(data.name);
console.log(data.authority.toString());

// Fetch all accounts of a type
const allProfiles = await program.account.userProfile.all();
for (const profile of allProfiles) {
    console.log(profile.account.name);
}

// Fetch with filter
const myProfiles = await program.account.userProfile.all([
    {
        memcmp: {
            offset: 8,     // after discriminator
            bytes: provider.wallet.publicKey.toBase58(),
        },
    },
]);
```

## Deriving PDAs in Tests

```typescript
const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
        Buffer.from("profile"),
        provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
);

await program.methods
    .createProfile("Alice")
    .accounts({
        user: provider.wallet.publicKey,
        profile: profilePda,
        systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
```

## Testing Errors

```typescript
it("rejects zero amount", async () => {
    try {
        await program.methods
            .transfer(new anchor.BN(0))
            .accounts({ ... })
            .rpc();
        expect.fail("Should have thrown an error");
    } catch (err) {
        expect(err.error.errorCode.code).to.equal("InvalidAmount");
    }
});
```

## Tips

- **Use `anchor.BN`** for u64/i64 values (JavaScript numbers lose precision above 2^53)
- **Generate keypairs** with `Keypair.generate()` for test accounts
- **The wallet** (`provider.wallet`) automatically signs transactions
- **Check account data** after every operation to verify state changes
- **Test failure cases** too -- make sure invalid inputs are rejected

---

**Key Takeaways**
- Tests are TypeScript files using Mocha/Chai that call your program
- `program.methods.instructionName(args).accounts({...}).rpc()` is the call pattern
- Use `program.account.typeName.fetch(key)` to read on-chain data
- Derive PDAs in tests with `PublicKey.findProgramAddressSync`
- Use `anchor.BN` for large numbers

**Next:** [08-lab-counter-program.md](./08-lab-counter-program.md)
