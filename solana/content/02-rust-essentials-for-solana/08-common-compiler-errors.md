# Common Rust Compiler Errors

The Rust compiler is famously helpful. Its error messages tell you exactly what's wrong and often suggest the fix. Here are the errors you'll encounter most in Solana development.

## E0382: Use of Moved Value

```
error[E0382]: borrow of moved value: `name`
  --> src/main.rs:4:20
   |
3  |     let greeting = name;
   |                    ---- value moved here
4  |     println!("{}", name);
   |                    ^^^^ value borrowed here after move
```

**What happened:** Ownership moved to `greeting`, so `name` is no longer valid.

**Fix:** Use a reference (`&name`), clone (`.clone()`), or restructure to avoid the move.

## E0502: Cannot Borrow as Mutable and Immutable

```
error[E0502]: cannot borrow `data` as mutable because it is also borrowed as immutable
```

**What happened:** You have an immutable reference and tried to create a mutable one at the same time.

**Fix:** Restructure so the immutable borrow ends before the mutable one starts:

```rust
// Bad
let first = &data[0];
data.push(4);          // mutable borrow while `first` exists
println!("{}", first);

// Good
let first = data[0];   // copy the value instead of borrowing
data.push(4);
println!("{}", first);
```

## E0308: Mismatched Types

```
error[E0308]: mismatched types
  expected `u64`, found `i64`
```

**What happened:** You used the wrong integer type.

**Fix:** Cast explicitly:

```rust
let x: i64 = 42;
let y: u64 = x as u64;  // explicit cast
```

Or use the right type from the start.

## E0599: Method Not Found

```
error[E0599]: no method named `len` found for type `u64`
```

**What happened:** You called a method that doesn't exist on that type.

**Fix:** Check the type and use the correct method. This often happens when you have a reference where you expect a value, or vice versa.

## E0425: Cannot Find Value

```
error[E0425]: cannot find value `amount` in this scope
```

**What happened:** Variable doesn't exist in the current scope.

**Fix:** Check spelling, check that the variable is declared in the right scope, or check imports.

## E0277: Trait Not Satisfied

```
error[E0277]: the trait bound `MyStruct: Debug` is not satisfied
```

**What happened:** You tried to use a type in a context that requires a trait it doesn't implement.

**Fix:** Add the derive:

```rust
#[derive(Debug)]  // add this
struct MyStruct { ... }
```

## "Account Data Too Small"

This is a Solana-specific runtime error (not a compiler error):

```
Error: Account data too small for instruction
```

**What happened:** The account you're writing to doesn't have enough space.

**Fix:** Increase the `space` parameter in your `#[account(init, space = ...)]` constraint. Recalculate using the size guide from the previous file.

## "Program Failed: Custom Error 0x0"

Anchor custom error codes. The `0x0`, `0x1`, etc. correspond to your `#[error_code]` enum variants (0-indexed).

**Fix:** Look at your error enum and find the variant at that index.

## Tips for Reading Rust Errors

1. **Read from the top.** The first error is usually the root cause; later errors are often cascading.
2. **Read the suggestion.** The compiler often says "help: consider borrowing..." or "try adding `&`".
3. **Look at the line numbers.** The caret `^^^` shows exactly where the problem is.
4. **One fix at a time.** Fix the first error, recompile, then fix the next. Don't try to fix everything at once.

## Exercise

Create a file called `practice.rs` and intentionally trigger each of these errors:

1. Move a `String` and then try to use the original
2. Try to push to a `Vec` while holding an immutable reference
3. Assign a `u64` to an `i64` variable without casting

Read each error message carefully. Notice how the compiler tells you exactly what to do.

---

**Key Takeaways**
- Rust error messages are your best teacher -- read them carefully
- Most errors fall into a few categories: ownership, borrowing, type mismatches
- The compiler's "help:" suggestions are usually the correct fix
- Fix one error at a time from top to bottom
- Solana-specific errors (account too small, custom errors) are runtime, not compile-time

**Next:** [Module 03 - Anchor Framework](../03-anchor-framework/)
