# PWA and Mobile Wallet Deep Links

## The Mobile Challenge

On desktop, wallet extensions (Phantom browser extension) inject into the page. On mobile, wallets are separate apps. The connection works differently.

## Progressive Web App (PWA)

A PWA makes your web app installable on mobile devices:

```json
// public/manifest.json
{
    "name": "My Solana App",
    "short_name": "SolApp",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#000000",
    "theme_color": "#9945FF",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

Add to your layout's `<head>`:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#9945FF" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

## Mobile Wallet Deep Links

When a mobile user taps "Connect Wallet," the app opens the wallet app via a deep link:

- **Phantom:** `https://phantom.app/ul/browse/{YOUR_URL}`
- **Solflare:** `https://solflare.com/ul/browse/{YOUR_URL}`

The wallet adapter handles this automatically. When `WalletMultiButton` is clicked on mobile:

1. If Phantom is installed, it opens Phantom's in-app browser with your URL
2. The user approves the connection
3. Your app receives the wallet public key
4. Transactions are signed in the wallet app

## Making It Work

The wallet adapter's mobile detection and deep linking work out of the box if you:

1. Use `WalletProvider` with the wallet adapters
2. Set `autoConnect={true}` to reconnect returning users
3. Test on actual mobile devices (not just browser dev tools)

```typescript
const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
], []);

<WalletProvider wallets={wallets} autoConnect>
```

## Testing on Mobile

1. Deploy your app to a URL (Vercel, Netlify, etc.)
2. Open on your phone
3. Tap "Connect Wallet"
4. If Phantom is installed, it should open automatically
5. Approve the connection
6. Return to your app -- wallet should be connected

## Tips for Mobile UX

- Keep transaction approvals minimal (batch when possible)
- Show clear loading states (mobile users are impatient)
- Handle the case where the wallet app isn't installed (show download link)
- Test on both iOS and Android
- Use responsive design -- wallet adapter UI components are responsive by default

---

**Key Takeaways**
- PWA makes your web app installable on mobile
- Wallet adapter handles mobile deep links automatically
- Phantom, Solflare, and Backpack all support mobile deep linking
- Test on real devices -- mobile wallet behavior differs from desktop extensions
- `autoConnect` remembers returning users

**Next:** [06-lab-frontend-app.md](./06-lab-frontend-app.md)
