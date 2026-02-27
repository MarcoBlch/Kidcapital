# KidCapital — Product Requirements Document (PRD)

**Version:** 3.0  
**Last Updated:** 2026-02-26  
**Author:** Marco B. (Product Owner)  
**Status:** Ready for Development  

---

## Table of Contents

1. [Vision & Concept](#1-vision--concept)
2. [Target Audience](#2-target-audience)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [User Flow — Screen by Screen](#5-user-flow)
6. [Game Mechanics — Deep Dive](#6-game-mechanics)
7. [Financial Engine](#7-financial-engine)
8. [Penny — AI Mentor System](#8-penny-ai-mentor)
9. [Board & Spaces](#9-board--spaces)
10. [Assets, Events & Content](#10-content-library)
11. [Bot AI System](#11-bot-ai)
12. [UI/UX Specifications](#12-ui-ux-specs)
13. [Turn System — Detailed Flow](#13-turn-system)
14. [Progression & Levels](#14-progression--levels)
15. [Monetisation & Pricing](#15-monetisation)
16. [Database Schema (Supabase)](#16-database-schema)
17. [Auth & Parental Controls](#17-auth--parental)
18. [Analytics & KPIs](#18-analytics)
19. [Marketing Strategy](#19-marketing)
20. [Roadmap & Milestones](#20-roadmap)
21. [Known Bugs to Fix from V3 Prototype](#21-bugs-to-fix)

---

## 1. Vision & Concept

### One-liner
KidCapital is a mobile-first board game that teaches kids 8-14 real financial literacy through play — earning, saving, investing, and reaching Financial Freedom.

### Core Loop
`Roll → Move → Act → Learn → Repeat`

Every action in the game maps to a real-world financial concept:
- Buying an asset → Investing
- Payday → Understanding income vs expenses
- Temptation → Delayed gratification
- Hustle → Active vs passive income
- Bank → Savings with compound interest
- Chance → Emergency fund importance
- Quiz → Direct financial education

### Win Condition
**Financial Freedom:** Passive Income ≥ Total Expenses AND Debt = $0 AND Owns ≥ 2 businesses.

This is the real-world definition of financial independence, simplified for kids. The progress bar ("Freedom %") is always visible during gameplay.

### Design Philosophy — "Paper & Gold"
Aesthetic: Premium tactile feel — like a beautifully crafted physical board game. Warm golds, crisp whites, subtle textures. NOT childish/cartoon — "elevated kids design" like Headspace Kids or Monument Valley. Typography: Baloo 2 (headings) + system body. Animations: Satisfying micro-interactions (coin drops, dice spins, card reveals).

---

## 2. Target Audience

### Primary: Kids 8-14
- Short attention spans → every interaction must reward within 3 seconds
- Visual learners → show, don't tell
- Competitive → leaderboards, beating bots, progress tracking
- Social → "play with friends" is key

### Secondary: Parents 30-45
- They make the purchase decision
- They want EDUCATIONAL value
- They want screen-time they don't feel guilty about
- Keywords that sell: "financial literacy", "money skills", "teaches saving"

### Tertiary: Educators / Schools
- Potential B2B channel for v2+
- Classroom mode (teacher dashboard, class leaderboard)

---

## 3. Tech Stack

### Frontend
```
Framework:     React 19 + TypeScript
Styling:       Tailwind CSS 4.x (utility-first, mobile-first)
State:         Zustand (simple, performant, no boilerplate)
Routing:       React Router 7 (if needed for multi-screen)
Animations:    Framer Motion (React-native-compatible later)
Build:         Vite 6
Linting:       ESLint + Prettier
```

### Mobile Wrapper
```
Framework:     Capacitor 6
Platforms:     iOS 15+ / Android 10+
Plugins:       @capacitor/haptics, @capacitor/splash-screen,
               @capacitor/status-bar, @capacitor/app
```

### Backend
```
Platform:      Supabase (hosted)
Auth:          Supabase Auth (email/password for parents)
Database:      PostgreSQL (via Supabase)
Edge Functions: Deno/TypeScript (for AI proxy, game validation)
Storage:       Supabase Storage (avatars, assets future)
Realtime:      Supabase Realtime (future multiplayer)
```

### AI (Penny Mentor)
```
Provider:      Anthropic Claude API (claude-sonnet-4-20250514)
Integration:   Via Supabase Edge Function (NEVER client-side)
Fallback:      Pre-written phrase bank (offline play must work)
Rate Limit:    Max 3 AI calls per game session (cost control)
```

### Payments
```
Platform:      RevenueCat
Products:      Monthly subscription ($2.99/mo)
               Annual subscription ($19.99/yr)
               Lifetime unlock ($49.99 one-time)
Trials:        7-day free trial on first subscription
Parental Gate: Math question before purchase screen
```

### Analytics
```
Platform:      PostHog (self-hostable, COPPA-friendlier)
Events:        game_start, game_end, asset_purchased,
               temptation_resisted, temptation_bought,
               quiz_correct, quiz_wrong, payday_viewed,
               subscription_started, churn
```

### Deployment
```
Web:           Vercel (marketing site + web version)
iOS:           App Store via Xcode + Capacitor
Android:       Google Play via Android Studio + Capacitor
CI/CD:         GitHub Actions → build → deploy
```

---

## 4. Project Structure

```
kidcapital/
├── public/
│   ├── sounds/              # SFX files (dice, coins, win, etc.)
│   ├── images/              # Static assets
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── App.tsx          # Root component, screen router
│   │   └── main.tsx         # Entry point
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── SetupScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── EndScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── board/
│   │   │   ├── BoardStrip.tsx       # Horizontal scrollable board
│   │   │   ├── SpaceCard.tsx        # Individual space display
│   │   │   └── PlayerToken.tsx      # Player marker on board
│   │   ├── hud/
│   │   │   ├── PlayerRow.tsx        # Player info card
│   │   │   ├── ProgressBar.tsx      # Freedom % bar
│   │   │   ├── Header.tsx           # Top bar (month, debt alert)
│   │   │   └── ActionBar.tsx        # Bottom bar (dice, buttons)
│   │   ├── modals/
│   │   │   ├── BottomSheet.tsx      # Reusable bottom sheet wrapper
│   │   │   ├── InvestModal.tsx      # Business market
│   │   │   ├── PaydayModal.tsx      # Monthly income report
│   │   │   ├── LifeEventModal.tsx   # Random events
│   │   │   ├── HustleModal.tsx      # Active income
│   │   │   ├── TemptationModal.tsx  # Wants vs needs
│   │   │   ├── ChallengeModal.tsx   # Financial quiz
│   │   │   └── BankModal.tsx        # Savings & debt
│   │   ├── penny/
│   │   │   ├── PennyCharacter.tsx   # Animated Penny pig visual
│   │   │   ├── PennySpeech.tsx      # Speech bubble with typewriter
│   │   │   └── PennyOverlay.tsx     # Full-screen Penny for tutorials
│   │   ├── dice/
│   │   │   └── DiceRoller.tsx       # 3D animated dice
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── CoinAnimation.tsx    # +/- dollar fly animation
│   │       └── ConfettiEffect.tsx
│   ├── engine/
│   │   ├── GameEngine.ts           # Core game loop logic
│   │   ├── FinancialEngine.ts      # All money calculations
│   │   ├── BotAI.ts                # Bot decision logic
│   │   ├── TurnManager.ts          # Turn flow state machine
│   │   └── WinCondition.ts         # Freedom check
│   ├── data/
│   │   ├── board.ts                # Board layout definition
│   │   ├── assets.ts               # Business catalog
│   │   ├── events.ts               # Life events
│   │   ├── hustles.ts              # Side jobs
│   │   ├── temptations.ts          # Wants catalog
│   │   ├── challenges.ts           # Quiz questions bank
│   │   ├── penny-phrases.ts        # Fallback phrases
│   │   └── bots.ts                 # Bot profiles
│   ├── store/
│   │   ├── gameStore.ts            # Zustand game state
│   │   └── uiStore.ts             # UI state (modals, animations)
│   ├── services/
│   │   ├── supabase.ts             # Supabase client init
│   │   ├── auth.ts                 # Auth helpers
│   │   ├── pennyAI.ts              # Claude API via edge function
│   │   ├── analytics.ts            # PostHog wrapper
│   │   └── sounds.ts               # SFX manager
│   ├── hooks/
│   │   ├── useGame.ts              # Main game hook
│   │   ├── usePenny.ts             # Penny message management
│   │   ├── useDice.ts              # Dice animation logic
│   │   └── useSound.ts             # Sound effects hook
│   ├── i18n/
│   │   ├── en.ts
│   │   ├── fr.ts
│   │   └── es.ts
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces
│   └── utils/
│       ├── helpers.ts              # Random, clamp, etc.
│       └── constants.ts            # Config values
├── supabase/
│   ├── migrations/                 # DB migrations
│   ├── functions/
│   │   ├── penny-ai/              # Edge function: Claude proxy
│   │   └── validate-game/         # Edge function: anti-cheat
│   └── seed.sql                    # Initial data
├── capacitor.config.ts
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── MEMORY.md                       # Technical reference for AI agents
└── README.md
```

---

## 5. User Flow

### Flow 1: First Launch (New User)

```
[Splash Screen] ─── 2s auto-advance ───►
[Penny Intro] ─── Penny appears full-screen, speaks ───►
  "Hi! I'm Penny! I'll teach you to be a Money Master!" 
  (typewriter text, takes 3-4 seconds)
  [Tap to continue]
───►
[Setup Screen] ─── Single screen ───►
  - Choose avatar (grid, tap to select)
  - Enter name (max 14 chars)
  - Choose opponents (1/2/3 bots, shows profiles)
  - [Start Playing!] button
───►
[Tutorial Game] ─── First 3 turns are guided ───►
  Turn 1: Penny explains dice roll + movement
  Turn 2: Penny explains landing on a space
  Turn 3: Penny explains the Freedom bar
  After turn 3: "You got this! I'll pop in if you need me 🐷"
───►
[Normal Gameplay Loop]
```

### Flow 2: Return User

```
[Splash Screen] ─── 1.5s ───►
  - If saved game exists → "Continue Game?" / "New Game"
  - If no saved game → [Setup Screen]
```

### Flow 3: Core Gameplay Loop (1 Human Turn)

```
[IDLE]
  → Player sees: board, all player stats, Freedom %, their position
  → Action bar shows: Dice + "Roll!" button
  → Penny may give a contextual tip
  
[TAP ROLL]
  → Dice animates (spin 1.2s)
  → Haptic feedback (light)
  → Number appears, dice settles
  → Penny: "You rolled a 4!" (spoken, brief)
  
[WAIT 1.5s — Player sees dice result]

[AUTO-MOVE]
  → Token moves space-by-space (0.3s per space)
  → Board auto-scrolls to follow
  → Penny: "Ooh, an Invest space! 🏪" (contextual)
  
[WAIT 1s — Player sees where they landed]

[SPACE RESOLUTION]
  → Bottom sheet slides up with appropriate content
  → Player makes their choice (buy, save, answer, etc.)
  → Coin animation shows +/- money
  → Penny gives educational comment
  
[CLOSE MODAL → SHOW RESULT]
  → Brief pause (1s) showing updated stats
  → "Next →" button appears
  
[TAP NEXT]
  → Turn passes to next player
  → If next is bot: auto-plays with visible actions (2-3s per bot)
  → If next is human: back to [IDLE]
```

### Flow 4: Bot Turn (Visible to Player)

```
[BOT TURN STARTS]
  → Header shows "🐢 Chloe's Turn"
  → Brief pause (0.8s)

[BOT ROLLS]
  → Dice auto-rolls (same animation, faster: 0.8s)
  → Log shows: "Chloe rolled 3"
  
[BOT MOVES]
  → Token moves on board (same animation)
  → Pause (0.8s)

[BOT ACTS]
  → Log shows action: "Chloe bought Lemonade Stand!" or "Chloe skipped."
  → NO modal opens (keep it fast)
  → Coin animation if relevant
  → Total bot turn time: 3-4 seconds

[NEXT PLAYER]
```

### Flow 5: Game End

```
[FREEDOM REACHED]
  → Screen flash/celebration
  → Penny appears full-screen: "YOU DID IT! 🏆"
  → Confetti animation

[END SCREEN — Stats Report Card]
  → Winner name + avatar
  → Financial Report:
    - Total months played
    - Final passive income vs expenses
    - Net worth
    - Businesses owned
    - Savings total
    - Impulse Control Score (temptations skipped/bought)
  → Penny's final lesson
  → [Play Again] / [Share] / [Home]
```

---

## 6. Game Mechanics — Deep Dive

### 6.1 The Board

- **20 spaces** arranged in a loop
- Displayed as a **horizontal scrollable strip** (not circular)
- Auto-scrolls to active player's position
- Each space has: type, icon, label, color

Space distribution (per 20):
| Type | Count | Purpose |
|------|-------|---------|
| Invest | 6 | Buy businesses (core mechanic) |
| Payday | 3 | Collect income, pay expenses (feedback loop) |
| Life | 3 | Random events (emergencies, luck) |
| Hustle | 2 | Active income (teaches work = money) |
| Temptation | 2 | Impulse control (key educational tool) |
| Challenge | 2 | Financial quiz (direct learning) |
| Bank | 2 | Savings & debt management |

Note: no "blank" or "street" spaces — every space does something meaningful.

### 6.2 Dice

- **1d6** (single six-sided die)
- Physical feel: 3D spin animation (1.2s), haptic on land
- Result appears as dots on a visual die

### 6.3 Passing GO (Space 0)

When a player **passes** (not necessarily lands on) space 0:
- Receive $15 "allowance bonus"
- This represents a new cycle/month
- Month counter increments when player 0 passes GO

### 6.4 Turn Order

- Strictly sequential: Player 0, Player 1, Player 2...
- No skipping, no interrupts
- Human turns wait for input
- Bot turns auto-resolve with visible animations

### 6.5 Pacing Rules (CRITICAL)

Every action must have a visible pause:
```
Dice roll animation:        1.2 seconds
Dice result display:        1.0 second
Token movement per space:   0.3 seconds
Space reveal (before modal): 1.0 second
Modal entrance animation:    0.35 seconds
Coin +/- animation:          0.8 seconds
Post-action pause:           1.0 second
Bot turn total:              3-4 seconds
```

**Penny speaks BETWEEN actions, not during.** Her speech bubble appears after the action resolves, stays 4-5 seconds, then fades. She never interrupts the flow.

---

## 7. Financial Engine

### 7.1 Player Financial Profile

```typescript
interface Player {
  id: number;
  name: string;
  avatar: string;
  isHuman: boolean;
  personality?: 'conservative' | 'aggressive' | 'balanced';
  
  // FINANCIAL STATE
  cash: number;           // Liquid money available
  savings: number;        // Money in bank (earns interest)
  salary: number;         // Base income per payday
  baseExpenses: number;   // Fixed living costs per payday
  debt: number;           // Total outstanding loan balance
  loanPayment: number;    // Auto-deducted per payday
  assets: Asset[];        // Owned businesses
  
  // GAME STATE
  position: number;       // Board position (0-19)
  wantsSpent: number;     // Total spent on temptations
  wantsSkipped: number;   // Total temptations resisted
  quizCorrect: number;    // Quiz answers right
  quizTotal: number;      // Quiz answers total
}
```

### 7.2 Starting Values

| Difficulty | Cash | Salary | Expenses | Available Assets |
|-----------|------|--------|----------|-----------------|
| Standard  | $200 | $50    | $20      | Tier 1 + 2      |
| Medium    | $150 | $40    | $25      | Tier 1 + 2 + 3  |
| Hard      | $100 | $30    | $30      | All (more expensive) |

For V1 MVP: **Standard only.** Medium/Hard are premium content.

### 7.3 Payday Calculation (executed every Payday space)

```
INCOME:
  + salary (base, fixed)
  + passiveIncome (sum of all assets' income)
  + savingsInterest (floor(savings × 0.05))

EXPENSES:
  - baseExpenses (living costs, fixed)
  - maintenance (sum of all assets' maint cost)
  - loanPayment (auto loan installment)

NET = INCOME - EXPENSES
cash = max(0, cash + NET)

DEBT REDUCTION:
  if debt > 0:
    paid = min(loanPayment, debt)
    debt -= paid
    if debt == 0: loanPayment = 0
```

The Payday modal **shows this full breakdown** like a bank statement. This is where the learning happens.

### 7.4 Buying an Asset

**Full Cash Purchase:**
```
Requirements: cash >= asset.cost AND debt == 0
Result: cash -= asset.cost
        assets.push(asset)
```

**Loan Purchase (30% down):**
```
Requirements: cash >= ceil(asset.cost × 0.30) AND debt == 0
downPayment = ceil(asset.cost × 0.30)
loanAmount = asset.cost - downPayment
loanWithInterest = ceil(loanAmount × 1.10)  // 10% interest
monthlyPayment = ceil(loanWithInterest × 0.20)  // 20% of total per payday

Result: cash -= downPayment
        debt += loanWithInterest
        loanPayment += monthlyPayment
        assets.push(asset)
```

**RULE: Cannot buy any asset if debt > 0.** This forces the player to think before borrowing.

### 7.5 Savings (Bank Space)

```
Deposit: cash -= amount, savings += amount
Withdraw: savings -= amount, cash += amount
Interest: Applied automatically at Payday (5% of savings, floored)
```

Penny teaches: "Your money earns money in the bank!"

### 7.6 Win Condition — Financial Freedom

```typescript
function checkFreedom(player: Player): boolean {
  const passiveIncome = player.assets.reduce((s, a) => s + a.income, 0);
  const totalExpenses = player.baseExpenses 
    + player.assets.reduce((s, a) => s + a.maint, 0) 
    + player.loanPayment;
  
  return passiveIncome >= totalExpenses 
    && player.debt === 0 
    && player.assets.length >= 2;
}
```

Freedom Progress %:
```
if totalExpenses == 0: 0%
else: clamp(round((passiveIncome / totalExpenses) × 100), 0, 100)
```

---

## 8. Penny — AI Mentor System

### 8.1 Character Design

Penny is a **friendly pig wearing sunglasses** — cool, wise, never condescending. She speaks like a supportive older sibling, not a teacher. Her tone: encouraging, fun, occasionally funny, always educational.

### 8.2 Visual Presence

- **Persistent icon**: Bottom-left corner of game screen, small (40px), tappable
- **Speech bubble**: Slides up from Penny icon, max 3 lines of text
- **Full-screen Penny**: Used for tutorials and important moments only
- **Typewriter effect**: Text appears character by character (~30 chars/sec)
- **Voice**: Optional TTS, can be toggled off

### 8.3 When Penny Speaks

Penny speaks at SPECIFIC moments with SPECIFIC educational content:

| Trigger | What Penny Says | Educational Goal |
|---------|----------------|------------------|
| Game start | Welcome + goal explanation | Set context |
| First roll | "Tap the dice to roll!" | Tutorial |
| Land on Invest | "Businesses earn money FOR you!" | Passive income |
| First asset buy | "You're an investor now!" | Positive reinforcement |
| Buy with loan | "Loans cost extra (interest). Pay it off fast!" | Debt awareness |
| Can't buy (has debt) | "Pay your debt first — it's blocking your growth!" | Debt priority |
| Payday (positive) | "Your businesses earned ${X}! That's passive income!" | Income feedback |
| Payday (negative) | "Expenses > income. We need more businesses!" | Expense awareness |
| Temptation (skipped) | "Great self-control! That $X can now GROW!" | Delayed gratification |
| Temptation (bought) | "Fun! But remember — spent money can't grow." | Opportunity cost |
| Hustle | "This is ACTIVE income — you worked for it!" | Active vs passive |
| Quiz (correct) | "Smart! Here's a bonus!" | Knowledge reward |
| Quiz (wrong) | [Explains the right answer] | Teachable moment |
| Bank deposit | "Your savings earn 5% interest — compound growth!" | Compound interest |
| Low cash (<$20) | "Running low! Focus on Payday spaces." | Budget awareness |
| Near freedom (>80%) | "Almost there! One more investment could do it!" | Goal motivation |
| Win | "FINANCIAL FREEDOM! Your money works for YOU!" | Victory lesson |

### 8.4 AI vs Fallback

- **Offline / Free tier**: Pre-written phrase bank (see penny-phrases.ts)
- **Premium / Online**: Claude API generates contextual responses
- **AI Prompt Template:**

```
You are Penny the Pig, a friendly financial mentor for kids aged 8-14.
Context: {situation}
Player: {name}, Cash: ${cash}, Debt: ${debt}, Assets: {count}, Freedom: {pct}%
Rules: Max 20 words. Be encouraging. Mention specific numbers. 
Use 1 emoji max. Explain ONE financial concept simply.
Language: {lang}
```

### 8.5 Pacing (CRITICAL)

- Penny NEVER speaks during an animation
- Penny appears AFTER the action resolves
- Speech bubble stays 4-5 seconds then fades
- Penny speaks max 1 time per turn phase
- Player can tap bubble to dismiss early
- Penny can be muted in settings

---

## 9. Board & Spaces

### 9.1 Board Layout (20 spaces, clockwise)

```
Index | Type       | Icon | Label   | Color
------|------------|------|---------|--------
0     | start      | 🏁   | GO      | amber
1     | invest     | 🏪   | Invest  | emerald
2     | life       | 🎲   | Life    | rose
3     | hustle     | 💼   | Hustle  | purple
4     | invest     | 🏪   | Invest  | emerald
5     | payday     | 💰   | Payday  | amber
6     | temptation | 🛍️   | Want!   | pink
7     | invest     | 🏪   | Invest  | emerald
8     | life       | 🎲   | Life    | rose
9     | challenge  | 🧠   | Quiz    | cyan
10    | bank       | 🏦   | Bank    | indigo
11    | invest     | 🏪   | Invest  | emerald
12    | payday     | 💰   | Payday  | amber
13    | hustle     | 💼   | Hustle  | purple
14    | life       | 🎲   | Life    | rose
15    | invest     | 🏪   | Invest  | emerald
16    | temptation | 🛍️   | Want!   | pink
17    | challenge  | 🧠   | Quiz    | cyan
18    | bank       | 🏦   | Bank    | indigo
19    | payday     | 💰   | Payday  | amber
```

### 9.2 Space Rendering

Each space on the board strip:
- Width: 44px (inactive) / 56px (active)
- Height: same
- Shape: rounded-2xl
- Border: 2px, color = space.color
- Background: active = color + "22" (12% opacity), inactive = white
- Shadow: active gets glow effect
- Player tokens: stacked below the space, 16px circles

---

## 10. Content Library

### 10.1 Assets (Businesses)

**Tier 1 — Starter (cost $40-$60)**
```
| ID | Name            | Cost | Income | Maint | Icon | ROI  |
|----|-----------------|------|--------|-------|------|------|
| a1 | Lemonade Stand  | 50   | 8      | 2     | 🍋   | 12%  |
| a2 | Dog Walking     | 40   | 6      | 1     | 🐕   | 12.5%|
| a3 | Yard Care       | 60   | 10     | 3     | 🌿   | 11.7%|
```

**Tier 2 — Growth (cost $100-$150)**
```
| ID | Name            | Cost | Income | Maint | Icon | ROI  |
|----|-----------------|------|--------|-------|------|------|
| a4 | Candy Shop      | 110  | 18     | 5     | 🍬   | 11.8%|
| a5 | Bike Rental     | 140  | 22     | 6     | 🚲   | 11.4%|
| a6 | Art Studio      | 130  | 20     | 5     | 🎨   | 11.5%|
| a7 | Pet Grooming    | 120  | 19     | 5     | 🐩   | 11.7%|
```

**Tier 3 — Premium (cost $200-$350)**
```
| ID | Name            | Cost | Income | Maint | Icon | ROI  |
|----|-----------------|------|--------|-------|------|------|
| a8 | Arcade          | 250  | 40     | 12    | 🕹️   | 11.2%|
| a9 | Food Truck      | 300  | 48     | 15    | 🚚   | 11%  |
| a10| Music School    | 350  | 55     | 18    | 🎵   | 10.6%|
```

Design note: ROI is intentionally similar across tiers so there's no objectively "best" asset. Higher tiers have higher absolute income but require more capital/debt.

### 10.2 Life Events (minimum 20 — 10 good, 10 bad)

```
GOOD EVENTS (+$7 to +$40):
| Title              | Text                        | Amount | Mood |
|--------------------|-----------------------------|--------|------|
| Birthday Money!    | Grandma sent a gift!        | +25    | 🥳   |
| Viral Video!       | Your biz went viral!        | +35    | 🤩   |
| Garage Sale        | Sold old stuff              | +15    | 😊   |
| Tip Jar Full!      | Customers tipped big        | +20    | 😄   |
| School Prize       | Won science fair            | +30    | 🥇   |
| Lucky Find         | Found money in your jacket  | +10    | 🍀   |
| BBQ Sales          | Sold lemonade at BBQ        | +22    | ☀️   |
| Partnership Win    | Teamed up on big order      | +28    | 💪   |
| Festival Booth     | Crushed it at the fair      | +40    | 🎉   |
| Snow Day Sales     | Hot cocoa sold out          | +18    | 🧣   |

BAD EVENTS (-$6 to -$20):
| Title              | Text                        | Amount | Mood |
|--------------------|-----------------------------|--------|------|
| Broken Window      | Ball through the glass      | -15    | 😬   |
| Rainy Week         | No foot traffic             | -10    | 😕   |
| Supply Shortage    | Ingredients cost up         | -12    | 😤   |
| Pet Vet Bill       | Hamster check-up            | -20    | 🏥   |
| Equipment Broke    | Blender gave up             | -18    | 😩   |
| Power Outage       | Lost a day of sales         | -8     | 😶   |
| Tax Time           | Small business tax          | -10    | 📋   |
| Delivery Mishap    | Wrong order sent            | -14    | 🤦   |
| Bike Flat          | Tire popped mid-delivery    | -6     | 😐   |
| Health Inspection  | Fine for messy shop         | -12    | 🧹   |
```

### 10.3 Hustles (Side Jobs — 8 minimum)

```
| Title          | Text                      | Amount | Icon |
|----------------|---------------------------|--------|------|
| Mow 3 Lawns   | Hard work pays off!       | +20    | 🌿   |
| Wash Cars      | Scrub scrub sparkle!      | +25    | 🚗   |
| Tutor a Kid    | Teaching is earning!      | +18    | 📚   |
| Babysitting    | Responsible = rewarded!   | +22    | 👶   |
| Lemonade Boost | Extra stand this weekend  | +15    | 🍋   |
| Tech Help      | Fixed Mrs. Chen's Wi-Fi   | +30    | 💻   |
| Pet Sitting    | 2 dogs + 1 cat = $$$     | +20    | 🐾   |
| Bake Sale      | Cookies flew off table    | +28    | 🍪   |
```

### 10.4 Temptations (Wants — 8 minimum)

```
| Name           | Cost | Icon | Text                    |
|----------------|------|------|-------------------------|
| New Sneakers   | 25   | 👟   | So fresh, so clean!     |
| Video Game     | 30   | 🎮   | Everyone's playing it!  |
| Concert Ticket | 35   | 🎤   | Your fave artist!       |
| Phone Case     | 15   | 📱   | Gotta protect the phone |
| Skateboard     | 40   | 🛹   | Ride in style!          |
| Movie Night    | 12   | 🍿   | Popcorn included!       |
| Plush Toy      | 18   | 🧸   | So soft and cuddly!     |
| Ice Cream      | 8    | 🍦   | Triple scoop!           |
```

### 10.5 Financial Quizzes (minimum 15)

Each quiz has: question, 4 options, correct index, Penny explanation.

```
Q: "What does 'passive income' mean?"
A: Money earned without working every day [CORRECT]
Penny: "Assets generate passive income — money while you sleep! 💤💰"

Q: "Why is debt dangerous?"  
A: Interest makes you pay back MORE than you borrowed [CORRECT]
Penny: "Borrow $100, you might repay $110! That's interest! 📈"

Q: "What's the BEST use of $50?"
A: Invest in a business that earns monthly income [CORRECT]
Penny: "Investing makes money GROW! Sneakers lose value, businesses gain it! 🌱"

Q: "What is an emergency fund?"
A: Savings for unexpected problems [CORRECT]
Penny: "Life throws surprises! An emergency fund keeps you safe. 🛡️"

Q: "Which grows faster over time?"
A: Money invested that earns compound interest [CORRECT]
Penny: "Compound interest is like a snowball — it grows faster and faster! ❄️➡️⛄"

Q: "What does 'financial freedom' mean?"
A: Your investments pay all your bills [CORRECT]
Penny: "When passive income covers expenses, you're FREE to choose! 🦋"

Q: "What's a budget?"
A: A plan for how to spend and save money [CORRECT]
Penny: "A budget tells every dollar where to go! 🗺️"

Q: "Why save before you spend?"
A: It builds a safety net and lets money grow [CORRECT]
Penny: "Pay yourself FIRST! Save, then spend what's left. 🐷"

(+ 7 more in the actual data file)
```

---

## 11. Bot AI System

### 11.1 Bot Profiles

```
🐢 Careful Chloe (conservative):
  - Buys only assets she can afford in full cash
  - Prefers cheapest available asset
  - Always deposits into savings when at Bank
  - Never buys temptations
  - Pays debt immediately when able

🦁 Bold Ben (aggressive):
  - Takes loans for expensive assets (highest income)
  - Skips savings entirely
  - Occasionally buys temptations (20% chance)
  - Pays debt only when forced
  - Goes for Tier 3 assets early

🦉 Smart Sam (balanced):
  - Calculates best ROI (income / cost ratio)
  - Uses loans strategically (only if ROI > loan cost)
  - Saves 30% of excess cash at Bank
  - Never buys temptations
  - Pays debt aggressively when it blocks investment
```

### 11.2 Bot Decision Logic

```typescript
function botDecideInvest(bot: Player): { asset: Asset, useLoan: boolean } | null {
  if (bot.debt > 0) return null; // Can't buy with debt
  
  const owned = new Set(bot.assets.map(a => a.id));
  const available = ASSETS.filter(a => !owned.has(a.id));
  
  switch (bot.personality) {
    case 'conservative':
      return available
        .filter(a => bot.cash >= a.cost)
        .sort((a, b) => a.cost - b.cost)[0] 
        ? { asset: ..., useLoan: false } : null;
    
    case 'aggressive':
      return available
        .filter(a => bot.cash >= ceil(a.cost * 0.3))
        .sort((a, b) => b.income - a.income)[0]
        ? { asset: ..., useLoan: bot.cash < asset.cost } : null;
    
    case 'balanced':
      return available
        .filter(a => bot.cash >= ceil(a.cost * 0.3))
        .sort((a, b) => (b.income/b.cost) - (a.income/a.cost))[0]
        ? { asset: ..., useLoan: bot.cash < asset.cost } : null;
  }
}
```

---

## 12. UI/UX Specifications

### 12.1 Design Tokens

```css
/* Colors */
--gold-500: #f59e0b;       /* Primary — money, wealth */
--gold-900: #78350f;       /* Text on gold */
--emerald-500: #10b981;    /* Growth, positive, income */
--rose-500: #f43f5e;       /* Danger, debt, negative */
--indigo-500: #6366f1;     /* Bank, savings */
--purple-500: #8b5cf6;     /* Hustle, active income */
--pink-500: #ec4899;       /* Temptation */
--cyan-500: #06b6d4;       /* Quiz, knowledge */
--slate-800: #1e293b;      /* Primary text */
--slate-400: #94a3b8;      /* Secondary text */

/* Typography */
--font-display: 'Baloo 2', cursive;   /* Headings, buttons */
--font-body: system-ui, sans-serif;    /* Body text */

/* Spacing */
--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 28px;

/* Shadows */
--shadow-card: 0 4px 20px rgba(0,0,0,0.08);
--shadow-heavy: 0 8px 40px rgba(0,0,0,0.12);
```

### 12.2 Core UI Components

**Bottom Sheet (modals):**
- Rounded top corners (28px)
- Max height 88vh
- Color stripe at top (2px, matches space color)
- Drag handle (10×4px rounded pill, centered)
- Slide up animation (0.35s cubic-bezier)
- Tap-outside to dismiss (close → phase = "end")
- Scrollable content area

**Action Bar (bottom sticky):**
- Glass effect background (white 75% + blur 12px)
- Border top amber/200
- Contains: dice, player info, action button
- Height: ~80px + safe area
- Always visible during gameplay

**Player Row:**
- Progress ring around avatar (SVG circle)
- Name, cash, debt, passive income
- Business slots (3 dots, filled = owned)
- Active player gets: border highlight, "TURN" badge, subtle pop animation

**Coin Animation:**
- Fixed position, center of screen
- Drops from above (coinDrop animation)
- Green = positive, Red = negative
- Duration: 0.8s, then fades

### 12.3 Responsive Breakpoints

```
Mobile (primary):    320px — 428px width  (iPhone SE to iPhone Pro Max)
Tablet:              429px — 768px width  (iPad mini)
Desktop (secondary): 769px+ (centered, max-width 480px container)
```

### 12.4 Sound Design

```
sounds/
├── dice-roll.mp3        # Rattle + click (1.2s)
├── dice-land.mp3        # Solid thud (0.3s)
├── coin-gain.mp3        # Cha-ching (0.5s)
├── coin-loss.mp3        # Descending tone (0.4s)
├── move-step.mp3        # Light tap per space (0.1s)
├── modal-open.mp3       # Whoosh up (0.3s)
├── button-tap.mp3       # Subtle click (0.1s)
├── penny-appear.mp3     # Playful boing (0.3s)
├── quiz-correct.mp3     # Happy ding (0.4s)
├── quiz-wrong.mp3       # Gentle buzz (0.3s)
├── win-fanfare.mp3      # Celebration (3s)
└── payday-jingle.mp3    # Cash register (1s)
```

All sounds: toggle on/off in settings. Default: ON.

---

## 13. Turn System — Detailed State Machine

```
States:
  idle          → Waiting for human to roll (or bot auto-start)
  rolling       → Dice animation playing
  moving        → Token animating across board
  penny_speak   → Penny is talking (brief, non-blocking)
  modal_open    → Bottom sheet visible, waiting for player choice
  action_done   → Player made choice, showing result
  turn_end      → "Next →" button visible
  bot_acting    → Bot auto-playing (visible to all)

Transitions:
  idle → rolling:       Human taps "Roll!" / Bot auto-triggers
  rolling → moving:     Dice lands (after 1.2s)
  moving → modal_open:  Token arrives at space (after movement anim)
  moving → turn_end:    If space has no action (street-type)
  modal_open → action_done: Player makes choice
  action_done → turn_end:   After result display (1s)
  turn_end → idle:      "Next →" tapped, turn index advances
  
  At any state, Penny may speak (non-blocking overlay)
```

---

## 14. Progression & Levels

### 14.1 Short-term (V1 — single game)
- Freedom % bar progresses throughout the game
- Average game length: 15-25 minutes (target)
- Kids feel accomplishment even if they don't win (Impulse Score, Net Worth growth)

### 14.2 Mid-term (V2 — meta-progression)
```
XP System:
  - Win a game: +100 XP
  - Complete a game: +50 XP
  - Perfect quiz in a game: +30 XP
  - Resist all temptations: +25 XP

Player Levels:
  1. Piggy Banker (0 XP)
  2. Smart Saver (200 XP)
  3. Young Investor (500 XP)
  4. Business Kid (1000 XP)
  5. Money Master (2000 XP)
  6. Financial Freedom Champion (5000 XP)

Level Rewards:
  - New avatars
  - New board themes
  - New difficulty modes
  - New businesses unlock
```

### 14.3 Long-term (V3+ — content seasons)
```
Seasonal Content Packs:
  - "Summer Hustle" (new hustles, beach-themed events)
  - "Holiday Market" (Christmas-themed businesses)
  - "School's Out" (summer break events)
  - "Spooky Business" (Halloween theme)

Advanced Modes:
  - "Real Estate Rush" (houses instead of businesses)
  - "Stock Market" (buy/sell shares, price fluctuation)
  - "Startup Sprint" (high risk/reward, funding rounds)
  - "Family Budget" (manage a household budget)
```

---

## 15. Monetisation & Pricing

### 15.1 Freemium Model

**FREE (forever):**
- Standard difficulty
- 1 bot opponent
- Basic Penny (pre-written phrases)
- 5 quizzes (rotating)
- All core mechanics

**PREMIUM ($2.99/mo or $19.99/yr or $49.99 lifetime):**
- All difficulty modes
- Up to 3 bot opponents
- AI Penny (Claude-powered, contextual)
- 15+ quizzes
- Extra businesses (Tier 3)
- Advanced stats & reports
- No ads (if we add ads to free tier later)
- XP system & levels
- Seasonal content

### 15.2 RevenueCat Setup

```
Products:
  - kc_monthly: $2.99/mo (auto-renew)
  - kc_annual: $19.99/yr (auto-renew, "Save 44%")
  - kc_lifetime: $49.99 (one-time, highlighted)

Entitlements:
  - "premium" → unlocks all premium features

Parental Gate:
  - Before showing any purchase screen
  - Simple math: "What is 17 × 3?" (changes each time)
  - Wrong answer = denied access
```

### 15.3 Revenue Projections (Conservative)

```
Month 1-3: Build + soft launch
Month 4: 500 downloads (organic + social)
Month 5: 1,000 downloads
Month 6: 2,500 downloads
Month 12: 10,000 downloads

Conversion rate: 5% (education apps avg)
Monthly ARPU: $2.50 (mix of monthly/annual)

Month 6 MRR: 2,500 × 5% × $2.50 = $312
Month 12 MRR: 10,000 × 5% × $2.50 = $1,250
Month 18 MRR: 25,000 × 7% × $2.50 = $4,375
```

---

## 16. Database Schema (Supabase)

```sql
-- Users (parents)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  language TEXT DEFAULT 'en',
  sound_enabled BOOLEAN DEFAULT true
);

-- Player profiles (kids under one parent)
CREATE TABLE player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_temptations_resisted INTEGER DEFAULT 0,
  total_quiz_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Game sessions (for stats & resume)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_profile_id UUID REFERENCES player_profiles(id),
  difficulty TEXT DEFAULT 'standard',
  bot_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'in_progress', -- in_progress, won, lost
  month_reached INTEGER DEFAULT 1,
  final_cash INTEGER,
  final_net_worth INTEGER,
  final_passive_income INTEGER,
  temptations_bought INTEGER DEFAULT 0,
  temptations_skipped INTEGER DEFAULT 0,
  quiz_correct INTEGER DEFAULT 0,
  quiz_total INTEGER DEFAULT 0,
  game_state JSONB, -- Full serialized game state for resume
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Leaderboard (global)
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_profile_id UUID REFERENCES player_profiles(id),
  game_session_id UUID REFERENCES game_sessions(id),
  score INTEGER NOT NULL, -- Calculated composite score
  months_to_freedom INTEGER,
  net_worth INTEGER,
  impulse_score REAL, -- skipped / (skipped + bought)
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 17. Auth & Parental Controls

### 17.1 Auth Flow
1. First launch → Guest mode (no account needed, play immediately)
2. To save progress / access premium → "Create Account" (parent email)
3. Supabase Auth with email + password
4. Email verification required
5. One parent account can have multiple player profiles (kids)

### 17.2 Parental Gate
- Required before: purchase screen, account creation, settings changes
- Implementation: Random math problem (e.g., "What is 23 × 4?")
- 3-digit multiplication = hard for kids 8-10, easy for parents
- New problem each time (not memorizable)

### 17.3 COPPA Compliance
- No personal data collected from children
- Parent creates the account
- No social features in V1 (no chat, no friending)
- Analytics are anonymous (no PII)
- Privacy policy on website + in-app

---

## 18. Analytics & KPIs

### 18.1 Key Events

```
game_started       { difficulty, bot_count }
game_ended         { won, months_played, net_worth, freedom_pct }
asset_purchased    { asset_id, used_loan, cash_remaining }
temptation_bought  { item_name, cost }
temptation_skipped { item_name, cost }
quiz_answered      { correct, question_id }
payday_collected   { net_amount, passive_income }
penny_dismissed    { message_type, time_visible_ms }
subscription_started { plan, price }
subscription_cancelled { plan, months_active }
```

### 18.2 KPIs to Track

| KPI | Target | Why |
|-----|--------|-----|
| D1 Retention | >40% | First day back |
| D7 Retention | >20% | Weekly habit |
| Avg session length | 12-20 min | Sweet spot for kids |
| Games per session | 1.2 | Slight replay |
| Free → Trial | >8% | Funnel conversion |
| Trial → Paid | >40% | Paywall quality |
| Monthly churn | <10% | Retention |
| Temptation skip rate | Track | Educational impact metric |
| Quiz accuracy | Track | Learning measurement |

---

## 19. Marketing Strategy

### 19.1 Positioning
"The fun board game that teaches your kids real money skills."

### 19.2 Channels

**Organic (Free):**
- App Store Optimization (ASO): keywords "kids finance game", "money game for kids", "financial literacy children"
- TikTok: short gameplay clips, "watch my kid learn about investing"
- Instagram: parent-focused educational content
- Reddit: r/parenting, r/financialindependence, r/boardgames
- Product Hunt: launch day spike
- YouTube: "KidCapital gameplay" + "teaching kids about money"

**Paid (Once we have revenue):**
- Meta Ads: target parents 30-45, interest: parenting + finance
- Apple Search Ads: "kids money game", "financial literacy app"
- Influencer: micro-influencers in parenting/education space (gifted access)

### 19.3 Launch Strategy

```
Week -4: Beta with 50 families (TestFlight + Google Beta)
Week -2: Collect feedback, fix bugs, polish
Week -1: Submit to App Store + Google Play
Week 0: LAUNCH
  - Product Hunt post
  - Reddit posts (genuine, not spammy)
  - TikTok gameplay video
  - Email to beta families → ask for reviews
Week 1-4: Iterate based on analytics
  - Fix retention gaps
  - A/B test paywall
  - Respond to all reviews
```

---

## 20. Roadmap & Milestones

### Phase 1: MVP (Weeks 1-4)
```
Week 1:
  ☐ Project scaffold (Vite + React + TS + Tailwind + Zustand)
  ☐ Types & data files (all game content)
  ☐ Financial Engine (pure functions, tested)
  ☐ Supabase setup (tables, auth, edge functions)
  
Week 2:
  ☐ Game screens (Splash, Setup, Game, End)
  ☐ Board component + movement
  ☐ Dice component + animation
  ☐ Turn state machine
  ☐ All modal types (Bottom sheets)

Week 3:
  ☐ Penny system (fallback phrases + UI)
  ☐ Bot AI (3 personalities)
  ☐ Sound effects integration
  ☐ Payday income report
  ☐ Win condition + end screen

Week 4:
  ☐ Capacitor integration (iOS + Android)
  ☐ RevenueCat integration
  ☐ Parental gate
  ☐ Save/resume game
  ☐ Polish, bugs, performance
```

### Phase 2: Launch + Iterate (Weeks 5-8)
```
  ☐ Beta test (50 families)
  ☐ App Store submission
  ☐ Marketing launch
  ☐ Analytics dashboard
  ☐ A/B test paywall
  ☐ Claude AI Penny integration (premium)
  ☐ i18n: French, Spanish
```

### Phase 3: Growth (Months 3-6)
```
  ☐ XP + Level system
  ☐ Leaderboards
  ☐ Medium + Hard difficulty
  ☐ 10 more quiz questions
  ☐ 5 more businesses
  ☐ Daily challenges
  ☐ Push notifications ("Your businesses miss you!")
```

### Phase 4: Expansion (Months 6-12)
```
  ☐ Local multiplayer (pass & play)
  ☐ Seasonal content packs
  ☐ Stock Market mode
  ☐ Real Estate mode
  ☐ Classroom/school license
  ☐ Web version (Vercel)
  ☐ Family dashboard (parent sees kid's learning stats)
```

---

## 21. Known Bugs to Fix from V3 Prototype

1. **Bot turns sometimes overlap** — need strict sequential turn lock
2. **Payday modal shows stale data** — calcFinancials() must read from latest state
3. **Board doesn't always scroll to active player** — scrollIntoView timing issue
4. **Penny speaks too fast after actions** — add 1s delay before Penny appears
5. **Dice result not always visible** — ensure 1.5s pause between roll and move
6. **Temptation can be bought with insufficient cash** — add proper validation
7. **Game can end during bot turn without clear notification**
8. **Multiple modals can stack if player taps fast** — add phase lock
9. **No "back" button on setup screen** — add navigation
10. **Freedom % calculation edge case when totalExpenses = 0**
