# Lab: Build a Frontend App

Build a Next.js app that connects a wallet, displays token balance, and sends a transaction.

## Setup

```bash
npx create-next-app@latest solana-frontend --typescript --tailwind --app --src-dir
cd solana-frontend
npm install @solana/web3.js @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/spl-token @coral-xyz/anchor
```

## Step 1: Create the Provider

Create `src/components/providers.tsx`:

```typescript
"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
    const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
```

## Step 2: Update Layout

Update `src/app/layout.tsx`:

```typescript
import { Providers } from "@/components/providers";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
```

## Step 3: Build the Page

Update `src/app/page.tsx`:

```typescript
"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function Home() {
    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then((bal) => {
                setBalance(bal / LAMPORTS_PER_SOL);
            });
        } else {
            setBalance(null);
        }
    }, [publicKey, connection]);

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Solana App</h1>
                <WalletMultiButton />
            </div>

            {connected && publicKey ? (
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                        <h2 className="font-semibold mb-2">Wallet Info</h2>
                        <p className="text-sm text-gray-600">
                            Address: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600">
                            Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h2 className="font-semibold mb-2">Actions</h2>
                        <p className="text-sm text-gray-500">
                            Add your mint, stake, and transfer buttons here.
                        </p>
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">Connect your wallet to get started.</p>
            )}
        </main>
    );
}
```

## Step 4: Run

```bash
npm run dev
```

Open http://localhost:3000, connect your Phantom wallet (make sure it's set to devnet), and you should see your balance.

## Exercise

Extend the app with:

1. A "Request Airdrop" button that airdrops 1 devnet SOL
2. A token balance display (pick a token mint and show the balance)
3. A "Mint NFT" button that calls an Anchor program
4. A staking dashboard that shows staked amount and pending rewards
5. Style it nicely with Tailwind CSS

---

**Key Takeaways**
- The full setup is: install deps → create provider → wrap layout → use hooks
- `WalletMultiButton` handles all connect/disconnect UI
- `useWallet()` and `useConnection()` are the two hooks you use everywhere
- Always check `connected` and `publicKey` before rendering wallet-dependent UI

**Next:** [Module 10 - Indexing & Event Tracking](../10-indexing-and-event-tracking/)
