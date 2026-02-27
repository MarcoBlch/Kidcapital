import { motion } from 'framer-motion';
import type { Space } from '../../types';
import PlayerToken from './PlayerToken';

const COLOR_MAP: Record<string, { bg: string; border: string; glow: string; text: string }> = {
    amber: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', glow: '0 0 16px rgba(245,158,11,0.5)', text: '#fcd34d' },
    emerald: { bg: 'rgba(16,185,129,0.15)', border: '#10b981', glow: '0 0 16px rgba(16,185,129,0.5)', text: '#6ee7b7' },
    rose: { bg: 'rgba(244,63,94,0.15)', border: '#f43f5e', glow: '0 0 16px rgba(244,63,94,0.5)', text: '#fda4af' },
    purple: { bg: 'rgba(139,92,246,0.15)', border: '#8b5cf6', glow: '0 0 16px rgba(139,92,246,0.5)', text: '#c4b5fd' },
    pink: { bg: 'rgba(236,72,153,0.15)', border: '#ec4899', glow: '0 0 16px rgba(236,72,153,0.5)', text: '#f9a8d4' },
    cyan: { bg: 'rgba(6,182,212,0.15)', border: '#06b6d4', glow: '0 0 16px rgba(6,182,212,0.5)', text: '#67e8f9' },
    indigo: { bg: 'rgba(99,102,241,0.15)', border: '#6366f1', glow: '0 0 16px rgba(99,102,241,0.5)', text: '#a5b4fc' },
};

interface SpaceCardProps {
    space: Space;
    isActive: boolean;
    playersOnSpace: { avatar: string; id: number; isActive: boolean }[];
}

export default function SpaceCard({ space, isActive, playersOnSpace }: SpaceCardProps) {
    const colors = COLOR_MAP[space.color] ?? COLOR_MAP.amber;

    return (
        <motion.div
            layout
            animate={isActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
            data-space-index={space.index}
        >
            {/* Space card */}
            <div
                className={`
                    relative flex flex-col items-center justify-center rounded-2xl
                    border-2 transition-all duration-300
                    ${isActive ? 'space-glow' : ''}
                `}
                style={{
                    width: isActive ? 64 : 52,
                    height: isActive ? 72 : 58,
                    borderColor: isActive ? colors.border : 'rgba(255,255,255,0.1)',
                    backgroundColor: isActive ? colors.bg : 'rgba(255,255,255,0.05)',
                    boxShadow: isActive ? colors.glow : 'none',
                }}
            >
                <span className={`${isActive ? 'text-2xl' : 'text-xl'} leading-none transition-all`}>
                    {space.icon}
                </span>
                {/* Always show label */}
                <span
                    className="text-[8px] font-bold mt-1 leading-none text-center px-1"
                    style={{ color: isActive ? colors.text : 'rgba(255,255,255,0.35)' }}
                >
                    {space.label}
                </span>
            </div>

            {/* Player tokens below */}
            {playersOnSpace.length > 0 && (
                <div className="flex items-center justify-center -space-x-1.5">
                    {playersOnSpace.map((p, i) => (
                        <PlayerToken
                            key={p.id}
                            avatar={p.avatar}
                            isActive={p.isActive}
                            index={i}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
