import type { PennyMessage } from '../types';
import i18n from '../i18n/config';

// ============================================
// KidCapital — Penny Fallback Phrases
// Used when offline or on free tier
// Max 25 words per message
// ============================================

export const PENNY_PHRASES: PennyMessage[] = [
    {
        trigger: 'game_start',
        messages: [
            "Hi! I'm Penny! Let's become Money Masters together! 🐷",
            "Welcome to KidCapital! Roll the dice and start your journey to Financial Freedom! 💰",
        ],
    },
    {
        trigger: 'first_roll',
        messages: [
            'Tap the dice to roll! See where you land! 🎲',
            "Here we go! Roll and let's see your first move! 🎯",
        ],
    },
    {
        trigger: 'land_invest',
        messages: [
            'An Invest space! Businesses earn money FOR you every Payday! 🏪',
            'Time to shop for a business! Which one will make you money? 🤑',
            'Investing means your money works while you play! 📈',
        ],
    },
    {
        trigger: 'first_asset_buy',
        messages: [
            "You're an investor now! That business will earn you passive income! 🎉",
            "Your first business! Now you'll earn money every Payday! 🌟",
        ],
    },
    {
        trigger: 'buy_with_loan',
        messages: [
            'Loans cost extra because of interest. Pay it off fast! 💳',
            "You borrowed money — that's debt. It'll be deducted each Payday! ⚠️",
        ],
    },
    {
        trigger: 'cant_buy_debt',
        messages: [
            "Can't invest while in debt! Pay it off first — it's blocking your growth! 🚫",
            'Debt first, then investing! Clear what you owe to unlock new businesses! 🔓',
        ],
    },
    {
        trigger: 'payday_positive',
        messages: [
            'Nice! Your businesses earned you passive income this month! 📊',
            "More income than expenses — that's the path to freedom! ✨",
            'Your investments are paying off! Keep building! 💪',
        ],
    },
    {
        trigger: 'payday_negative',
        messages: [
            "Expenses beat income this month. We need more businesses! 📉",
            "Spending more than earning? That's a money leak to fix! 🔧",
        ],
    },
    {
        trigger: 'temptation_skipped',
        messages: [
            "Great self-control! That money can now GROW in a business! 🌱",
            'Smart choice! Wants can wait — your future self says thanks! 💎',
            'Resisting temptation is a superpower! Your wallet agrees! 🦸',
        ],
    },
    {
        trigger: 'temptation_bought',
        messages: [
            "Fun! But remember — spent money can't grow anymore. 💸",
            "Enjoy it! Just know that cash could've earned passive income. 🤷",
        ],
    },
    {
        trigger: 'hustle',
        messages: [
            "That's ACTIVE income — you worked for every dollar! 💼",
            'Hard work pays off! But remember: businesses earn while you rest! 🛌',
            'Nice hustle! Active income keeps you going! 💪',
        ],
    },
    {
        trigger: 'quiz_correct',
        messages: [
            "You're a money genius! Here's a bonus! 🧠💰",
            'Correct! Knowledge IS power — and cash! 🎓',
        ],
    },
    {
        trigger: 'quiz_wrong',
        messages: [
            "Not quite! But now you know — that's what learning is! 📖",
            "Oops! That's okay — every money mistake is a lesson! 💡",
        ],
    },
    {
        trigger: 'bank_deposit',
        messages: [
            'Your savings earn 5% interest each Payday! Compound growth! 🏦',
            "Money in the bank makes MORE money. That's compound interest! ❄️⛄",
        ],
    },
    {
        trigger: 'low_cash',
        messages: [
            "Running low on cash! Focus on Payday spaces & hustles! 💸",
            "Budget alert! Every dollar counts when cash is tight! 📋",
        ],
    },
    {
        trigger: 'near_freedom',
        messages: [
            "Almost there! One more investment could do it! 🏁",
            "SO close to Financial Freedom! Your passive income is almost enough! 🔥",
        ],
    },
    {
        trigger: 'win',
        messages: [
            'FINANCIAL FREEDOM! Your money works FOR you! You did it! 🏆🎉',
            "YOU'RE FREE! Passive income covers all your bills! AMAZING! 🦋✨",
        ],
    },
    {
        trigger: 'life_event_good',
        messages: [
            'Lucky break! But smart investors don\'t rely on luck! 🍀',
            'Bonus cash! Maybe save or invest it? 🤔',
        ],
    },
    {
        trigger: 'life_event_bad',
        messages: [
            "Life happens! That's why an emergency fund matters! 🛡️",
            "Unexpected costs are part of life. Savings protect you! 💪",
        ],
    },
    {
        trigger: 'generic',
        messages: [
            "Keep going! Every turn is a step toward freedom! 🚶",
            "Remember: passive income is the goal! 🎯",
            "You're learning real money skills! 📚",
        ],
    },
];

export function getPennyPhrase(trigger: string): string {
    const group = PENNY_PHRASES.find(p => p.trigger === trigger)
        ?? PENNY_PHRASES.find(p => p.trigger === 'generic')!;
    const index = Math.floor(Math.random() * group.messages.length);
    const key = `penny.${trigger}_${index}`;
    return i18n.t(key, { defaultValue: group.messages[index] });
}
