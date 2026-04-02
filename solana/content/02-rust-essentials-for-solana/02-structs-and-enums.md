# Structs and Enums

Structs and enums are the building blocks of data types in Rust. In Solana programs, you'll use them to define the shape of your on-chain data.

## Structs

A struct is like a TypeScript interface/type, but it also stores the data:

```typescript
// TypeScript
interface User {
  name: string;
  age: number;
  active: boolean;
}
```

```rust
// Rust
struct User {
    name: String,
    age: u64,
    active: bool,
}
```

Key differences from TypeScript:
- Fields use `,` not `;`
- Types come after `:` (same as TS)
- `String` instead of `string`, `u64` instead of `number`, `bool` instead of `boolean`

### Creating a Struct Instance

```rust
let user = User {
    name: String::from("Alice"),
    age: 25,
    active: true,
};

println!("Name: {}", user.name);
```

### Updating Fields

The variable must be declared `mut`:

```rust
let mut user = User {
    name: String::from("Alice"),
    age: 25,
    active: true,
};

user.age = 26;
```

## Impl Blocks (Methods)

Methods are defined in a separate `impl` block:

```rust
struct Counter {
    value: u64,
}

impl Counter {
    // Associated function (like a static method)
    fn new() -> Self {
        Counter { value: 0 }
    }

    // Method (takes &self for read access)
    fn get(&self) -> u64 {
        self.value
    }

    // Method (takes &mut self for write access)
    fn increment(&mut self) {
        self.value += 1;
    }
}

let mut counter = Counter::new();
counter.increment();
println!("Count: {}", counter.get());  // Count: 1
```

`Self` refers to the type itself (`Counter`). `&self` and `&mut self` follow the borrowing rules.

## In Solana Programs

Account data is defined as structs:

```rust
#[account]
pub struct UserProfile {
    pub authority: Pubkey,    // 32 bytes
    pub username: String,     // 4 + len bytes
    pub reputation: u64,      // 8 bytes
    pub created_at: i64,      // 8 bytes
}
```

The `#[account]` macro (from Anchor) automatically handles serialization.

## Enums

An enum defines a type that can be one of several variants:

```rust
enum Status {
    Active,
    Paused,
    Closed,
}

let current = Status::Active;
```

### Enums with Data

Rust enums can carry data (much more powerful than TypeScript enums):

```rust
enum PaymentMethod {
    Sol,                           // no data
    SplToken { mint: Pubkey },     // struct-like data
    Fiat(String),                  // tuple-like data
}

let payment = PaymentMethod::SplToken {
    mint: some_pubkey,
};
```

### Enums in Solana

Enums are common for representing states:

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ListingStatus {
    Active,
    Sold,
    Cancelled,
}

#[account]
pub struct Listing {
    pub seller: Pubkey,
    pub price: u64,
    pub status: ListingStatus,
}
```

## Common Rust Types vs TypeScript

| TypeScript | Rust | Notes |
|-----------|------|-------|
| `string` | `String` | Heap-allocated, growable |
| `number` | `u64`, `i64`, `f64` | Explicit size and sign |
| `boolean` | `bool` | Same |
| `null` / `undefined` | `Option<T>` | No null in Rust |
| `any` | Doesn't exist | Rust is strictly typed |
| `T[]` | `Vec<T>` | Growable array |
| `[T, T]` (tuple) | `(T, T)` | Fixed-size tuple |

### Integer Types

| Type | Size | Range |
|------|------|-------|
| `u8` | 1 byte | 0 to 255 |
| `u16` | 2 bytes | 0 to 65,535 |
| `u32` | 4 bytes | 0 to ~4 billion |
| `u64` | 8 bytes | 0 to ~18 quintillion |
| `i64` | 8 bytes | -9 quintillion to +9 quintillion |

In Solana programs, `u64` is the standard for amounts, `i64` for timestamps, and `u8` for small flags.

---

**Key Takeaways**
- Structs define data shapes (like TS interfaces but with actual storage)
- Methods go in `impl` blocks, using `&self` for read and `&mut self` for write
- Enums can carry data, making them much more powerful than TS enums
- Solana account data is defined as structs with the `#[account]` macro
- Use `u64` for amounts, `i64` for timestamps, `Pubkey` for addresses

**Next:** [03-traits-and-derive.md](./03-traits-and-derive.md)
