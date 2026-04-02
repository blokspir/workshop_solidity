# Module 02: Rust Essentials for Solana

**Estimated Time:** 3-4 hours
**Prerequisites:** Module 00 (Rust installed), any programming experience

## Overview

Solana programs are written in Rust. This module teaches you enough Rust to read, understand, and modify Anchor programs. It is NOT a comprehensive Rust course -- it focuses specifically on the patterns you'll encounter in Solana development.

The goal: when you see Anchor program code, you should understand what every line does. When you use AI to generate Rust code, you should be able to evaluate whether the output is correct.

## Learning Objectives

By the end of this module, you will:

1. Understand ownership, borrowing, and references (Rust's core concept)
2. Read and write structs, enums, and impl blocks
3. Understand traits and `#[derive(...)]`
4. Handle errors with `Result` and `Option`
5. Use pattern matching with `match`
6. Recognize macros (`#[...]`, `macro!()`)
7. Understand how Borsh serialization works
8. Interpret common Rust compiler errors

## Contents

| File | Topic |
|------|-------|
| [01-ownership-and-borrowing.md](./01-ownership-and-borrowing.md) | The #1 Rust concept |
| [02-structs-and-enums.md](./02-structs-and-enums.md) | Custom data types |
| [03-traits-and-derive.md](./03-traits-and-derive.md) | Interfaces and auto-implementation |
| [04-error-handling.md](./04-error-handling.md) | Result, Option, and the ? operator |
| [05-collections-and-iterators.md](./05-collections-and-iterators.md) | Vec, HashMap, and functional patterns |
| [06-macros.md](./06-macros.md) | Understanding #[...] and macro!() syntax |
| [07-borsh-serialization.md](./07-borsh-serialization.md) | How Solana stores data on-chain |
| [08-common-compiler-errors.md](./08-common-compiler-errors.md) | What the error messages mean |
