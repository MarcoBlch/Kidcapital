import { motion } from 'framer-motion';
import AvatarImage from '../ui/AvatarImage';

interface PlayerTokenProps {
    avatar: string;
    isActive: boolean;
    index: number;
}

export default function PlayerToken({ avatar, isActive, index }: PlayerTokenProps) {
    return (
        <motion.div
            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
            className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden"
            style={{
                border: isActive ? '2.5px solid #FFD700' : '2.5px solid rgba(255,255,255,0.4)',
                background: isActive ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.2)',
                boxShadow: isActive
                    ? '0 2px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(255,215,0,0.3)'
                    : '0 2px 0 rgba(0,0,0,0.15)',
                zIndex: 10 - index,
            }}
        >
            <AvatarImage avatar={avatar} size={18} />
        </motion.div>
    );
}
