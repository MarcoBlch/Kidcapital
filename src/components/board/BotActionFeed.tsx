import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';

export default function BotActionFeed() {
    const turnLog = useUIStore(s => s.turnLog);
    const latestMessage = turnLog[turnLog.length - 1] || null;

    return (
        <div className="flex flex-col items-center gap-1.5 max-w-[180px]">
            <AnimatePresence mode="wait">
                {latestMessage && (
                    <motion.div
                        key={`${turnLog.length}-${latestMessage}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl px-3 py-1.5 text-center leading-snug"
                        style={{
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <span
                            className="text-[10px] md:text-xs font-medium"
                            style={{ color: 'rgba(255,255,255,0.85)' }}
                        >
                            {latestMessage}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pulsing dots indicator */}
            <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#FFD700' }}
                    />
                ))}
            </div>
        </div>
    );
}
