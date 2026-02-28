import type { Challenge, Difficulty } from '../types';

// ============================================
// KidCapital — Financial Quiz Questions (15)
// Each has 4 options, 1 correct, + Penny explanation
// Reward: $10 for correct answer
// Difficulty dictates which age groups see the question
// ============================================

export const CHALLENGES: Challenge[] = [
    // --- 8-10 / Easy ---
    {
        id: 'q3',
        question: "What's the BEST use of $50?",
        options: [
            'Buy new sneakers',
            'Buy candy for a week',
            'Invest in a business that earns monthly income',
            'Hide it under your mattress',
        ],
        correctIndex: 2,
        pennyExplanation: 'Investing makes money GROW! Sneakers lose value, businesses gain it! 🌱',
        reward: 10,
        difficulty: '8-10',
    },
    {
        id: 'q4',
        question: 'What is an emergency fund?',
        options: [
            'Money for toys',
            'Savings for unexpected problems',
            'A type of bank account',
            'Money you owe someone',
        ],
        correctIndex: 1,
        pennyExplanation: 'Life throws surprises! An emergency fund keeps you safe. 🛡️',
        reward: 10,
        difficulty: '8-10',
    },
    {
        id: 'q10',
        question: "What's the difference between a NEED and a WANT?",
        options: [
            'Needs are always expensive',
            'Wants are things you must have',
            'Needs are essential, wants are nice-to-have',
            "There's no difference",
        ],
        correctIndex: 2,
        pennyExplanation: 'Food & shelter = needs. Video games = wants. Know the difference! 🤔',
        reward: 10,
        difficulty: '8-10',
    },
    {
        id: 'q8',
        question: 'Why save before you spend?',
        options: [
            'Because saving is boring',
            'To have more money for toys later',
            'It builds a safety net and lets money grow',
            "You shouldn't — spend it all!",
        ],
        correctIndex: 2,
        pennyExplanation: "Pay yourself FIRST! Save, then spend what's left. 🐷",
        reward: 10,
        difficulty: '8-10',
    },
    {
        id: 'q14',
        question: 'What happens if you only spend and never save?',
        options: [
            "You'll always be happy",
            "You'll have no money for emergencies or goals",
            'Nothing bad',
            'Your bank gives you more money',
        ],
        correctIndex: 1,
        pennyExplanation: 'Without savings, one surprise expense can knock you down! Save first! 💪',
        reward: 10,
        difficulty: '8-10',
    },

    // --- All Ages ---
    {
        id: 'q1',
        question: "What does 'passive income' mean?",
        options: [
            'Money earned without working every day',
            'Money from your job',
            'Money from the government',
            'Money you find on the street',
        ],
        correctIndex: 0,
        pennyExplanation: 'Assets generate passive income — money while you sleep! 💤💰',
        reward: 10,
        difficulty: 'all',
    },
    {
        id: 'q2',
        question: 'Why is debt dangerous?',
        options: [
            'It makes you popular',
            'Interest makes you pay back MORE than you borrowed',
            "It doesn't matter",
            'Banks give you free money',
        ],
        correctIndex: 1,
        pennyExplanation: 'Borrow $100, you might repay $110! That\'s interest! 📈',
        reward: 10,
        difficulty: 'all',
    },
    {
        id: 'q6',
        question: "What does 'financial freedom' mean?",
        options: [
            'Having $1 million',
            'Never spending money',
            'Your investments pay all your bills',
            'Getting stuff for free',
        ],
        correctIndex: 2,
        pennyExplanation: "When passive income covers expenses, you're FREE to choose! 🦋",
        reward: 10,
        difficulty: 'all',
    },
    {
        id: 'q7',
        question: "What's a budget?",
        options: [
            'A type of calculator',
            'A plan for how to spend and save money',
            'A credit card limit',
            'The price of a product',
        ],
        correctIndex: 1,
        pennyExplanation: 'A budget tells every dollar where to go! 🗺️',
        reward: 10,
        difficulty: 'all',
    },
    {
        id: 'q15',
        question: "What's the best way to pay off debt?",
        options: [
            'Ignore it',
            'Borrow more money',
            'Pay as much as you can, as fast as you can',
            'Wait for someone else to pay it',
        ],
        correctIndex: 2,
        pennyExplanation: 'The faster you pay debt, the less interest you owe! Speed matters! ⚡',
        reward: 10,
        difficulty: 'all',
    },

    // --- 11-14 / Harder ---
    {
        id: 'q5',
        question: 'Which grows faster over time?',
        options: [
            'Cash in a piggy bank',
            'Money invested that earns compound interest',
            'A pile of coins',
            'Stocks in a bad company',
        ],
        correctIndex: 1,
        pennyExplanation: 'Compound interest is like a snowball — it grows faster and faster! ❄️➡️⛄',
        reward: 10,
        difficulty: '11-14',
    },
    {
        id: 'q9',
        question: 'What is compound interest?',
        options: [
            'Interest on both your savings AND previous interest',
            'A type of bank fee',
            'Money the government takes',
            'Interest that decreases over time',
        ],
        correctIndex: 0,
        pennyExplanation: 'Your interest earns interest! That\'s the magic of compounding! ✨',
        reward: 10,
        difficulty: '11-14',
    },
    {
        id: 'q11',
        question: 'What makes a business profitable?',
        options: [
            'Having a cool name',
            'Revenue is greater than costs',
            'Having many employees',
            'Spending lots on advertising',
        ],
        correctIndex: 1,
        pennyExplanation: 'Profit = Revenue - Costs. Keep costs low and revenue high! 📊',
        reward: 10,
        difficulty: '11-14',
    },
    {
        id: 'q12',
        question: 'Why is insurance important?',
        options: [
            "It isn't important",
            'It protects you from big unexpected costs',
            'It makes you rich',
            "It's a way to avoid taxes",
        ],
        correctIndex: 1,
        pennyExplanation: 'Insurance is like a safety net — small payments now prevent big losses later! 🪢',
        reward: 10,
        difficulty: '11-14',
    },
    {
        id: 'q13',
        question: "What does 'diversify' mean in investing?",
        options: [
            'Put all your money in one business',
            'Stop investing entirely',
            'Spread money across different investments',
            'Only invest in what your friends invest in',
        ],
        correctIndex: 2,
        pennyExplanation: "Don't put all eggs in one basket! Spread your investments! 🥚🧺",
        reward: 10,
        difficulty: '11-14',
    },
];

export function getRandomChallenge(difficulty: Difficulty, excludeIds: string[] = []): Challenge {
    const excludeSet = new Set(excludeIds);
    const available = CHALLENGES.filter(c => !excludeSet.has(c.id) && (c.difficulty === 'all' || c.difficulty === difficulty));
    const pool = available.length > 0 ? available : CHALLENGES.filter(c => c.difficulty === 'all' || c.difficulty === difficulty);
    return pool[Math.floor(Math.random() * pool.length)];
}
