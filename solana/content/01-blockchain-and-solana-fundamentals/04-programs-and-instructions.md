# Programs and Instructions

Now that you understand accounts, let's look at how programs (smart contracts) work on Solana.

## Programs Are Stateless

This is the key difference from Ethereum. On Ethereum, a smart contract stores its own data. On Solana, a program is **pure logic** -- it reads and writes data by receiving accounts as inputs.

Think of a Solana program like a **function** rather than an **object**:

```
// Ethereum-style (object with state)
contract Token {
    mapping(address => uint) balances;  // state inside the contract
    function transfer(to, amount) { ... }
}

// Solana-style (function with external state)
program Token {
    // no state here
    fn transfer(sender_account, receiver_account, amount) { ... }
    // reads/writes the accounts passed in
}
```

## Instructions

An **instruction** is a single operation you want a program to perform. It contains:

1. **Program ID** -- which program to call
2. **Accounts** -- the accounts the program needs to read/write
3. **Data** -- additional parameters (e.g., the amount to transfer)

Example: "Transfer 100 tokens from Alice to Bob" is an instruction that specifies:
- Program: Token Program
- Accounts: Alice's token account (writable), Bob's token account (writable), Alice's wallet (signer)
- Data: amount = 100

## Built-in Programs

Solana comes with several built-in programs that handle common operations:

| Program | Address | What It Does |
|---------|---------|-------------|
| **System Program** | `11111111111111111111111111111111` | Create accounts, transfer SOL |
| **Token Program** | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | SPL token operations |
| **Token-2022 Program** | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | Extended token operations |
| **Associated Token Account** | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` | Create/find token accounts |
| **Rent** | `SysvarRent111111111111111111111111111111111` | Rent calculations |

You'll interact with these constantly, but through SDKs and Anchor helpers rather than directly.

## Your Custom Programs

When you write an Anchor program, you're creating a custom program that:

1. Defines instructions (like REST API endpoints)
2. Specifies which accounts each instruction needs
3. Contains the logic to read/write those accounts

Example structure:

```
Your Program
├── Instruction: create_user
│   Accounts needed: [payer, user_account, system_program]
│   Logic: Initialize user_account with default data
│
├── Instruction: update_profile
│   Accounts needed: [authority, user_account]
│   Logic: Validate authority, update user_account data
│
└── Instruction: delete_user
    Accounts needed: [authority, user_account]
    Logic: Validate authority, close user_account
```

This is conceptually similar to REST endpoints:

| REST API | Solana Program |
|----------|---------------|
| `POST /users` | `create_user` instruction |
| `PUT /users/:id` | `update_profile` instruction |
| `DELETE /users/:id` | `delete_user` instruction |
| Request body | Instruction data |
| Database tables | Accounts |

## The "Account List" Requirement

Because Solana parallelizes transactions, every instruction must declare upfront which accounts it will access. This is not optional -- if you don't include an account, your program cannot read or write it.

This is different from a database where your server code can query any table at any time. On Solana, the account list is like a SQL query's `FROM` clause -- declared explicitly.

---

**Key Takeaways**
- Programs are stateless logic. All data lives in accounts passed as inputs.
- Instructions are the operations you can call on a program (like API endpoints)
- Every instruction declares which accounts it reads/writes
- Solana has built-in programs for common operations (System, Token, etc.)

**Next:** [05-transactions.md](./05-transactions.md)
