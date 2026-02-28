# 🧠 KidCapital — Brainstorm & Feature Roadmap

> Status: **Core game loop ✅ validated** — Now brainstorming growth features.
> Last updated: 2027-02-27
>
> **Decisions made:**
> - ✅ Backend: **Supabase** (Marc already has account)
> - ✅ Monetization: **Freemium** (free base + $4.99 unlock + optional packs)
> - ✅ Distribution: **Capacitor** → Apple Store ($99/yr) + Play Store ($25 once)
> - ✅ Age targeting: **Yes** — difficulty presets by age (8-10 / 11-14)
> - ❌ Parental dashboard: Not now
> - ❌ School/classroom mode: Not now

---

## 1. 🎓 Onboarding / Tutorial — **Priority: HIGH**

**Problem**: New players (especially kids 8-14) are dropped into the game with no explanation of what passive income, assets, or financial freedom mean.

### Proposal: "Penny Teaches You" Interactive Tutorial

**Flow** (first game only, ~2 min):
1. **Welcome** — Penny introduces herself: "Hi! I'm Penny 🐷 your money coach!"
2. **Goal explanation** — "Your goal? Make your money work FOR you!"
3. **Guided first roll** — Penny highlights the Roll button with a pulsing arrow
4. **Landing on Invest** (forced first space) — Penny explains: "This is a business! It costs money but earns you money EVERY month"
5. **Forced purchase** of cheapest asset — Shows income appearing
6. **Payday explanation** — "Every time you land here, you collect your income!"
7. **Temptation explanation** — "Wants vs Needs! Skipping saves money 💪"
8. **Freedom bar** — "Fill this up to win! You need businesses, savings, and knowledge!"
9. **"Got it!"** — Tutorial ends, real game starts

**Implementation approach**:
- `TutorialManager.ts` — state machine with steps
- Overlay system with spotlight/mask on target elements
- Forced board sequence for first 4 moves
- Skip button for returning players
- Store `hasSeenTutorial` in localStorage

---

## 2. 🌍 Multi-lingual — **Priority: MEDIUM** (after EN is polished)

**Languages**: EN 🇬🇧 → FR 🇫🇷 → ES 🇪🇸 → PT-BR 🇧🇷

