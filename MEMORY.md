# MEMORY.md — KidCapital Technical Reference

> This file is the permanent reference for any AI agent or developer working on KidCapital.
> Read this FIRST before making any changes. Refer back whenever unsure.

---

## WHAT IS KIDCAPITAL?

A mobile-first board game app that teaches kids 8-14 financial literacy through gameplay.
Players roll dice, move on a board, buy businesses, manage debt, resist impulse spending, 
and race to achieve Financial Freedom (passive income ≥ expenses + zero debt).

**Core philosophy:** Every game mechanic maps to a real financial concept. Fun first, education embedded.

---

## TECH STACK

| Layer       | Technology                | Notes                              |
|-------------|---------------------------|------------------------------------|
| Frontend    | React 19 + TypeScript     | Strict types, no `any`             |
| Styling     | Tailwind CSS 4.x          | Mobile-first, utility classes      |
| State       | Zustand                   | Single store for game, UI store separate |
| Animations  | Framer Motion             | All transitions, dice, coins       |
| Build       | Vite 6                    | Fast dev, optimized production     |
| Mobile      | Capacitor 6               | iOS 15+ / Android 10+             |
| Backend     | Supabase                  | Auth, Postgres, Edge Functions     |
| AI          | Claude API (Sonnet)       | Via Supabase Edge Function ONLY    |
| Payments    | RevenueCat                | Subscriptions + lifetime           |
| Analytics   | PostHog                   | Anonymous, COPPA-safe              |
| Deploy      | Vercel (web) + App Stores | CI/CD via GitHub Actions           |

---

## KEY RULES — NEVER VIOLATE THESE

1. **API keys NEVER in client code.** All AI calls go through Supabase Edge Functions.
2. **The game MUST work offline.** Penny falls back to pre-written phrases. No network = no blocker.
3. **Turn-by-turn ONLY.** No parallel actions. Strict sequential: Player 0 → 1 → 2 → 3 → 0...
4. **Pacing matters.** Every action has a visible pause (see timing table). Never instant.
5. **Penny NEVER interrupts.** She speaks AFTER actions resolve, with a 1s delay minimum.
6. **Cannot buy assets if debt > 0.** This is a core financial lesson. No exceptions.
7. **Payday shows full income statement.** This is the #1 educational moment.
8. **No personal data from kids.** Parents create accounts. Analytics are anonymous.
9. **Mobile-first always.** Design for 375px width first, then scale up.
10. **Every space does something.** No empty/dead spaces on the board.

---

## 🤖 AI AGENT WORKFLOW RULES (CRITICAL)

1. **Always note changes at the end of each step:** Update documentation (`walkthrough.md`, `task.md`, `BRAINSTORM.md`) with what has been implemented so you remember what was done and can follow the established order.
2. **Consult documentation first:** At the start of any new session or before starting a new step, YOU MUST ALWAYS read `MEMORY.md`, `BRAINSTORM.md`, and `walkthrough.md` to understand context and next steps.

---

## WIN CONDITION

```
Financial Freedom = ALL of:
  - passiveIncome >= totalExpenses
  - debt == 0
  - assets.length >= 2
  
Where:
  passiveIncome = sum of all owned assets' income values
  totalExpenses = baseExpenses + sum(assets' maintenance) + loanPayment
```

Freedom Progress Bar: `clamp((passiveIncome / totalExpenses) * 100, 0, 100)`

---

## FINANCIAL ENGINE — CORE FORMULAS

### Payday Calculation
```
income      = salary + passiveIncome + floor(savings * 0.05)
expenses    = baseExpenses + maintenanceCosts + loanPayment
net         = income - expenses
cash        = max(0, cash + net)
debt        = max(0, debt - min(loanPayment, debt))
if debt == 0: loanPayment = 0
```

### Asset Purchase (Cash)
```
Requires: cash >= cost AND debt == 0
cash -= cost
assets.push(asset)
```

### Asset Purchase (Loan — 30% down)
```
Requires: cash >= ceil(cost * 0.30) AND debt == 0
downPayment     = ceil(cost * 0.30)
loanAmount      = cost - downPayment
loanWithInterest = ceil(loanAmount * 1.10)   // 10% interest
monthlyPayment   = ceil(loanWithInterest * 0.20) // 20% per payday

cash -= downPayment
debt += loanWithInterest
loanPayment += monthlyPayment
assets.push(asset)
```

### Bank Savings
```
deposit:  cash -= amount, savings += amount
withdraw: savings -= amount, cash += amount
interest: applied at payday = floor(savings * 0.05)
```

---

## STARTING VALUES (Standard Mode)

| Attribute     | Value |
|---------------|-------|
| cash          | 200   |
| salary        | 50    |
| baseExpenses  | 20    |
| savings       | 0     |
| debt          | 0     |
| loanPayment   | 0     |
| passiveIncome | 0     |
| position      | 0     |

---

## BOARD LAYOUT (20 spaces)

```
0:start  1:invest  2:life  3:hustle  4:invest
5:payday 6:temptation 7:invest 8:life 9:challenge
10:bank  11:invest 12:payday 13:hustle 14:life
15:invest 16:temptation 17:challenge 18:bank 19:payday
```

Space types and counts:
- invest × 6 (buy businesses)
- payday × 3 (collect income)  
- life × 3 (random events)
- hustle × 2 (active income)
- temptation × 2 (impulse control)
- challenge × 2 (financial quiz)
- bank × 2 (savings & debt)
- start × 1 (GO, +$15 when passing)

---

## ANIMATION TIMING (CRITICAL)

