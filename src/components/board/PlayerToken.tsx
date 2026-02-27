import { motion } from 'framer-motion';

interface PlayerTokenProps {
    avatar: string;
    isActive: boolean;
    index: number;
}

export default function PlayerToken({ avatar, isActive, index }: PlayerTokenProps) {
    return (
        <motion.div
            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
            className={`
                w-7 h-7 rounded-full flex items-center justify-center text-sm
                border-2 transition-all duration-200
                ${isActive
                    ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-white/10 border-white/20'
                }
            `}
            style={{ zIndex: 10 - index }}
        >
            {avatar}
        </motion.div>
    );
}
