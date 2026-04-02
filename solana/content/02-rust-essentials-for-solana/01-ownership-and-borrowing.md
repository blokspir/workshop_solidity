# Ownership and Borrowing

This is the single most important concept in Rust. If you come from JavaScript/TypeScript, this will feel foreign at first. Stick with it -- once it clicks, everything else falls into place.

## The Problem Ownership Solves

In JavaScript, you can pass data around freely:

```typescript
let name = "Alice";
let greeting = name;  // both `name` and `greeting` point to "Alice"
console.log(name);    // still works
```

This simplicity comes at a cost: JavaScript uses a garbage collector to clean up memory, which adds unpredictability and overhead. Rust eliminates the garbage collector entirely by using ownership rules enforced at compile time.

## The Three Rules of Ownership

1. Every value in Rust has exactly **one owner**
2. When the owner goes out of scope, the value is **dropped** (freed)
3. Ownership can be **moved** to another variable, but then the original can't use it

```rust
let name = String::from("Alice");
let greeting = name;       // ownership MOVES to `greeting`
// println!("{}", name);   // ERROR: `name` no longer owns the data
println!("{}", greeting);  // works fine
```

This is the big surprise for JS developers: assigning a variable can invalidate the original.

## Borrowing: References

Moving ownership every time is impractical. **Borrowing** lets you use data without taking ownership:

```rust
let name = String::from("Alice");
let length = calculate_length(&name);  // borrow with &
println!("{} has {} chars", name, length);  // name still valid!

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

The `&` creates a **reference** -- a pointer to the data without taking ownership. The original variable remains valid.

## Mutable vs Immutable References

By default, references are **immutable** (read-only):

```rust
fn try_change(s: &String) {
    // s.push_str(" World");  // ERROR: cannot modify through immutable reference
}
```

To modify borrowed data, use a **mutable reference** `&mut`:

```rust
fn change(s: &mut String) {
    s.push_str(" World");  // OK
}

let mut name = String::from("Hello");
change(&mut name);
```

Key restriction: you can have **either** one mutable reference **or** any number of immutable references, but not both at the same time. This prevents data races.

## How This Shows Up in Solana

In Anchor programs, you'll see ownership and borrowing constantly:

```rust
pub fn create_note(ctx: Context<CreateNote>, content: String) -> Result<()> {
    let note = &mut ctx.accounts.note;  // mutable borrow of the note account
    note.author = ctx.accounts.author.key();  // reading author's public key
    note.content = content;  // moving the content String into the note
    Ok(())
}
```

- `&mut ctx.accounts.note` -- mutable borrow (we're writing to the account)
- `ctx.accounts.author.key()` -- immutable access (just reading)
- `content` -- ownership moves into the note's content field

## Copy Types

Some simple types (integers, booleans, floats) implement `Copy`, meaning they're duplicated instead of moved:

```rust
let x: u64 = 42;
let y = x;      // x is COPIED, not moved
println!("{}", x);  // still works!
```

Types that are `Copy`: `u8`, `u16`, `u32`, `u64`, `i8`, `i16`, `i32`, `i64`, `f32`, `f64`, `bool`, `char`

Types that are NOT `Copy` (they move): `String`, `Vec<T>`, `Box<T>`, custom structs (by default)

## The Practical Rule

When writing Solana programs:
- Use `&` when you need to read data
- Use `&mut` when you need to write data
- Use `.clone()` if you need a copy of non-Copy data (use sparingly)
- Let the compiler guide you -- its error messages are excellent

---

**Key Takeaways**
- Every value has one owner. Assignment moves ownership (for non-Copy types).
- Use `&` to borrow (read), `&mut` to mutably borrow (write)
- You can't have `&mut` and `&` at the same time
- Integers and booleans are `Copy` (they don't move)
- The Rust compiler's error messages tell you exactly what's wrong

**Next:** [02-structs-and-enums.md](./02-structs-and-enums.md)
