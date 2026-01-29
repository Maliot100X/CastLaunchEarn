# 🚀 CastLaunchEarn

<div align="center">

![CastLaunchEarn Hero](public/hero.png)

**The Ultimate Farcaster Mini App for Creating & Trading Coins on Base**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Maliot100X/CastLaunchEarn)
[![Farcaster](https://img.shields.io/badge/Farcaster-Mini%20App-purple)](https://www.farcaster.xyz/)
[![Base](https://img.shields.io/badge/Base-Mainnet-blue)](https://base.org/)
[![Zora](https://img.shields.io/badge/Zora-Coins%20SDK-green)](https://zora.co/)

</div>

---

## ✨ Features

### 🏠 **Home - Discover Coins**
- **New Coins** - Freshly minted coins on Base
- **Trending** - Top volume 24h coins
- **🔥 King of Hill** - Boosted coins with premium visibility
- Real-time data with 5-minute auto-refresh

### 🎨 **Create - Launch Your Token**
- **AI-Powered Generation** - One click to generate name, ticker, description
- **Image Upload** - Upload to IPFS via Pinata
- **Zora SDK Deployment** - Real on-chain coin creation
- **Share to Farcaster** - Cast your new coin instantly

### 🏆 **Leaderboard - Compete & Win**
- Top 3 weekly prizes: **$50 • $25 • Free Boost**
- Scoring system:
  - Create coin: +10 pts
  - Trading volume: +1 pt per $10
  - Per holder: +2 pts
  - Cast share: +5 pts
- Weekly/Monthly rankings

### 🛒 **Shop - Boost Your Coin**
| Tier | Price | Duration | Effect |
|------|-------|----------|--------|
| ⚡ Basic | $1 | 10 min | Featured in Boosted tab |
| ⭐ Super | $3 | 25 min | Featured + highlighted |
| 🔥 Hyper | $6 | 60 min | Push notification to all users |

### 👤 **Profile - Your Dashboard**
- Farcaster profile sync (FID, username, PFP)
- Wallet connect/disconnect (MetaMask compatible)
- My Coins created
- My Holdings
- Stats & ranking

### ⚙️ **More - Premium & Settings**
- **Subscription**: $15/month or $1 trial (7 days)
  - Special ⭐ badge
  - 1 free boost/month
  - Priority support
- Platform stats
- Help & FAQ

### 🤖 **AI Bot - Your Assistant**
- Floating chat button on every page
- Generate coin ideas
- Calculate stats
- Draft casts
- Platform guidance

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Wallet | wagmi + @farcaster/miniapp-wagmi-connector |
| Farcaster | @farcaster/miniapp-sdk |
| Coins | @zoralabs/coins-sdk |
| Database | Supabase (PostgreSQL) |
| Storage | Pinata (IPFS) |
| AI | Multi-provider fallback (3 APIs) |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Maliot100X/CastLaunchEarn.git
cd CastLaunchEarn
npm install
```

### 2. Environment Setup
Copy `.env.local.example` to `.env.local` and fill in your API keys.

### 3. Database Setup
Run the SQL migration in your [Supabase SQL Editor](https://supabase.com/dashboard):
```sql
-- Copy contents from supabase/migrations/001_initial_schema.sql
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Farcaster Mini App Setup

1. Deploy to Vercel
2. Update `public/.well-known/farcaster.json` with your domain
3. Register your Mini App in Warpcast
4. Test in Warpcast mobile app

---

## 📁 Project Structure

```
CastLaunchEarn/
├── src/
│   ├── app/                    # 6 tab pages
│   │   ├── page.tsx            # Home
│   │   ├── create/             # Create coin
│   │   ├── leaderboard/        # Rankings
│   │   ├── shop/               # Boosts
│   │   ├── profile/            # User profile
│   │   ├── more/               # Settings
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── BottomNav.tsx       # Tab navigation
│   │   ├── CoinCard.tsx        # Coin display
│   │   └── AIBot.tsx           # Chat popup
│   ├── providers/
│   │   ├── MiniAppContext.tsx  # Farcaster SDK
│   │   └── Providers.tsx       # wagmi + react-query
│   └── lib/
│       ├── coins.ts            # Zora SDK wrapper
│       ├── coinQueries.ts      # Market queries
│       ├── ai.ts               # AI service
│       ├── supabase.ts         # Database
│       └── pinata.ts           # IPFS uploads
├── public/
│   ├── icon.png                # App icon
│   ├── hero.png                # Hero image
│   ├── splash.png              # Splash screen
│   └── .well-known/
│       └── farcaster.json      # Mini App config
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## 🔒 Security Notes

- `.env.local` is gitignored - **never commit API keys**
- Users pay their own gas fees for coin creation
- Platform does not hold user funds
- All transactions are on-chain and transparent

---

## 📄 License

MIT License - build something awesome! 🚀

---

## 🤝 Credits

Built with:
- [Zora Coins SDK](https://github.com/ourzora/coins-sdk)
- [Farcaster Mini App SDK](https://github.com/farcasterxyz/miniapp-sdk)
- [Base Blockchain](https://base.org/)
- Inspiration from [base-app-coins](https://github.com/base/demos), [quizdrop](https://github.com/aeither/quizdrop), [farcaster-miniapp](https://github.com/XerxesCoder/farcaster-miniapp)

---

<div align="center">

**Built with ❤️ on Base**

[Farcaster](https://www.farcaster.xyz/) • [Zora](https://zora.co/) • [Base](https://base.org/)

</div>
