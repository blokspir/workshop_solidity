# Reading On-Chain Data

## Fetching Anchor Account Data

Anchor's `Program` object deserializes account data automatically:

```typescript
// Fetch a single account
const counterData = await program.account.counter.fetch(counterPda);
console.log("Count:", counterData.count.toNumber());
console.log("Authority:", counterData.authority.toString());

// Fetch all accounts of a type
const allCounters = await program.account.counter.all();
allCounters.forEach((item) => {
    console.log(item.publicKey.toString(), item.account.count.toNumber());
});

// Fetch with filter (by field value)
const myCounters = await program.account.counter.all([
    {
        memcmp: {
            offset: 8,  // skip 8-byte discriminator
            bytes: wallet.publicKey.toBase58(),
        },
    },
]);
```

## React Hook Pattern

```typescript
"use client";

import { useEffect, useState, useRef } from "react";

interface StakeInfo {
    stakedAmount: number;
    pendingRewards: number;
    stakedAt: Date;
}

export function useStakeInfo(program: Program | null, userPublicKey: PublicKey | null) {
    const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        if (!program || !userPublicKey || loadedRef.current) return;

        const load = async () => {
            setLoading(true);
            loadedRef.current = true;
            try {
                const [stakePda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("user_stake"), poolKey.toBuffer(), userPublicKey.toBuffer()],
                    program.programId
                );

                const data = await program.account.userStake.fetch(stakePda);
                setStakeInfo({
                    stakedAmount: data.stakedAmount.toNumber() / 1e9,
                    pendingRewards: calculatePending(data),
                    stakedAt: new Date(data.stakedAt.toNumber() * 1000),
                });
            } catch (err) {
                // Account might not exist (user hasn't staked)
                setStakeInfo(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [program, userPublicKey]);

    return { stakeInfo, loading, error };
}
```

## Token Balances

```typescript
import { getAssociatedTokenAddressSync, getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export async function getTokenBalance(
    connection: Connection,
    wallet: PublicKey,
    mint: PublicKey,
): Promise<number> {
    const ata = getAssociatedTokenAddressSync(mint, wallet, false, TOKEN_2022_PROGRAM_ID);

    try {
        const account = await getAccount(connection, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
        return Number(account.amount) / 1e9;  // assuming 9 decimals
    } catch {
        return 0;  // ATA doesn't exist = 0 balance
    }
}
```

## Real-Time Updates with WebSocket

Subscribe to account changes for live updates:

```typescript
useEffect(() => {
    if (!publicKey || !connection) return;

    const subscriptionId = connection.onAccountChange(
        accountToWatch,
        (accountInfo) => {
            // Re-deserialize and update state
            const decoded = program.coder.accounts.decode("Counter", accountInfo.data);
            setCount(decoded.count.toNumber());
        },
        "confirmed"
    );

    return () => {
        connection.removeAccountChangeListener(subscriptionId);
    };
}, [publicKey, connection]);
```

## Displaying Data

```typescript
export function StakingDashboard() {
    const wallet = useAnchorWallet();
    const program = useProgram();
    const { stakeInfo, loading } = useStakeInfo(program, wallet?.publicKey ?? null);

    if (!wallet) return <p>Connect your wallet to view staking info.</p>;
    if (loading) return <p>Loading...</p>;
    if (!stakeInfo) return <p>You haven't staked any tokens yet.</p>;

    return (
        <div>
            <h2>Your Stake</h2>
            <p>Staked: {stakeInfo.stakedAmount.toLocaleString()} tokens</p>
            <p>Pending Rewards: {stakeInfo.pendingRewards.toFixed(4)} tokens</p>
            <p>Staked since: {stakeInfo.stakedAt.toLocaleDateString()}</p>
            <button>Claim Rewards</button>
            <button>Withdraw</button>
        </div>
    );
}
```

---

**Key Takeaways**
- `program.account.typeName.fetch(key)` deserializes account data automatically
- Use `memcmp` filters to find accounts by field values (e.g., all accounts for a specific user)
- Wrap data fetching in React hooks with loading/error states
- Use `connection.onAccountChange` for real-time updates
- Always handle the case where an account doesn't exist

**Next:** [05-pwa-and-mobile.md](./05-pwa-and-mobile.md)
