import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rollDice } from '../../utils/helpers';
import { TIMING } from '../../utils/constants';

interface DiceRollerProps {
    onRollComplete: (result: number) => void;
    disabled: boolean;
}

const DOTS: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

export default function DiceRoller({ onRollComplete, disabled }: DiceRollerProps) {
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState<number | null>(null);
    const [displayFace, setDisplayFace] = useState(1);

    const handleRoll = useCallback(() => {
        if (isRolling || disabled) return;

        setIsRolling(true);
        setResult(null);

        // Animate through random faces
        const interval = setInterval(() => {
            setDisplayFace(rollDice());
        }, 80);

        // Settle on final result
        setTimeout(() => {
            clearInterval(interval);
            const finalResult = rollDice();
            setDisplayFace(finalResult);
            setResult(finalResult);
            setIsRolling(false);

            // Delay before callback to show result
            setTimeout(() => {
                onRollComplete(finalResult);
            }, TIMING.DICE_RESULT_DISPLAY);
        }, TIMING.DICE_ROLL);
    }, [isRolling, disabled, onRollComplete]);

    const face = result ?? displayFace;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="flex flex-col items-center gap-2"
                onClick={handleRoll}
            >
                {/* Dice */}
                <motion.div
                    animate={
                        isRolling
                            ? {
                                rotate: [0, 90, 180, 270, 360],
                                scale: [1, 1.1, 0.9, 1.1, 1],
                            }
                            : { rotate: 0, scale: 1 }
                    }
                    transition={
                        isRolling
                            ? { duration: 0.4, repeat: Infinity, ease: 'linear' }
                            : { type: 'spring', stiffness: 300, damping: 20 }
                    }
                    className={`
            relative w-16 h-16 rounded-xl border-2
            flex items-center justify-center cursor-pointer select-none
            transition-colors duration-200
            ${disabled
                            ? 'bg-slate-100 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-amber-300 shadow-card hover:shadow-heavy hover:border-amber-400 active:scale-95'
                        }
          `}
                >
                    {/* Dots */}
                    <svg width="48" height="48" viewBox="0 0 100 100">
                        {(DOTS[face] ?? DOTS[1]).map(([cx, cy], i) => (
                            <circle
                                key={i}
                                cx={cx}
                                cy={cy}
                                r="10"
                                fill={disabled ? '#94a3b8' : '#1e293b'}
                            />
                        ))}
                    </svg>
                </motion.div>

                {/* Result display */}
                {result && !isRolling && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-sm text-amber-600 font-bold"
                    >
                        You rolled {result}!
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
