# Module 10: Indexing and Event Tracking

**Estimated Time:** 2-3 hours
**Prerequisites:** Module 03 (Anchor events), Module 09 (frontend basics)

## Overview

Querying the Solana blockchain directly for every UI update is slow and expensive. Indexers listen for on-chain events and sync them to a database, enabling fast queries and real-time feeds.

## Learning Objectives

By the end of this module, you will be able to:

1. Explain why indexing is necessary for production apps
2. Set up Helius webhooks to listen for on-chain events
3. Process webhook payloads and extract relevant data
4. Sync on-chain events to a PostgreSQL database
5. Build real-time activity feeds

## Contents

| File | Topic |
|------|-------|
| [01-why-indexing.md](./01-why-indexing.md) | The problem and how indexing solves it |
| [02-helius-webhooks.md](./02-helius-webhooks.md) | Setting up Helius for event tracking |
| [03-processing-events.md](./03-processing-events.md) | Handling webhook payloads |
| [04-lab-webhook-listener.md](./04-lab-webhook-listener.md) | Build a webhook listener |
