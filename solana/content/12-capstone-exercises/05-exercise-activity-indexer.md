# Exercise 5: Activity Indexer

**Modules:** 10
**Time:** 60-90 minutes

## Requirements

Build a webhook listener that tracks on-chain activity and provides an API for querying it.

### Features

1. **Webhook Endpoint** -- receives enhanced transaction events from Helius
2. **Event Processing** -- parses events and stores them in a database
3. **API Endpoints** -- query recent activity, filter by user/type
4. **Idempotency** -- handles duplicate webhook deliveries

### Event Types to Track

- Token transfers (who sent, who received, how much)
- NFT mints (who minted, which NFT)
- Staking events (deposit, withdraw, claim)

### Tech Stack

- Express.js with TypeScript
- SQLite (simple) or PostgreSQL (production)
- Prisma ORM

## Deliverables

1. An Express server with:
   - `POST /webhook` -- receives Helius webhook events
   - `GET /api/activity` -- returns recent activity (paginated)
   - `GET /api/activity/:address` -- returns activity for a specific wallet
   - `GET /api/stats` -- returns aggregate stats (total transfers, total minted, etc.)

2. A Prisma schema for storing events

3. Idempotent event processing (duplicate signatures are ignored)

## Hints

<details>
<summary>Hint 1: Prisma Schema</summary>

```prisma
model Activity {
    id        Int      @id @default(autoincrement())
    signature String   @unique
    type      String
    actor     String
    details   String   // JSON string for flexible data
    timestamp DateTime
    createdAt DateTime @default(now())

    @@index([actor])
    @@index([type])
    @@index([timestamp])
}
```

</details>

<details>
<summary>Hint 2: Processing Events</summary>

```typescript
for (const event of events) {
    const activity = {
        signature: event.signature,
        type: event.type,
        actor: event.feePayer,
        details: JSON.stringify({
            tokenTransfers: event.tokenTransfers,
            nativeTransfers: event.nativeTransfers,
        }),
        timestamp: new Date(event.timestamp * 1000),
    };

    try {
        await prisma.activity.create({ data: activity });
    } catch (e) {
        if (e.code === "P2002") continue; // duplicate
        throw e;
    }
}
```

</details>

<details>
<summary>Hint 3: Stats Endpoint</summary>

```typescript
app.get("/api/stats", async (req, res) => {
    const [totalEvents, byType] = await Promise.all([
        prisma.activity.count(),
        prisma.activity.groupBy({
            by: ["type"],
            _count: true,
        }),
    ]);
    res.json({ totalEvents, byType });
});
```

</details>

## Self-Check

- [ ] Webhook endpoint returns 200 for valid payloads
- [ ] Events are stored in the database with correct fields
- [ ] Duplicate events (same signature) are ignored, not rejected
- [ ] `/api/activity` returns paginated results sorted by timestamp
- [ ] `/api/activity/:address` filters correctly
- [ ] `/api/stats` returns accurate counts

## Solution Outline

```
project/
├── prisma/
│   └── schema.prisma     → Activity model
├── src/
│   ├── server.ts          → Express app setup
│   ├── routes/
│   │   ├── webhook.ts     → POST /webhook handler
│   │   └── activity.ts    → GET /api/activity, /api/stats
│   └── services/
│       └── processor.ts   → Event processing logic
└── package.json

Setup:
1. npm init, install express prisma @prisma/client
2. npx prisma init --datasource-provider sqlite
3. Define schema, npx prisma migrate dev
4. Build server with routes
5. Test locally with curl or Postman
6. (Optional) Connect to Helius webhook for live data
```

---

## Congratulations

If you've completed all five exercises, you have the skills to build a full-stack Solana application with:

- Custom tokens with advanced features (Token-2022)
- NFT minting with token-gated access
- Staking with time-based rewards
- A frontend that connects wallets and interacts with programs
- An indexer that tracks on-chain activity

These are the exact building blocks used in real production Solana projects.

**Go build something.**
