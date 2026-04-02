# Error Handling

Rust doesn't have exceptions. Instead, it uses `Result` and `Option` types to handle errors explicitly. This makes code more predictable -- no surprise try/catch needed.

## Result: Success or Error

`Result<T, E>` is an enum with two variants:

```rust
enum Result<T, E> {
    Ok(T),    // success, contains the value
    Err(E),   // error, contains error info
}
```

Compare to TypeScript where you might throw:

```typescript
// TypeScript: might throw
function divide(a: number, b: number): number {
    if (b === 0) throw new Error("divide by zero");
    return a / b;
}
```

```rust
// Rust: returns a Result
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("divide by zero"))
    } else {
        Ok(a / b)
    }
}
```

## The ? Operator

Instead of unwrapping Results manually, use `?` to propagate errors:

```rust
// Without ? (verbose)
fn process() -> Result<(), String> {
    let result = divide(10.0, 0.0);
    match result {
        Ok(value) => println!("Result: {}", value),
        Err(e) => return Err(e),
    }
    Ok(())
}

// With ? (clean)
fn process() -> Result<(), String> {
    let value = divide(10.0, 0.0)?;  // returns Err automatically if it fails
    println!("Result: {}", value);
    Ok(())
}
```

`?` means: "if this is `Err`, return the error immediately. If it's `Ok`, unwrap the value."

You'll see `?` everywhere in Anchor programs.

## Option: Value or Nothing

`Option<T>` represents a value that might not exist (Rust's replacement for `null`):

```rust
enum Option<T> {
    Some(T),   // there's a value
    None,      // no value
}
```

```rust
fn find_user(id: u64) -> Option<String> {
    if id == 1 {
        Some(String::from("Alice"))
    } else {
        None
    }
}

match find_user(1) {
    Some(name) => println!("Found: {}", name),
    None => println!("Not found"),
}
```

## How This Shows Up in Solana

Every instruction handler in Anchor returns `Result<()>`:

```rust
pub fn transfer_tokens(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    // If amount is 0, return an error
    require!(amount > 0, MyError::InvalidAmount);

    // Business logic...
    // Any operation that returns Result can use ?
    token::transfer(cpi_ctx, amount)?;

    Ok(())
}
```

### Anchor's `require!` Macro

Anchor provides `require!` as a clean way to validate conditions:

```rust
// These are equivalent:
require!(amount > 0, MyError::InvalidAmount);

if amount == 0 {
    return Err(error!(MyError::InvalidAmount));
}
```

### Custom Error Codes

```rust
#[error_code]
pub enum MyError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,

    #[msg("Not authorized to perform this action")]
    Unauthorized,

    #[msg("Account already initialized")]
    AlreadyInitialized,
}
```

These errors show up in client-side logs when a transaction fails, making debugging much easier.

## Common Patterns

### Unwrapping (Use Sparingly)

```rust
let value = some_result.unwrap();  // PANICS if Err -- don't use in programs!
let value = some_option.unwrap();  // PANICS if None -- don't use in programs!
```

`unwrap()` crashes the program if the value is Err/None. Never use it in Solana programs. Always use `?` or explicit matching.

### Default Values

```rust
let name = some_option.unwrap_or(String::from("Anonymous"));
let count = some_option.unwrap_or_default();  // uses Default trait (0 for numbers)
```

---

**Key Takeaways**
- `Result<T, E>` replaces exceptions: `Ok(value)` or `Err(error)`
- `Option<T>` replaces null: `Some(value)` or `None`
- Use `?` to propagate errors cleanly (you'll write this on almost every line that can fail)
- Anchor's `require!` macro validates conditions and returns errors
- Never use `.unwrap()` in Solana programs -- use `?` instead

**Next:** [05-collections-and-iterators.md](./05-collections-and-iterators.md)
