# Node.js and Yarn

Anchor uses TypeScript for writing tests and client-side code that interacts with your Solana programs. You likely have Node.js installed already from your web development work.

## Verify Node.js

```bash
node --version
```

You need Node.js **v18 or higher**. If you need to update, use nvm:

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install and use Node 20
nvm install 20
nvm use 20
```

## Install Yarn

Anchor projects use Yarn by default for dependency management:

```bash
npm install -g yarn
```

Verify:

```bash
yarn --version
```

## Why Yarn and Not npm?

Anchor generates projects with a `yarn.lock` file. While npm works too, using Yarn keeps things consistent with the Anchor ecosystem and its documentation.

If you strongly prefer npm, you can use it -- just replace `yarn` with `npm` in all Anchor commands and delete `yarn.lock` in favor of `package-lock.json`.

---

**Key Takeaways**
- Node.js v18+ is required for Anchor's TypeScript tests and client code
- Yarn is the default package manager for Anchor projects
- This is the same Node.js you use for React/Next.js -- no separate installation needed

**Next:** [05-vs-code-extensions.md](./05-vs-code-extensions.md) -- Editor setup