| Action                  | Duration | Notes                    |
|-------------------------|----------|--------------------------|
| Dice roll animation     | 1.2s     | Spin + settle            |
| Dice result visible     | 1.0s     | Before movement starts   |
| Token move per space    | 0.3s     | Step by step             |
| Space arrival → modal   | 1.0s     | Player reads space name  |
| Bottom sheet entrance   | 0.35s    | Slide up cubic-bezier    |
| Coin +/- animation      | 0.8s     | Drop from above          |
| Post-action pause       | 1.0s     | Before "Next" appears    |
| Penny delay after action| 1.0s     | Minimum before she talks |
| Penny bubble duration   | 4-5s     | Then auto-fades          |
| Bot turn total          | 3-4s     | Roll + move + act + wait |

---

## PENNY MENTOR — RULES

- Speaks AFTER actions, never during
- 1 message per turn phase maximum
- Typewriter text reveal (~30 chars/sec)
- Max 25 words per message
- Always includes educational content
- Auto-dismisses after 4-5s, tap to dismiss early
- Visual: 40px pig icon bottom-left, speech bubble slides up
- Full-screen Penny: ONLY for tutorial (first 3 turns) and win
- Can be muted in settings
- AI mode (premium): Claude Sonnet via edge function, max 3 calls/game
- Fallback mode (free/offline): pre-written phrase bank

---

## BOT PERSONALITIES

| Bot | Name         | Avatar | Strategy                          |
|-----|--------------|--------|-----------------------------------|
| 🐢  | Careful Chloe | 🐢    | Cash only, cheapest, always saves |
| 🦁  | Bold Ben      | 🦁    | Loans for big assets, no savings  |
| 🦉  | Smart Sam     | 🦉    | Best ROI, strategic loans, saves 30% |

Bot turns are VISIBLE but fast (3-4s total). No modals for bots.
Bots never buy temptations (except Bold Ben at 20% chance).

---

## ASSET TIERS

**Tier 1 ($40-$60):** Lemonade Stand, Dog Walking, Yard Care
**Tier 2 ($100-$150):** Candy Shop, Bike Rental, Art Studio, Pet Grooming
**Tier 3 ($200-$350):** Arcade, Food Truck, Music School

Design: ROI is similar across tiers (~11-12%). Higher tiers = higher absolute income but more capital needed.

---

## MONETISATION

```
FREE:  Standard difficulty, 1 bot, basic Penny, 5 quizzes, all core mechanics
PAID:  $2.99/mo | $19.99/yr | $49.99 lifetime
       All difficulties, 3 bots, AI Penny, 15+ quizzes, Tier 3 assets,
       XP system, stats, seasonal content
```

RevenueCat entitlement: "premium"
Parental gate: multiplication problem before purchase screen.

---

## FILE STRUCTURE

```
src/
├── app/           → App.tsx, main.tsx
├── screens/       → SplashScreen, SetupScreen, GameScreen, EndScreen
├── components/    → board/, hud/, modals/, penny/, dice/, ui/
├── engine/        → GameEngine, FinancialEngine, BotAI, TurnManager
├── data/          → board, assets, events, hustles, temptations, challenges, bots
├── store/         → gameStore (Zustand), uiStore
├── services/      → supabase, auth, pennyAI, analytics, sounds
├── hooks/         → useGame, usePenny, useDice, useSound
├── i18n/          → en, fr, es
├── types/         → All TypeScript interfaces
└── utils/         → helpers, constants
```

---

## SUPABASE TABLES

- `users` — Parent accounts (email, premium status)
- `player_profiles` — Kid profiles under a parent (name, avatar, XP, level)
- `game_sessions` — Saved games + completed game stats
- `leaderboard` — Global scores

---

## CRITICAL PATH FOR MVP

```
1. Project scaffold + types + data files
2. Financial Engine (pure functions, unit tested)
3. Turn state machine (TurnManager)
4. Game screen: board + dice + player cards
5. All 7 modal types (bottom sheets)
6. Bot AI (3 personalities)  
7. Penny system (fallback phrases)
8. Win condition + end screen
9. Sounds + haptics
10. Supabase auth + save game
11. Capacitor build
12. RevenueCat integration
13. Polish + bug fixes
14. Beta test → Ship
```

---

## COMMON PITFALLS TO AVOID

- **State race conditions**: Use Zustand's `get()` for latest state in async callbacks, not stale closures.
- **Bot turn overlaps**: Lock turn transitions with a `turnLocked` flag. Never allow two turns to process simultaneously.
- **Payday with stale data**: Always recalculate financials at call time, never cache.
- **Modal stacking**: Only one modal can be open at a time. Phase system enforces this.
- **ScrollIntoView timing**: Wait for DOM update (requestAnimationFrame) before calling scrollIntoView.
- **Capacitor safe areas**: Use `env(safe-area-inset-bottom)` for action bar.
- **Sound on iOS**: Must be triggered by user gesture first (play silent audio on first tap).
- **React strict mode**: Game engine side effects should be in useEffect with proper cleanup.

---

## DESIGN AESTHETIC — "Paper & Gold"

- **Palette**: Amber/Gold dominant + Emerald (growth) + Rose (danger)
- **Font**: Baloo 2 (display) + system sans-serif (body)
- **Cards**: White, rounded-2xl, subtle shadow, no heavy borders
- **Glass effects**: White 75% + backdrop-blur for overlays
- **Animations**: Satisfying micro-interactions (coin drops, dice spin, card reveals)
- **NO**: Neon colors, dark mode, heavy gradients, cartoon style
- **YES**: Warm, premium, tactile, like a beautifully crafted board game

---

*Last updated: 2026-02-26 | Version: 3.0 | PRD companion: KIDCAPITAL_PRD.md*
