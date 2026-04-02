# Exercise 4: Full-Stack Minting App

**Modules:** 05, 06, 09
**Time:** 90-120 minutes

## Requirements

Build a Next.js app that lets users connect their wallet and mint NFTs from a collection.

### Features

1. **Wallet Connect** -- Phantom and Solflare support
2. **Collection Display** -- show the collection name and total minted count
3. **Mint Button** -- mint a new NFT (uploads metadata to Arweave, then mints)
4. **My NFTs** -- display the user's NFTs from this collection
5. **Loading and Error States** -- proper UX for all async operations

### Tech Stack

- Next.js 14+ (App Router)
- `@solana/wallet-adapter-react`
- `@metaplex-foundation/umi` + `mpl-core`
- `@metaplex-foundation/umi-uploader-irys`
- Tailwind CSS for styling

## Deliverables

A working Next.js app with:

1. `/` -- home page with wallet connect and mint UI
2. Wallet connection with `WalletMultiButton`
3. A form to enter NFT name and upload an image
4. Mint button that: uploads image → uploads metadata → mints NFT
5. Gallery showing the user's NFTs from the collection
6. Proper error handling and loading states

## Hints

<details>
<summary>Hint 1: Umi with Wallet Adapter</summary>

```typescript
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";

const wallet = useWallet();
const umi = createUmi(endpoint)
    .use(mplCore())
    .use(irysUploader())
    .use(walletAdapterIdentity(wallet));
```

</details>

<details>
<summary>Hint 2: File Upload</summary>

Use an HTML file input and FileReader to get the image buffer:

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => setImageBuffer(Buffer.from(reader.result as ArrayBuffer));
        reader.readAsArrayBuffer(file);
    }
};
```

</details>

<details>
<summary>Hint 3: Fetching User's NFTs</summary>

```typescript
import { fetchAssetsByOwner } from "@metaplex-foundation/mpl-core";

const assets = await fetchAssetsByOwner(umi, owner);
const collectionNfts = assets.filter(a => a.updateAuthority.address === collectionAddress);
```

</details>

## Self-Check

- [ ] Wallet connects and disconnects properly
- [ ] Mint button is disabled when wallet is not connected
- [ ] Image uploads to Arweave and returns a valid URI
- [ ] NFT appears in the user's gallery after minting
- [ ] Error messages are shown for failures (insufficient SOL, etc.)
- [ ] Loading spinners during upload and mint
- [ ] App works with Phantom on devnet

## Solution Outline

```
src/
├── app/
│   ├── layout.tsx         → Providers (wallet, connection)
│   └── page.tsx           → Main page
├── components/
│   ├── providers.tsx      → WalletProvider + ConnectionProvider
│   ├── mint-form.tsx      → Image upload + name input + mint button
│   ├── nft-gallery.tsx    → Display user's NFTs
│   └── wallet-info.tsx    → Address and balance display
└── hooks/
    └── use-umi.ts         → Umi instance with wallet adapter

Flow:
1. User connects wallet
2. User enters NFT name and selects image
3. Click "Mint":
   a. Upload image to Arweave via Irys
   b. Create metadata JSON with image URI
   c. Upload metadata to Arweave
   d. Call mpl-core create() with metadata URI
4. Refresh gallery to show new NFT
```
