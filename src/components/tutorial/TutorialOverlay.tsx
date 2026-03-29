import { motion, AnimatePresence } from 'framer-motion';
import { useTutorialStore } from '../../store/tutorialStore';
import { useTranslation } from 'react-i18next';
import PennyAvatar from '../ui/PennyAvatar';

export default function TutorialOverlay() {
    const { t } = useTranslation();
    const isActive = useTutorialStore(s => s.isActive);
    const getCurrentStep = useTutorialStore(s => s.getCurrentStep);
    const nextStep = useTutorialStore(s => s.nextStep);
    const completeTutorial = useTutorialStore(s => s.completeTutorial);
    const currentStepIndex = useTutorialStore(s => s.currentStepIndex);

    const step = getCurrentStep();

    if (!isActive || !step) return null;

    const isWaitingForTap = step.waitFor === 'tap';
    const totalSteps = 8; // TUTORIAL_STEPS.length

    const cardPosition = !isWaitingForTap || step.bubblePosition === 'below'
        ? 'items-end pb-24'
        : step.bubblePosition === 'above'
            ? 'items-start pt-24'
            : 'items-center';

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={step.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`fixed inset-0 z-100 flex justify-center ${cardPosition} ${!isWaitingForTap ? 'pointer-events-none' : ''}`}
                onClick={isWaitingForTap ? nextStep : undefined}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.6)' }} />

                {/* Tutorial card */}
                <motion.div
                    initial={{ scale: 0.85, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="relative z-[101] mx-6 max-w-sm w-full pointer-events-auto"
                    onClick={e => e.stopPropagation()}
                >
                    <div
                        className="rounded-3xl overflow-hidden"
                        style={{
                            background: '#FFFFFF',
                            border: '3px solid #FFD700',
                            boxShadow: '0 8px 0 #B8860B, 0 12px 40px rgba(0,0,0,0.2)',
                        }}
                    >
                        {/* Progress dots */}
                        <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-1 rounded-full transition-all duration-300"
                                    style={{
                                        width: i === currentStepIndex ? 20 : 8,
                                        background: i === currentStepIndex
                                            ? '#FFD700'
                                            : i < currentStepIndex
                                                ? 'rgba(255,215,0,0.4)'
                                                : '#E0E0E0',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Penny avatar */}
                        <div className="flex justify-center pt-2 pb-1">
                            <motion.div
                                animate={{ rotate: [0, -5, 5, -3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <PennyAvatar pose="teach" size={64} showBubble />
                            </motion.div>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-2 text-center">
                            <h3 className="font-display text-lg mb-2" style={{ color: '#DAA520' }}>
                                {t(`tutorial.${step.id}_title`, { defaultValue: step.title })}
                            </h3>
                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5D5D6E' }}>
                                {t(`tutorial.${step.id}_msg`, { defaultValue: step.message })}
                            </p>
                        </div>

                        {/* Action area */}
                        <div className="px-6 pb-5 pt-3">
                            {isWaitingForTap ? (
                                <motion.button
                                    whileTap={{ y: 4 }}
                                    onClick={nextStep}
                                    className="w-full py-3 rounded-2xl font-display text-sm font-bold cursor-pointer transition-all"
                                    style={{
                                        background: '#FFD700',
                                        color: '#4A3800',
                                        boxShadow: '0 5px 0 #B8860B, 0 8px 16px rgba(0,0,0,0.15)',
                                    }}
                                >
                                    {currentStepIndex === totalSteps - 1 ? t('tutorial.lets_go') : t('tutorial.got_it')}
                                </motion.button>
                            ) : (
                                <div className="text-center">
                                    <p className="text-[11px] font-medium animate-pulse" style={{ color: '#DAA520' }}>
                                        {step.waitFor === 'roll' && t('tutorial.wait_roll')}
                                        {step.waitFor === 'modal_close' && t('tutorial.wait_modal')}
                                        {step.waitFor === 'next_turn' && t('tutorial.wait_next')}
                                    </p>
                                </div>
                            )}

                            {/* Skip button */}
                            <button
                                onClick={completeTutorial}
                                className="mt-3 w-full text-center text-[10px] transition-colors cursor-pointer"
                                style={{ color: '#9E9EAF' }}
                            >
                                {t('tutorial.skip')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
