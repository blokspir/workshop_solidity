# VS Code Extensions

The right editor extensions make Solana development significantly smoother. Here are the ones you should install.

## Required Extensions

### rust-analyzer

The essential Rust extension. Provides autocompletion, inline errors, type hints, and go-to-definition for Rust code.

```
Extension ID: rust-lang.rust-analyzer
```

Install from VS Code: `Ctrl+Shift+X` → search "rust-analyzer" → Install

### Better TOML

Anchor uses `Anchor.toml` and `Cargo.toml` configuration files. This extension adds syntax highlighting for them.

```
Extension ID: bungcip.better-toml
```

## Recommended Extensions

### Error Lens

Shows error messages inline next to the problematic code. Extremely helpful when learning Rust, where compiler errors are frequent and informative.

```
Extension ID: usernamehw.errorlens
```

### Solana Explorer (optional)

Quickly look up accounts and transactions from within VS Code.

## VS Code Settings for Rust

Add these to your VS Code `settings.json` for a better Rust experience:

```json
{
  "rust-analyzer.check.command": "clippy",
  "editor.formatOnSave": true,
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

This enables:
- **Clippy** -- a linter that catches common Rust mistakes (runs on every save)
- **Format on save** -- automatically formats your Rust code with rustfmt

---

**Key Takeaways**
- rust-analyzer is the one essential extension for Rust development
- Error Lens helps you read Rust compiler errors inline, which is critical while learning
- Format on save keeps your code consistent

**Next:** [06-devnet-wallet.md](./06-devnet-wallet.md) -- Create a wallet and get test SOL
