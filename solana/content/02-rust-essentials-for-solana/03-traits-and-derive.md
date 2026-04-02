# Traits and Derive

Traits are Rust's version of interfaces. `#[derive(...)]` is how you auto-implement them. You'll see both on almost every struct in an Anchor program.

## What Is a Trait?

A trait defines a set of methods that a type must implement:

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}: {}...", self.title, &self.content[..50])
    }
}
```

This is very similar to TypeScript interfaces:

```typescript
interface Summary {
  summarize(): string;
}
```

The difference is that in Rust, the implementation is separate from the struct definition.

## Derive: Auto-Implementing Traits

Many traits have obvious implementations that can be generated automatically. The `#[derive(...)]` attribute does this:

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}
```

This is equivalent to manually writing:
- `Debug` -- enables `println!("{:?}", point)` for debugging output
- `Clone` -- enables `point.clone()` to create a copy
- `PartialEq` -- enables `point_a == point_b` comparison

Without derive, you'd write dozens of lines of boilerplate.

## Common Derive Traits

| Trait | What It Enables | Used In Solana? |
|-------|----------------|-----------------|
| `Debug` | Debug printing with `{:?}` | Yes, for logging |
| `Clone` | `.clone()` method | Yes, frequently |
| `Copy` | Implicit copying (no move) | Rarely |
| `PartialEq` | `==` comparison | Yes, for enums |
| `Eq` | Strict equality | Sometimes |
| `Hash` | Hashing (for HashMaps) | Rarely |
| `Default` | `Type::default()` | Sometimes |

## Anchor-Specific Derives

Anchor adds its own derive macros that you'll use on every program:

### `#[derive(Accounts)]`

Defines the account inputs for an instruction:

```rust
#[derive(Accounts)]
pub struct CreateNote<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(init, payer = author, space = 8 + 256)]
    pub note: Account<'info, NoteData>,

    pub system_program: Program<'info, System>,
}
```

### `#[account]`

Marks a struct as an Anchor account (adds Borsh serialization + discriminator):

```rust
#[account]
pub struct NoteData {
    pub author: Pubkey,
    pub content: String,
    pub timestamp: i64,
}
```

### `AnchorSerialize` and `AnchorDeserialize`

For types used inside accounts that need custom serialization:

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum NoteStatus {
    Draft,
    Published,
    Archived,
}
```

## The `'info` Lifetime

You'll see `<'info>` on account structs. This is a **lifetime annotation** -- Rust's way of tracking how long references are valid.

For Anchor development, you don't need to deeply understand lifetimes. Just know:

- Always use `<'info>` on your `#[derive(Accounts)]` structs
- It tells Rust that the account references are valid for the duration of the instruction
- If you forget it, the compiler will tell you

```rust
// Just always do this pattern:
#[derive(Accounts)]
pub struct MyInstruction<'info> {
    // accounts here
}
```

---

**Key Takeaways**
- Traits are like interfaces -- they define required methods
- `#[derive(...)]` auto-implements common traits (Debug, Clone, etc.)
- Anchor adds `#[derive(Accounts)]` for instruction inputs and `#[account]` for data structs
- The `<'info>` lifetime annotation is boilerplate you'll always use in Anchor
- You don't need to master lifetimes -- just follow the patterns

**Next:** [04-error-handling.md](./04-error-handling.md)
