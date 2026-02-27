import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';

export default function CoinAnimation() {
    const coinAnimations = useUIStore(s => s.coinAnimations);
    const removeCoin = useUIStore(s => s.removeCoin);

    return (
        <AnimatePresence>
            {coinAnimations.map(coin => (
                <CoinDrop
                    key={coin.id}
                    amount={coin.amount}
                    onComplete={() => removeCoin(coin.id)}
                />
            ))}
        </AnimatePresence>
    );
}

function CoinDrop({
    amount,
    onComplete,
}: {
    amount: number;
    onComplete: () => void;
}) {
    const isPositive = amount >= 0;
    const display = isPositive ? `+$${amount}` : `-$${Math.abs(amount)}`;

    useEffect(() => {
        const timer = setTimeout(onComplete, 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.7 }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
            className="fixed left-1/2 top-1/3 -translate-x-1/2 z-50 pointer-events-none"
        >
            <div
                className={`
                    font-display text-2xl font-extrabold
                    px-5 py-3 rounded-2xl
                    ${isPositive
                        ? 'text-emerald-300 bg-emerald-500/15 border-2 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'text-rose-300 bg-rose-500/15 border-2 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    }
                `}
            >
                {isPositive ? '💰' : '💸'} {display}
            </div>
        </motion.div>
    );
}
