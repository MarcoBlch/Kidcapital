import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { BOTS } from '../data/bots';
import { PLAYER_AVATARS, MAX_NAME_LENGTH } from '../utils/constants';
import type { BotPersonality, Difficulty } from '../types';

export default function SetupScreen() {
    const setScreen = useUIStore(s => s.setScreen);
    const initGame = useGameStore(s => s.initGame);

    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState<string>(PLAYER_AVATARS[0]);
    const [botCount, setBotCount] = useState(1);
    const [difficulty, setDifficulty] = useState<Difficulty>('11-14');

    const canStart = name.trim().length > 0;

    const handleStart = () => {
        const selectedBots = BOTS.slice(0, botCount).map(b => ({
            name: b.name,
            avatar: b.avatar,
            personality: b.personality as BotPersonality,
        }));

        initGame(name.trim(), avatar, selectedBots, difficulty);
        setScreen('game');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="min-h-dvh px-5 py-6 safe-top"
            style={{
                background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
        >
            <div className="max-w-md mx-auto">
                <h1 className="font-display text-3xl text-amber-400 mb-1 text-center tracking-tight">
                    🐷 New Game
                </h1>
                <p className="text-sm text-white/30 text-center mb-6">
                    Set up your player and pick opponents!
                </p>

                {/* Avatar selection */}
                <div className="mb-5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">
                        Choose your avatar
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                        {PLAYER_AVATARS.map(a => (
                            <button
                                key={a}
                                onClick={() => setAvatar(a)}
                                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                  transition-all cursor-pointer border-2
                  ${avatar === a
                                        ? 'bg-amber-400/15 border-amber-400/60 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }
                `}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name input */}
                <div className="mb-5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">
                        Your name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                        placeholder="Enter your name..."
                        maxLength={MAX_NAME_LENGTH}
                        className="
              w-full px-4 py-3 rounded-xl border-2 border-white/10
              bg-white/5 text-white font-medium placeholder-white/20
              focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20
              transition-all
            "
                    />
                    <p className="text-[10px] text-white/20 mt-1 text-right">
                        {name.length}/{MAX_NAME_LENGTH}
                    </p>
                </div>

                {/* Age Level */}
                <div className="mb-5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">
                        Player Age (Difficulty)
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDifficulty('8-10')}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 cursor-pointer ${difficulty === '8-10' ? 'bg-amber-400/15 border-amber-400/50 text-amber-300' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                        >
                            8-10 Years
                            <div className="text-[10px] font-normal opacity-70 mt-0.5">Easier start</div>
                        </button>
                        <button
                            onClick={() => setDifficulty('11-14')}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 cursor-pointer ${difficulty === '11-14' ? 'bg-amber-400/15 border-amber-400/50 text-amber-300' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                        >
                            11-14 Years
                            <div className="text-[10px] font-normal opacity-70 mt-0.5">Standard</div>
                        </button>
                    </div>
                </div>

                {/* Bot count */}
                <div className="mb-6">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">
                        Opponents ({botCount})
                    </label>
                    <div className="flex gap-2 mb-3">
                        {[1, 2, 3].map(n => (
                            <button
                                key={n}
                                onClick={() => setBotCount(n)}
                                className={`
                  flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border-2
                  ${botCount === n
                                        ? 'bg-amber-400/15 text-amber-300 border-amber-400/50'
                                        : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                                    }
                `}
                            >
                                {n} Bot{n > 1 ? 's' : ''}
                            </button>
                        ))}
                    </div>

                    {/* Bot previews */}
                    <div className="space-y-2">
                        {BOTS.slice(0, botCount).map(bot => (
                            <div
                                key={bot.id}
                                className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 border border-white/5"
                            >
                                <span className="text-2xl">{bot.avatar}</span>
                                <div>
                                    <div className="text-sm font-bold text-white">{bot.name}</div>
                                    <div className="text-[10px] text-white/30">{bot.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    disabled={!canStart}
                    className={`
            w-full py-3.5 rounded-2xl font-display text-base font-bold
            transition-all cursor-pointer
            ${canStart
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 shadow-glow-gold'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }
          `}
                >
                    🎲 Start Playing!
                </motion.button>
            </div>
        </motion.div>
    );
}
