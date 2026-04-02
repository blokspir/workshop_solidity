# Wallet Adapter Setup

`@solana/wallet-adapter` is the standard library for connecting Solana wallets in React apps.

## Installation

```bash
npm install @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-react-ui \
    @solana/wallet-adapter-wallets \
    @solana/web3.js
```

## Provider Setup (Next.js App Router)

Create a providers component. Since wallet adapter uses browser APIs, it must be a client component:

```typescript
// src/components/providers/wallet-provider.tsx
"use client";

import { useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProviders({ children }: { children: React.ReactNode }) {
    const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new BackpackWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
```

Wrap your app layout:

```typescript
// src/app/layout.tsx
import { SolanaProviders } from "@/components/providers/wallet-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <SolanaProviders>
                    {children}
                </SolanaProviders>
            </body>
        </html>
    );
}
```

## Connect Button

The library provides a ready-made connect button:

```typescript
"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Navbar() {
    return (
        <nav>
            <h1>My Solana App</h1>
            <WalletMultiButton />
        </nav>
    );
}
```

This button:
- Shows "Select Wallet" when not connected
- Opens a modal with available wallets (Phantom, Solflare, Backpack)
- Shows the connected address and balance when connected
- Has a disconnect option

## Using the Wallet in Components

```typescript
"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export function WalletInfo() {
    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then((bal) => {
                setBalance(bal / LAMPORTS_PER_SOL);
            });
        }
    }, [publicKey, connection]);

    if (!connected) {
        return <p>Please connect your wallet.</p>;
    }

    return (
        <div>
            <p>Address: {publicKey?.toString()}</p>
            <p>Balance: {balance.toFixed(4)} SOL</p>
        </div>
    );
}
```

## Key Hooks

| Hook | Returns | Use For |
|------|---------|--------|
| `useWallet()` | `publicKey`, `connected`, `sendTransaction`, `signTransaction` | Wallet state and actions |
| `useConnection()` | `connection` | RPC connection to Solana |
| `useAnchorWallet()` | Anchor-compatible wallet object | Passing to Anchor's Provider |

## Setting Up Anchor in the Frontend

To call your Anchor programs from the frontend:

```typescript
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../target/idl/my_program.json";

const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");

export function useProgram() {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();

    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    return new Program(idl as any, PROGRAM_ID, provider);
}
```

Then use it in components:

```typescript
const program = useProgram();

const handleMint = async () => {
    if (!program) return;

    await program.methods
        .mintNft("My NFT", "https://arweave.net/...")
        .accounts({ /* ... */ })
        .rpc();
};
```

---

**Key Takeaways**
- Wrap your app with `ConnectionProvider`, `WalletProvider`, `WalletModalProvider`
- `WalletMultiButton` provides a complete connect/disconnect UI
- `useWallet()` gives you the connected wallet's public key and signing methods
- Use `useAnchorWallet()` + `AnchorProvider` to call Anchor programs from the frontend
- Support Phantom, Backpack, and Solflare for Southeast Asian users

**Next:** [03-sending-transactions.md](./03-sending-transactions.md)
