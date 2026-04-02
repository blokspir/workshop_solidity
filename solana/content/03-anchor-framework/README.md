# Module 03: Anchor Framework

**Estimated Time:** 4-5 hours
**Prerequisites:** Modules 00-02 (environment, Solana concepts, Rust basics)

## Overview

Anchor is the standard framework for building Solana programs. This is the core module of the entire curriculum. By the end, you'll be able to write, test, and deploy custom programs.

## Learning Objectives

By the end of this module, you will be able to:

1. Create and structure an Anchor project
2. Write instruction handlers with proper account validation
3. Use PDAs for storing on-chain state
4. Define custom error codes and emit events
5. Perform Cross-Program Invocations (CPIs)
6. Write TypeScript tests for your programs
7. Build and deploy programs to devnet

## Contents

| File | Topic |
|------|-------|
| [01-anchor-project-structure.md](./01-anchor-project-structure.md) | Project layout and configuration |
| [02-program-basics.md](./02-program-basics.md) | declare_id!, #[program], Context |
| [03-accounts-and-constraints.md](./03-accounts-and-constraints.md) | Account types and validation |
| [04-pdas-in-anchor.md](./04-pdas-in-anchor.md) | PDA seeds, bumps, and patterns |
| [05-cross-program-invocations.md](./05-cross-program-invocations.md) | Calling other programs |
| [06-errors-and-events.md](./06-errors-and-events.md) | Custom errors and event emission |
| [07-testing-with-anchor.md](./07-testing-with-anchor.md) | TypeScript tests |
| [08-lab-counter-program.md](./08-lab-counter-program.md) | Build a counter |
| [09-lab-vault-program.md](./09-lab-vault-program.md) | Build a SOL vault |
| [10-lab-notes-program.md](./10-lab-notes-program.md) | Build a notes app |
