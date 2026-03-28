import { motion } from 'framer-motion';
import type { Space } from '../../types';
import AvatarImage from '../ui/AvatarImage';
import { useTranslation } from 'react-i18next';

const SPACE_COLORS: Record<string, { bg: string; border: string; shadow: string; text: string }> = {
    invest:     { bg: '#4CAF50', border: '#2E7D32', shadow: '#1B5E20', text: '#fff' },
    payday:     { bg: '#FFC107', border: '#FF8F00', shadow: '#E65100', text: '#4A3800' },
    life:       { bg: '#FF7043', border: '#D84315', shadow: '#BF360C', text: '#fff' },
    hustle:     { bg: '#AB47BC', border: '#7B1FA2', shadow: '#6A1B9A', text: '#fff' },
    temptation: { bg: '#EC407A', border: '#AD1457', shadow: '#880E4F', text: '#fff' },
    challenge:  { bg: '#42A5F5', border: '#1565C0', shadow: '#0D47A1', text: '#fff' },
    bank:       { bg: '#5C6BC0', border: '#283593', shadow: '#1A237E', text: '#fff' },
    start:      { bg: '#FFC107', border: '#FF8F00', shadow: '#E65100', text: '#4A3800' },
};

interface SpaceTileProps {
    space: Space;
    isActive: boolean;
    playersOnSpace: { avatar: string; id: number; isActive: boolean }[];
    style?: React.CSSProperties;
}

export default function SpaceTile({ space, isActive, playersOnSpace, style }: SpaceTileProps) {
    const { t } = useTranslation();
    const colors = SPACE_COLORS[space.type] ?? SPACE_COLORS.start;

    return (
        <motion.div
            animate={isActive ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative flex flex-col items-center justify-center"
            style={{
                ...style,
                borderRadius: 12,
                background: colors.bg,
                border: isActive ? `2.5px solid #FFD700` : `2px solid ${colors.border}`,
                boxShadow: isActive
                    ? `0 4px 0 ${colors.shadow}, 0 0 12px rgba(255,215,0,0.3)`
                    : `0 4px 0 rgba(0,0,0,0.2)`,
                zIndex: isActive ? 10 : 1,
            }}
            data-space-index={space.index}
        >
            <span className="text-base md:text-lg leading-none">
                {space.icon}
            </span>
            <span
                className="text-[7px] md:text-[8px] font-bold uppercase tracking-tight leading-none mt-0.5 text-center px-0.5"
                style={{ color: colors.text }}
            >
                {t(`board.${space.type}`, { defaultValue: space.label })}
            </span>

            {/* Player tokens — positioned absolutely on the tile */}
            {playersOnSpace.length > 0 && (
                <div className="absolute -bottom-1.5 -right-1.5 flex -space-x-1.5 z-20">
                    {playersOnSpace.map((p) => (
                        <div
                            key={p.id}
                            className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center overflow-hidden"
                            style={{
                                border: p.isActive ? '2px solid #FFD700' : '2px solid rgba(255,255,255,0.8)',
                                background: p.isActive ? 'rgba(255,215,0,0.25)' : 'rgba(0,0,0,0.35)',
                                boxShadow: p.isActive
                                    ? '0 0 6px rgba(255,215,0,0.5), 0 2px 4px rgba(0,0,0,0.3)'
                                    : '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            <AvatarImage avatar={p.avatar} size={16} />
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