**Implementation approach**:
- `i18n/` folder with JSON translation files
- `useTranslation()` hook
- Language selector on setup screen
- Penny phrases need full translation (they're educational)
- Quiz questions need per-language versions
- Numbers/currency formatting per locale

**Work estimate**: ~1 day for infra, ~0.5 day per language for content

---

## 3. 🏆 Leagues / Levels / Competition System

### Option A: "Financial Grade" Progression
After each game, earn XP based on performance:
- Speed (fewer months) → more XP
- Quiz accuracy → bonus XP
- Impulse control → bonus XP
- Assets diversification → bonus XP

**Levels** (school-themed):
| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | 💰 Piggy Banker | 0 |
| 2 | 📊 Smart Saver | 100 |
| 3 | 🏪 Business Kid | 300 |
| 4 | 📈 Young Investor | 600 |
| 5 | 🦈 Money Shark | 1000 |
| 6 | 👑 Financial Freedom Master | 2000 |

**Unlockables per level**:
- New avatars
- New business types (premium assets)
- Harder difficulty modes
- Cosmetic themes (board skins)
- Penny outfits 🐷👒

### Option B: "Seasonal Leagues"
- Monthly seasons (30-day cycles)
- Bronze → Silver → Gold → Diamond → Champion
- Top 10% promote, bottom 20% demote
- League badge displayed on profile

### 💡 Recommendation: **Start with Option A** (works offline), add B when online multiplayer ships.

---

## 4. 🎮 Addictive Gameplay Mechanics

### Daily Rewards / Login Streak
- Day 1: +$5 bonus cash
- Day 3: Free quiz hint
- Day 7: Bonus business (random Tier 1)
- Day 14: Exclusive avatar
- Day 30: "Gold Piggy" profile frame
- **Streak break** = restart from Day 1 → FOMO drives daily opens

### Achievement System 🏅
Micro-goals that pop up during gameplay:
- "First Business!" — Buy your first asset
- "No Impulse!" — Skip 3 temptations in a row
- "Quiz Whiz" — Answer 5 quizzes correctly in a row
- "Debt Free!" — Pay off all debt
- "Savings Champion" — Save $200+
- "Speed Runner" — Win in under 10 months
- "Penny's Star Student" — 100% quiz accuracy
- "Diversified!" — Own assets from all 3 tiers

**Implementation**: Achievement badges displayed on profile + toast notifications during gameplay

### "One More Game" Loop
- After winning: "Can you beat your record of X months?"
- After losing: "You were X% to freedom! Try again?"
- Show "best personal records" prominently
- Quick rematch button (same settings, instant restart)

### Challenge Mode
- **Daily Challenge**: Fixed seed, same board for everyone → compare scores
- **Speed Run**: Win in fewest months possible
- **Hard Mode**: Higher expenses, fewer paydays, more temptations
- **Survival Mode**: Expenses increase every 3 months (lifestyle inflation!)

### Collection / Gacha Element
- Collect different Penny outfits 🐷🎩🐷🤠🐷👑
- Collect business "skins" (Lemonade Stand → Artisanal Lemonade Bar)
- Random reward after each win
- Trading cards with financial tips

---

## 5. 🌐 Leaderboards / World Competition

### Architecture Options

**Option A: Simple — Firebase Leaderboard**
- Persist scores to Firebase Realtime DB
- Anonymous/nickname-based (kid safety)
- Leaderboard tabs: Daily / Weekly / Monthly / All-time
- Metrics: Fastest win (fewest months), Highest net worth, Best quiz accuracy
- **No personal data collected** — just nickname + score

**Option B: Full — Monthly Tournaments**
- Monthly "seasons" with a shared leaderboard
- End-of-month prizes: special avatars, titles, profile flair
- Country-based grouping (detected from IP, no personal data)
- "Champion of [Country]" title for #1

### Kid Safety Considerations ⚠️
- **No real names** — nicknames only
- **No chat** — zero communication between players
- **No personal data** — no email, no age, no location storage
- **COPPA compliance** — no tracking under 13 without parental consent
- **Moderated nicknames** — filter inappropriate words

### Persistent Profile
- Stored locally (localStorage) + optionally synced to cloud
- Contains: nickname, avatar, level, XP, achievements, stats
- "My Stats" page: total games, win rate, best records, achievements
- Export/share as image (bragging rights)

---

## 6. 📊 Better Visualization / "What I Own"

### Portfolio View (new screen/modal)
Show everything the player has accumulated:
- **Business cards**: Each owned business as a card with icon, income, and cost
- **Income breakdown**: Pie chart of salary vs passive vs interest
- **Expense breakdown**: Base expenses vs maintenance vs loan payments
- **Net worth timeline**: Line graph of cash+savings+assets-debt over months
- **Comparison view**: Side-by-side with opponents

### Enhanced Board View
- Hovering/tapping a space shows its description
- Show player trail (where you've been)
- Mini-map showing all player positions

### Financial Report Card (monthly)
- Auto-shown every 5 months: "Here's how you're doing"
- Compare with bots: "You're saving more than Bold Ben! 📈"
- Penny gives personalized advice based on current state

---

## 7. 🎯 Online Multiplayer — **KILLER FEATURE**

### Why It's a Killer Feature
- Kids playing against real kids → social engagement
- Turn-based → no latency issues
- No chat needed → inherently safe
- Shareable game links → viral growth

### Technical Architecture

**Option A: WebSocket-based (Real-time)**
```
Client ↔ WebSocket ↔ Server (Node.js + Socket.io)
                         ↕
                    Redis (game state)
                         ↕
                    PostgreSQL (profiles, stats)
```
- Real-time turn sync
- ~50ms latency
- Scales to ~10K concurrent with single server
- **Cost**: ~$20/month VPS

**Option B: Firebase Realtime DB (Serverless)**
```
Client ↔ Firebase Realtime DB ↔ Cloud Functions
```
- No server management
- Built-in offline support
- Free tier: 100K connections/month
- **Cost**: Free → $25/month at scale

**Option C: Supabase Realtime (Open-source)**
```
Client ↔ Supabase Realtime ↔ Supabase DB (Postgres)
```
- Open-source, self-hostable
- SQL-based (easier to query)
- Free tier: 500MB DB, 2GB bandwidth
- **Cost**: Free → $25/month

### 💡 Decision: **Supabase** ✅
Marc already has a Supabase account. Open-source, self-hostable, PostgreSQL-based, COPPA-friendly (full data control).
- Fastest to implement
- Free tier is generous
- Real-time listeners are perfect for turn-based games
- Auth with anonymous login (no personal data)

### Multiplayer Game Flow
1. **Create game** → generates 6-char room code (e.g., "PIGGY7")
2. **Share code** → friend enters code on their device
3. **Lobby** → see who joined, ready up
4. **Play** → turns sync in real-time, each player sees others move
5. **Spectate** → other players' modals show as "Marc is deciding..."
6. **End** → shared results screen

### Safety Features
- No text communication
- Auto-generated nicknames (adjective + animal: "Clever Fox")
- Report button → game reviewed by admin
- Timeout for inactive players (60s → auto-skip)
- Max game duration (30 min → auto-end, highest freedom % wins)

---

## 🗓️ Suggested Implementation Priority

| Phase | Feature | Effort | Impact |
|-------|---------|--------|--------|
| **Now** | Tutorial/Onboarding | 1 day | 🔥🔥🔥 |
| **Next** | Achievements + XP levels | 1-2 days | 🔥🔥🔥 |
| **Next** | Portfolio visualization | 0.5 day | 🔥🔥 |
| **Next** | Daily rewards + streak | 0.5 day | 🔥🔥🔥 |
| **v2** | Firebase leaderboard | 1-2 days | 🔥🔥 |
| **v2** | Online multiplayer | 3-5 days | 🔥🔥🔥🔥🔥 |
| **v2** | Multi-lingual | 1-2 days | 🔥🔥 |
| **v3** | Seasonal leagues | 2-3 days | 🔥🔥🔥 |
| **v3** | Challenge modes | 1-2 days | 🔥🔥 |
| **v3** | Collection/gacha | 2-3 days | 🔥🔥 |

---

## ✅ Decisions Made

### 1. Monetization: Freemium + Packs
| Tier | Price | Content |
|------|-------|---------|
| **Free** | $0 | 1 bot, standard mode, 3 quiz/day, no stats |
| **KidCapital+** | $4.99 once | 3 bots, hard mode, unlimited quizzes, achievements, profile |
| **Avatar Pack** | $1.99 | 12 premium avatars |
| **World Pack** | $2.99 | Online multiplayer + leaderboard |
| **Season Pass** | $1.99/season | Exclusive seasonal cosmetics |

### 2. Platform: Capacitor → App Store + Play Store

### 3. Age targeting: Yes
- 8-10 years: Easier quiz questions, more payday spaces, lower expenses
- 11-14 years: Standard difficulty, harder quizzes

### 4. Parental dashboard: ❌ Not now
### 5. School mode: ❌ Not now

### 6. Phase 2 Features (Completed)
- ✅ **Onboarding tutorial ("Penny Teaches You")**: Interactive 8-step tutorial with `TutorialManager`, spotlight overlay, and `localStorage` persistence.
- ✅ **Achievements & XP levels**: 15 achievements, 6 XP levels with persistent storage and toast notifications.
- ✅ **Age-based difficulty**: 8-10 vs 11-14 selection at setup, adjusting starting cash, expenses, and filtering quiz challenges by age.
- ✅ **Portfolio visualization**: Added a 'Portfolio' modal accessible from the action bar to view net worth, passive income, and a list of owned businesses.
- ✅ **Daily rewards & streaks**: Bonus starting cash based on consecutive daily logins. Modals handle streaks dynamically at the start of a `SetupScreen`.
