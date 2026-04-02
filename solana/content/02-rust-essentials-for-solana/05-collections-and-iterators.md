# Collections and Iterators

Rust collections are similar to JavaScript arrays and objects, with explicit typing.

## Vec (Vector)

A `Vec<T>` is a growable array, like JavaScript's `Array`:

```rust
// Create
let mut numbers: Vec<u64> = Vec::new();
let mut names = vec!["Alice", "Bob", "Charlie"];  // vec! macro shorthand

// Add
numbers.push(42);
numbers.push(99);

// Access
let first = numbers[0];       // panics if out of bounds
let first = numbers.get(0);   // returns Option<&u64> (safe)

// Length
println!("Count: {}", numbers.len());

// Iterate
for num in &numbers {
    println!("{}", num);
}
```

### Vec in Solana

Vectors are used for variable-length data in accounts, but use them carefully -- account space is fixed at creation, so you need to pre-allocate:

```rust
#[account]
pub struct TodoList {
    pub owner: Pubkey,
    pub items: Vec<String>,   // variable length
    pub max_items: u8,
}
```

## HashMap

A `HashMap<K, V>` is like JavaScript's `Map` or plain object:

```rust
use std::collections::HashMap;

let mut scores: HashMap<String, u64> = HashMap::new();
scores.insert(String::from("Alice"), 100);
scores.insert(String::from("Bob"), 85);

// Access
if let Some(score) = scores.get("Alice") {
    println!("Alice: {}", score);
}

// Iterate
for (name, score) in &scores {
    println!("{}: {}", name, score);
}
```

HashMaps are rarely used in Solana programs because on-chain data is stored in accounts (not in-memory maps). You'll use them in tests and client code.

## Iterators

Rust iterators are like JavaScript's array methods (map, filter, reduce):

```rust
let numbers = vec![1, 2, 3, 4, 5];

// Map
let doubled: Vec<u64> = numbers.iter().map(|n| n * 2).collect();

// Filter
let evens: Vec<&u64> = numbers.iter().filter(|n| *n % 2 == 0).collect();

// Sum (like reduce)
let total: u64 = numbers.iter().sum();

// Find
let first_even = numbers.iter().find(|n| *n % 2 == 0);  // Option<&u64>

// Chaining
let result: u64 = numbers
    .iter()
    .filter(|n| *n > 2)
    .map(|n| n * 10)
    .sum();
```

### Closures

The `|n|` syntax is a closure (anonymous function), equivalent to TypeScript's `(n) =>`:

```typescript
// TypeScript
const doubled = numbers.map(n => n * 2);
```

```rust
// Rust
let doubled: Vec<u64> = numbers.iter().map(|n| n * 2).collect();
```

The `.collect()` at the end converts the iterator back into a collection.

## Slices

A slice is a reference to a contiguous sequence of elements. You'll encounter these when working with byte data:

```rust
let data = vec![1, 2, 3, 4, 5];
let slice = &data[1..3];  // [2, 3] -- borrowed, not copied

// String slices
let full = String::from("Hello World");
let hello = &full[0..5];  // "Hello"
```

In Solana, you'll see slices when working with account data bytes and seeds:

```rust
seeds = [b"prefix", user.key().as_ref()]  // as_ref() returns a byte slice
```

---

**Key Takeaways**
- `Vec<T>` is Rust's growable array (like JS Array)
- `HashMap<K, V>` is Rust's key-value map (like JS Map)
- Iterator methods (`.map()`, `.filter()`, `.sum()`) work like JS array methods
- Closures use `|args|` syntax instead of `(args) =>`
- `.collect()` converts an iterator back into a collection
- Slices (`&[T]`) are borrowed views into data -- common in Solana for byte operations

**Next:** [06-macros.md](./06-macros.md)
