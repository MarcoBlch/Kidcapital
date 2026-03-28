import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { useDailyRewardStore } from '../store/dailyRewardStore';
import { BOTS } from '../data/bots';
import { PLAYER_AVATARS, MAX_NAME_LENGTH } from '../utils/constants';
import type { BotPersonality, Difficulty } from '../types';
import DailyRewardModal from '../components/modals/DailyRewardModal';
import LeaderboardModal from '../components/modals/LeaderboardModal';
import PaywallModal from '../components/modals/PaywallModal';
import AvatarImage from '../components/ui/AvatarImage';
import { useTranslation } from 'react-i18next';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';

export default function SetupScreen() {
    const { t, i18n } = useTranslation();
    const setScreen = useUIStore(s => s.setScreen);
    const showModal = useUIStore(s => s.showModal);
    const isPremium = useUIStore(s => s.isPremium);
    const initGame = useGameStore(s => s.initGame);

    const savedName = safeGetItem('kidcapital_player_name') || '';
    const [name, setName] = useState(savedName);
    const [avatar, setAvatar] = useState<string>(PLAYER_AVATARS[0]);
    const [botCount, setBotCount] = useState(1);
    const [difficulty, setDifficulty] = useState<Difficulty>('11-14');

    // Daily reward state
    const [rewardClaimed, setRewardClaimed] = useState(false);
    const checkDailyReward = useDailyRewardStore(s => s.checkDailyReward);
    const showDailyRewardModal = !rewardClaimed && checkDailyReward().isAvailable;
    const [dailyBonus, setDailyBonus] = useState(0);

    const canStart = name.trim().length > 0;

    const handleStart = () => {
        const finalName = name.trim();
        if (!savedName) {
            safeSetItem('kidcapital_player_name', finalName);
        }

        const selectedBots = BOTS.slice(0, botCount).map(b => ({
            name: b.name,
            avatar: b.avatar,
            personality: b.personality as BotPersonality,
        }));

        initGame(finalName, avatar, selectedBots, difficulty, dailyBonus);
        setScreen('game');
    };

    const difficultyColors: Record<string, { bg: string; border: string; text: string }> = {
        '8-10': { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32' },
        '11-14': { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' },
        '15-18': { bg: '#FFEBEE', border: '#EF5350', text: '#C62828' },
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="min-h-dvh w-full flex flex-col items-center px-5 md:px-12 lg:px-16 py-6 md:py-10 lg:py-14 safe-top"
            style={{ background: '#FFF8F0' }}
        >
            {showDailyRewardModal && (
                <DailyRewardModal
                    onClose={(bonusAmount) => {
                        setDailyBonus(bonusAmount);
                        setRewardClaimed(true);
                    }}
                />
            )}

            {/* Premium Upsell Button */}
            {!isPremium && (
                <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto mb-4 md:mb-6 flex justify-center">
                    <button
                        onClick={() => showModal('paywall' as any)}
                        className="font-bold px-4 md:px-6 py-1.5 md:py-2.5 rounded-full text-sm md:text-base cursor-pointer"
                        style={{
                            background: '#FFD700',
                            color: '#4A3800',
                            boxShadow: '0 4px 0 #B8860B, 0 6px 12px rgba(0,0,0,0.15)',
                        }}
                    >
                        {t('setup.get_premium')}
                    </button>
                </div>
            )}

            <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto relative">
                <button
                    onClick={() => showModal('leaderboard' as any)}
                    className="absolute right-0 top-1 w-10 h-10 rounded-full flex items-center justify-center text-xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                    style={{
                        background: '#FFD700',
                        border: '2px solid #DAA520',
                        boxShadow: '0 3px 0 #B8860B',
                    }}
                >
                    🏆
                </button>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-1 text-center tracking-tight pr-12" style={{ color: '#1A1A2E' }}>
                    {t('setup.title')}
                </h1>
                <p className="text-sm md:text-base lg:text-lg text-center mb-6 md:mb-8" style={{ color: '#9E9EAF' }}>
                    {t('setup.subtitle')}
                </p>

                {/* Avatar selection */}
                <div className="mb-5">
                    <label className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-widest mb-2 block" style={{ color: '#9E9EAF' }}>
                        {t('setup.avatar')}
                    </label>
                    <div className="grid grid-cols-5 gap-2 md:gap-4 lg:gap-5">
                        {PLAYER_AVATARS.map((a, index) => {
                            const isLocked = !isPremium && index > 3;
                            const isSelected = avatar === a;
                            return (
                                <button
                                    key={a}
                                    onClick={() => isLocked ? showModal('paywall' as any) : setAvatar(a)}
                                    className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center transition-all cursor-pointer mx-auto overflow-hidden"
                                    style={{
                                        background: isSelected ? '#FFF8E1' : isLocked ? '#F5F5F5' : '#FFFFFF',
                                        border: isSelected ? '3px solid #FFD700' : '2px solid #E0E0E0',
                                        boxShadow: isSelected ? '0 4px 0 #B8860B' : '0 2px 0 rgba(0,0,0,0.08)',
                                        opacity: isLocked ? 0.5 : 1,
                                        filter: isLocked ? 'grayscale(1)' : 'none',
                                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                                    }}
                                >
                                    <AvatarImage avatar={a} size={index < 4 ? 36 : 32} />
                                    {isLocked && (
                                        <div
                                            className="absolute -bottom-1 -right-1 text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
                                            style={{ background: '#5D5D6E', border: '1px solid #E0E0E0' }}
                                        >
                                            🔒
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Name input */}
                <div className="mb-5">
                    <label className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-widest mb-2 block" style={{ color: '#9E9EAF' }}>
                        {t('setup.name')}
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                        placeholder={t('setup.name_placeholder')}
                        maxLength={MAX_NAME_LENGTH}
                        className="w-full px-4 py-3 lg:px-5 lg:py-4 lg:text-lg rounded-xl font-medium transition-all"
                        style={{
                            background: '#FFFFFF',
                            border: '2px solid #E0E0E0',
                            color: '#1A1A2E',
                            outline: 'none',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#FFD700'; }}
                        onBlur={e => { e.target.style.borderColor = '#E0E0E0'; }}
                    />
                    <p className="text-[10px] mt-1 text-right" style={{ color: '#9E9EAF' }}>
                        {name.length}/{MAX_NAME_LENGTH}
                    </p>
                </div>

                {/* Age Level */}
                <div className="mb-5">
                    <label className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-widest mb-2 block" style={{ color: '#9E9EAF' }}>
                        {t('setup.difficulty')}
                    </label>
                    <div className="flex gap-2">
                        {(['8-10', '11-14', '15-18'] as Difficulty[]).map(diff => {
                            const isSelected = difficulty === diff;
                            const isLockedDiff = diff === '15-18' && !isPremium;
                            const dc = difficultyColors[diff];
                            const labels: Record<string, { label: string; desc: string }> = {
                                '8-10': { label: t('setup.diff_easy'), desc: t('setup.diff_easy_desc') },
                                '11-14': { label: t('setup.diff_med'), desc: t('setup.diff_med_desc') },
                                '15-18': { label: t('setup.diff_hard'), desc: t('setup.diff_hard_desc') },
                            };
                            return (
                                <button
                                    key={diff}
                                    onClick={() => isLockedDiff ? showModal('paywall' as any) : setDifficulty(diff)}
                                    className="relative flex-1 py-3 lg:py-4 rounded-xl font-bold transition-all cursor-pointer"
                                    style={{
                                        background: isSelected ? dc.bg : '#FFFFFF',
                                        border: `2px solid ${isSelected ? dc.border : '#E0E0E0'}`,
                                        color: isSelected ? dc.text : '#9E9EAF',
                                        boxShadow: isSelected ? `0 3px 0 ${dc.border}` : '0 2px 0 rgba(0,0,0,0.05)',
                                        opacity: isLockedDiff ? 0.6 : 1,
                                    }}
                                >
                                    <div className="text-sm lg:text-base">{labels[diff].label}</div>
                                    <div className="text-[10px] lg:text-xs font-normal opacity-70 mt-0.5">{labels[diff].desc}</div>
                                    {isLockedDiff && <div className="absolute top-1 right-1 text-[10px]">🔒</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bot count */}
                <div className="mb-6">
                    <label className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-widest mb-2 flex justify-between items-center" style={{ color: '#9E9EAF' }}>
                        <span>{t('setup.opponents')} ({botCount})</span>

                        {/* Language switcher */}
                        <div className="flex gap-1">
                            {['en', 'fr', 'es', 'pt', 'de'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => { i18n.changeLanguage(lang); safeSetItem('kidcapital_language', lang); }}
                                    className="px-1.5 py-0.5 rounded text-[10px] cursor-pointer"
                                    style={{
                                        background: i18n.language === lang ? '#FFD700' : 'transparent',
                                        color: i18n.language === lang ? '#4A3800' : '#9E9EAF',
                                        fontWeight: i18n.language === lang ? 700 : 400,
                                    }}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </label>
                    <div className="flex gap-2 mb-3">
                        {[1, 2, 3].map(n => {
                            const isLocked = !isPremium && n > 1;
                            const isSelected = botCount === n;
                            return (
                                <button
                                    key={n}
                                    onClick={() => isLocked ? showModal('paywall' as any) : setBotCount(n)}
                                    className="relative flex-1 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-bold transition-all cursor-pointer"
                                    style={{
                                        background: isSelected ? '#FFF8E1' : isLocked ? '#F5F5F5' : '#FFFFFF',
                                        color: isSelected ? '#DAA520' : isLocked ? '#9E9EAF' : '#5D5D6E',
                                        border: isSelected ? '2px solid #FFD700' : '2px solid #E0E0E0',
                                        boxShadow: isSelected ? '0 3px 0 #B8860B' : '0 2px 0 rgba(0,0,0,0.05)',
                                        opacity: isLocked ? 0.6 : 1,
                                    }}
                                >
                                    {n} {n > 1 ? t('setup.bot_plural') : t('setup.bot_singular')}
                                    {isLocked && <div className="absolute top-1.5 right-2 text-[10px]">🔒</div>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bot previews */}
                    <div className="space-y-2">
                        {BOTS.slice(0, botCount).map(bot => (
                            <div
                                key={bot.id}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                                style={{
                                    background: '#FFFFFF',
                                    border: '2px solid #E0E0E0',
                                    boxShadow: '0 2px 0 rgba(0,0,0,0.05)',
                                }}
                            >
                                <span className="flex-shrink-0">
                                    <AvatarImage avatar={bot.avatar} size={36} />
                                </span>
                                <div>
                                    <div className="text-sm lg:text-base font-bold" style={{ color: '#1A1A2E' }}>{bot.name}</div>
                                    <div className="text-[10px] lg:text-xs" style={{ color: '#9E9EAF' }}>
                                        {t(`data.bots.${bot.id}.description`, { defaultValue: bot.description })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start button — BIG 3D gold */}
                <motion.button
                    whileTap={{ y: 4 }}
                    onClick={handleStart}
                    disabled={!canStart}
                    className="w-full py-3.5 md:py-4.5 lg:py-5 rounded-2xl font-display text-base md:text-lg lg:text-xl font-bold transition-all cursor-pointer"
                    style={{
                        background: canStart ? '#FFD700' : '#E0E0E0',
                        color: canStart ? '#4A3800' : '#9E9EAF',
                        boxShadow: canStart ? '0 5px 0 #B8860B, 0 8px 16px rgba(0,0,0,0.15)' : 'none',
                        cursor: canStart ? 'pointer' : 'not-allowed',
                    }}
                >
                    {t('setup.start_game')}
                </motion.button>
            </div>

            <LeaderboardModal />
            <PaywallModal />
        </motion.div>
    );
}
