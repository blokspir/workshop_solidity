# Sending Transactions from the Frontend

## The Flow

```
1. Build the transaction (instructions + accounts)
2. Wallet signs the transaction (user clicks "Approve" in Phantom/etc.)
3. Transaction is sent to the network
4. Wait for confirmation
5. Update UI
```

## Using Anchor's Program Methods

The cleanest way to send transactions:

```typescript
"use client";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export function MintButton() {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMint = async () => {
        if (!wallet) return;
        setLoading(true);
        setError(null);

        try {
            const provider = new AnchorProvider(connection, wallet, {
                commitment: "confirmed",
            });
            const program = new Program(idl, PROGRAM_ID, provider);

            const [nftPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("nft"), wallet.publicKey.toBuffer(), new BN(1).toArrayLike(Buffer, "le", 8)],
                program.programId
            );

            const txSignature = await program.methods
                .mintNft("My NFT #1", "https://arweave.net/metadata.json")
                .accounts({
                    authority: wallet.publicKey,
                    nft: nftPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log("Transaction:", txSignature);
            // Show success to user
        } catch (err: any) {
            console.error("Transaction failed:", err);
            setError(err.message || "Transaction failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleMint} disabled={loading || !wallet}>
                {loading ? "Minting..." : "Mint NFT"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
```

## Using sendTransaction (Lower Level)

For non-Anchor transactions or when you need more control:

```typescript
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

export function SendSolButton({ recipient }: { recipient: string }) {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const handleSend = async () => {
        if (!publicKey) return;

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(recipient),
                lamports: 0.01 * LAMPORTS_PER_SOL,
            })
        );

        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "confirmed");
        console.log("Sent:", signature);
    };

    return <button onClick={handleSend}>Send 0.01 SOL</button>;
}
```

## Error Handling Patterns

```typescript
try {
    const tx = await program.methods.someInstruction().accounts({...}).rpc();
} catch (err: any) {
    if (err.code === 4001) {
        // User rejected the transaction in wallet
        setError("Transaction cancelled by user");
    } else if (err.error?.errorCode) {
        // Anchor program error
        setError(`Program error: ${err.error.errorMessage}`);
    } else if (err.message?.includes("insufficient funds")) {
        setError("Not enough SOL for this transaction");
    } else {
        setError("Transaction failed. Please try again.");
    }
}
```

## Transaction Confirmation UI

Show the user what's happening:

```typescript
const [status, setStatus] = useState<"idle" | "signing" | "confirming" | "success" | "error">("idle");

const handleAction = async () => {
    setStatus("signing");
    try {
        const tx = await program.methods.doSomething().accounts({...}).rpc();
        setStatus("confirming");
        await connection.confirmTransaction(tx, "confirmed");
        setStatus("success");
    } catch {
        setStatus("error");
    }
};
```

---

**Key Takeaways**
- `program.methods.instruction().accounts({}).rpc()` is the standard pattern
- The wallet handles signing -- user sees a popup in Phantom/Solflare
- Always wrap transactions in try/catch with loading and error states
- Show transaction status to the user: signing → confirming → success/error
- Handle wallet rejection (code 4001) separately from program errors

**Next:** [04-reading-onchain-data.md](./04-reading-onchain-data.md)
