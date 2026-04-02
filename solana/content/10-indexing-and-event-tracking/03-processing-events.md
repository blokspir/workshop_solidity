# Processing Webhook Events

## Webhook Endpoint

Create an Express.js endpoint to receive webhook data:

```typescript
import express from "express";

const app = express();
app.use(express.json());

app.post("/api/webhook", async (req, res) => {
    try {
        const events = req.body; // Array of enhanced transactions

        for (const event of events) {
            await processEvent(event);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ error: "Processing failed" });
    }
});

app.listen(3002, () => console.log("Webhook listener running on port 3002"));
```

## Processing Different Event Types

```typescript
async function processEvent(event: any) {
    const { type, signature, timestamp, tokenTransfers, nativeTransfers } = event;

    switch (type) {
        case "TRANSFER":
            await handleTransfer(event);
            break;
        case "NFT_MINT":
            await handleNftMint(event);
            break;
        case "BURN":
            await handleBurn(event);
            break;
        default:
            // Check if it's a program-specific transaction
            await handleProgramTransaction(event);
    }
}

async function handleTransfer(event: any) {
    for (const transfer of event.tokenTransfers) {
        await db.tokenTransfer.create({
            data: {
                signature: event.signature,
                from: transfer.fromUserAccount,
                to: transfer.toUserAccount,
                amount: transfer.tokenAmount,
                mint: transfer.mint,
                timestamp: new Date(event.timestamp * 1000),
            },
        });
    }
}

async function handleNftMint(event: any) {
    // Extract mint info from the transaction
    const nftMint = event.tokenTransfers.find(
        (t: any) => t.tokenStandard === "NonFungible"
    );

    if (nftMint) {
        await db.nftActivity.create({
            data: {
                type: "MINT",
                signature: event.signature,
                minter: event.feePayer,
                mint: nftMint.mint,
                timestamp: new Date(event.timestamp * 1000),
            },
        });
    }
}
```

## Storing in a Database

Using Prisma with PostgreSQL:

```prisma
// prisma/schema.prisma
model TokenTransfer {
    id        Int      @id @default(autoincrement())
    signature String   @unique
    from      String
    to        String
    amount    Float
    mint      String
    timestamp DateTime
    createdAt DateTime @default(now())

    @@index([from])
    @@index([to])
    @@index([mint])
    @@index([timestamp])
}

model NftActivity {
    id        Int      @id @default(autoincrement())
    type      String   // MINT, TRANSFER, BURN, LIST, SALE
    signature String   @unique
    actor     String   // who performed the action
    mint      String
    price     Float?
    timestamp DateTime
    createdAt DateTime @default(now())

    @@index([actor])
    @@index([mint])
    @@index([type])
    @@index([timestamp])
}

model StakeActivity {
    id        Int      @id @default(autoincrement())
    type      String   // DEPOSIT, WITHDRAW, CLAIM
    signature String   @unique
    user      String
    amount    Float
    timestamp DateTime
    createdAt DateTime @default(now())

    @@index([user])
    @@index([type])
}
```

## Querying for the Frontend

```typescript
// API route: GET /api/activity?page=1&limit=20
app.get("/api/activity", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const activities = await db.nftActivity.findMany({
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });

    res.json({ data: activities, page, limit });
});

// API route: GET /api/user/:address/activity
app.get("/api/user/:address/activity", async (req, res) => {
    const activities = await db.nftActivity.findMany({
        where: { actor: req.params.address },
        orderBy: { timestamp: "desc" },
        take: 50,
    });

    res.json({ data: activities });
});
```

## Idempotency

Webhooks can be delivered more than once. Use the transaction `signature` as a unique key to prevent duplicate processing:

```typescript
try {
    await db.tokenTransfer.create({ data: { signature: event.signature, ... } });
} catch (error) {
    if (error.code === "P2002") {
        // Duplicate -- already processed, skip
        return;
    }
    throw error;
}
```

---

**Key Takeaways**
- Create an Express endpoint to receive webhook POST requests
- Route events by type (TRANSFER, NFT_MINT, BURN, etc.)
- Store events in PostgreSQL with Prisma for fast querying
- Index commonly queried fields (user address, mint, timestamp)
- Use transaction signature as unique key for idempotency

**Next:** [04-lab-webhook-listener.md](./04-lab-webhook-listener.md)
