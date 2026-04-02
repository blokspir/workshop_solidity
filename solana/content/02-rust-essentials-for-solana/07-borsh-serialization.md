# Borsh Serialization

Solana stores all data as raw bytes. Borsh (Binary Object Representation Serializer for Hashing) is the format Solana uses to convert Rust structs to/from bytes.

## Why Serialization Matters

When you store a struct on-chain:

```rust
#[account]
pub struct UserProfile {
    pub name: String,
    pub score: u64,
}
```

Solana doesn't store this as a nice JSON object. It stores raw bytes:

```
[8-byte discriminator][4-byte string length][string bytes][8-byte u64]
```

Borsh defines the rules for converting between structs and bytes. Anchor handles this automatically with the `#[account]` macro, but understanding the layout matters for calculating account sizes.

## Account Space Calculation

When creating an account, you must specify its size in bytes. This determines how much rent-exempt SOL you need to deposit.

### Size of Common Types

| Type | Size in Bytes |
|------|--------------|
| `bool` | 1 |
| `u8` / `i8` | 1 |
| `u16` / `i16` | 2 |
| `u32` / `i32` | 4 |
| `u64` / `i64` | 8 |
| `u128` / `i128` | 16 |
| `f32` | 4 |
| `f64` | 8 |
| `Pubkey` | 32 |
| `String` | 4 + length of string |
| `Vec<T>` | 4 + (count * size of T) |
| `Option<T>` | 1 + size of T |
| Enum (no data) | 1 |
| Enum (with data) | 1 + size of largest variant |

### The 8-Byte Discriminator

Anchor adds an 8-byte **discriminator** at the start of every account. This is a hash of the account type name and is used to identify what type of data the account holds.

So the total space formula is:

```
space = 8 (discriminator) + sum of all field sizes
```

### Example Calculation

```rust
#[account]
pub struct UserProfile {
    pub authority: Pubkey,   // 32 bytes
    pub username: String,    // 4 + max_length bytes
    pub score: u64,          // 8 bytes
    pub is_active: bool,     // 1 byte
}
```

If max username length is 32 characters:

```
space = 8 + 32 + (4 + 32) + 8 + 1 = 85 bytes
```

In code:

```rust
#[account(init, payer = payer, space = 8 + 32 + (4 + 32) + 8 + 1)]
pub user_profile: Account<'info, UserProfile>,
```

### Using Constants

A cleaner approach:

```rust
impl UserProfile {
    pub const MAX_USERNAME_LEN: usize = 32;
    pub const SPACE: usize = 8 + 32 + (4 + Self::MAX_USERNAME_LEN) + 8 + 1;
}

// Then in the account constraint:
#[account(init, payer = payer, space = UserProfile::SPACE)]
```

## What Borsh Does Internally

For a `UserProfile { authority: <pubkey>, username: "Alice", score: 100, is_active: true }`:

```
Bytes on chain:
[discriminator: 8 bytes]
[authority: 32 bytes of public key]
[username length: 05 00 00 00]  (4 bytes, little-endian = 5)
[username data: 41 6C 69 63 65]  (5 bytes = "Alice")
[score: 64 00 00 00 00 00 00 00]  (8 bytes, little-endian = 100)
[is_active: 01]  (1 byte = true)
```

You rarely need to think about this directly, but it's good to know when debugging or when you see "account data too small" errors.

---

**Key Takeaways**
- Borsh is the serialization format for converting Rust structs to/from bytes
- Anchor's `#[account]` macro handles serialization automatically
- You must calculate space manually when creating accounts: `8 + field sizes`
- Strings and Vecs add 4 bytes for length prefix + the actual data
- Always add the 8-byte discriminator to your space calculation

**Next:** [08-common-compiler-errors.md](./08-common-compiler-errors.md)
