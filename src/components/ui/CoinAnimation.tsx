import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { uiCoin } from '../../assets/game';

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
                className="font-display text-2xl font-extrabold px-5 py-3 rounded-2xl flex items-center gap-2"
                style={{
                    color: isPositive ? '#2E7D32' : '#C62828',
                    background: isPositive ? '#E8F5E9' : '#FFEBEE',
                    border: `2px solid ${isPositive ? '#4CAF50' : '#EF5350'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
            >
                <img src={uiCoin} alt="coin" width={28} height={28} className="object-contain" />
                {display}
            </div>
        </motion.div>
    );
}
