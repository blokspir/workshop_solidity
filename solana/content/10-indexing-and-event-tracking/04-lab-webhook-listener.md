# Lab: Build a Webhook Listener

Build a simple Express server that receives Helius webhook events and logs them.

## Setup

```bash
mkdir webhook-lab && cd webhook-lab
npm init -y
npm install express
npm install -D typescript ts-node @types/express @types/node
npx tsc --init
```

## The Server

Create `server.ts`:

```typescript
import express from "express";

const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Webhook endpoint
app.post("/webhook", (req, res) => {
    const events = req.body;
    console.log(`\n--- Received ${events.length} event(s) ---`);

    for (const event of events) {
        console.log(`Type: ${event.type}`);
        console.log(`Signature: ${event.signature}`);
        console.log(`Fee Payer: ${event.feePayer}`);
        console.log(`Timestamp: ${new Date(event.timestamp * 1000).toISOString()}`);

        if (event.tokenTransfers?.length > 0) {
            for (const transfer of event.tokenTransfers) {
                console.log(`  Token Transfer: ${transfer.fromUserAccount} → ${transfer.toUserAccount}`);
                console.log(`  Amount: ${transfer.tokenAmount} (${transfer.mint})`);
            }
        }

        if (event.nativeTransfers?.length > 0) {
            for (const transfer of event.nativeTransfers) {
                console.log(`  SOL Transfer: ${transfer.fromUserAccount} → ${transfer.toUserAccount}`);
                console.log(`  Amount: ${transfer.amount / 1e9} SOL`);
            }
        }

        console.log("---");
    }

    res.status(200).json({ received: true });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Webhook listener running on http://localhost:${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
    console.log("\nTo expose publicly, use: npx ngrok http 3002");
});
```

## Running

```bash
npx ts-node server.ts
```

## Exposing to the Internet

Helius needs to reach your server. For local development, use ngrok:

```bash
npx ngrok http 3002
```

ngrok gives you a public URL like `https://abc123.ngrok.io`. Use `https://abc123.ngrok.io/webhook` as your webhook URL in Helius.

## Creating the Webhook in Helius

Use the Helius dashboard or this script:

```typescript
// create-webhook.ts
const HELIUS_API_KEY = "your-api-key";
const WEBHOOK_URL = "https://your-ngrok-url.ngrok.io/webhook";
const PROGRAM_ID = "your-program-id";

async function createWebhook() {
    const response = await fetch(
        `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                webhookURL: WEBHOOK_URL,
                transactionTypes: ["Any"],
                accountAddresses: [PROGRAM_ID],
                webhookType: "enhanced",
            }),
        }
    );

    const result = await response.json();
    console.log("Webhook created:", result);
}

createWebhook();
```

## Testing

1. Start your server: `npx ts-node server.ts`
2. Start ngrok: `npx ngrok http 3002`
3. Create the webhook pointing to your ngrok URL
4. Interact with your program on devnet (mint, transfer, stake)
5. Watch the events appear in your server logs

## Exercise

1. Add a PostgreSQL database (or SQLite for simplicity) and store events
2. Add an API endpoint that returns the last 20 events
3. Add filtering by event type and user address
4. Add a simple HTML page that displays the activity feed
5. Handle duplicate events (idempotency with signature as unique key)

---

**Key Takeaways**
- A webhook listener is a simple Express POST endpoint
- Use ngrok for local development to expose your server to Helius
- Enhanced webhooks provide pre-parsed transaction data
- This is the foundation for building activity feeds, dashboards, and notifications

**Next:** [Module 11 - Security & Deployment](../11-security-and-deployment/)
