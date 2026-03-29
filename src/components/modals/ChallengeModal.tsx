import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { audioManager } from '../../audio/AudioManager';
import { useAchievementStore } from '../../store/achievementStore';
import { getRandomChallenge } from '../../data/challenges';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function ChallengeModal() {
    const { t } = useTranslation();
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const playerQuizResult = useGameStore(s => s.playerQuizResult);
    const playerApplyLifeEvent = useGameStore(s => s.playerApplyLifeEvent);
    const addSeenQuizId = useGameStore(s => s.addSeenQuizId);
    const seenQuizIds = useGameStore(s => s.seenQuizIds);
    const closeModal = useUIStore(s => s.closeModal);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];
    const difficulty = useGameStore(s => s.difficulty);

    // Pick challenge excluding already-seen ones this session
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const challenge = useMemo(() => getRandomChallenge(difficulty, seenQuizIds), []);

    // Fisher-Yates shuffle of answer options (prevents memorization of positions)
    const { shuffledOptions, shuffledCorrectIndex } = useMemo(() => {
        const indices = [0, 1, 2, 3];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return {
            shuffledOptions: indices.map(i => challenge.options[i]),
            shuffledCorrectIndex: indices.indexOf(challenge.correctIndex),
        };
    }, [challenge.id]);

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);

    const isCorrect = selectedIndex === shuffledCorrectIndex;
    const REWARD = 10;
    const PENALTY = -5;

    const handleSelect = (index: number) => {
        if (revealed) return;
        setSelectedIndex(index);
        setRevealed(true);
        addSeenQuizId(challenge.id);

        const correct = index === shuffledCorrectIndex;
        playerQuizResult(player.id, correct, correct ? REWARD : 0);
        audioManager.play(correct ? 'quiz_correct' : 'quiz_wrong');

        if (player.isHuman) {
            useAchievementStore.getState().recordQuizResult(correct);
        }
        if (correct) {
            showCoin(REWARD);
        } else {
            playerApplyLifeEvent(player.id, PENALTY);
            showCoin(PENALTY);
        }
    };

    const handleClose = () => closeModal();

    return (
        <div>
            <h2 className="font-display text-lg mb-1" style={{ color: '#1E88E5' }}>
                {t('modals.challenge.title')}
            </h2>
            <p className="text-[10px] mb-2" style={{ color: '#9E9EAF' }}>
                {t('modals.challenge.subtitle', { reward: REWARD, penalty: Math.abs(PENALTY) })}
            </p>

            <p className="text-sm font-medium mb-4 leading-relaxed" style={{ color: '#1A1A2E' }}>
                {t(`data.challenges.${challenge.id}_question`, { defaultValue: challenge.question })}
            </p>

            <div className="space-y-2 mb-4">
                {shuffledOptions.map((option, i) => {
                    let bg = '#FFFFFF';
                    let border = '#E0E0E0';
                    let color = '#1A1A2E';

                    if (revealed) {
                        if (i === shuffledCorrectIndex) {
                            bg = '#E8F5E9'; border = '#4CAF50'; color = '#2E7D32';
                        } else if (i === selectedIndex) {
                            bg = '#FFEBEE'; border = '#EF5350'; color = '#C62828';
                        } else {
                            bg = '#FAFAFA'; border = '#F0F0F0'; color = '#9E9EAF';
                        }
                    }

                    // Map back to original index for i18n key lookup
                    const originalIndex = challenge.options.indexOf(option);

                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={revealed}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.98]"
                            style={{
                                background: bg,
                                border: `2px solid ${border}`,
                                color,
                            }}
                        >
                            {t(`data.challenges.${challenge.id}_opt_${originalIndex}`, { defaultValue: option })}
                            {revealed && i === shuffledCorrectIndex && ' ✅'}
                            {revealed && i === selectedIndex && i !== shuffledCorrectIndex && ' ❌'}
                        </button>
                    );
                })}
            </div>

            {/* Result */}
            {revealed && (
                <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                        background: isCorrect ? '#E8F5E9' : '#FFEBEE',
                        border: `2px solid ${isCorrect ? '#4CAF50' : '#EF5350'}`,
                    }}
                >
                    <div className="font-display text-sm font-bold mb-2">
                        {isCorrect
                            ? t('modals.challenge.correct', { reward: REWARD })
                            : t('modals.challenge.wrong', { penalty: Math.abs(PENALTY) })}
                        </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#5D5D6E' }}>
                        {t(`data.challenges.${challenge.id}_explanation`, { defaultValue: challenge.pennyExplanation })}
                    </p>
                </div>
            )}

            {revealed && (
                <Button fullWidth onClick={handleClose}>
                    {t('modals.continue')}
                </Button>
            )}
        </div>
    );
}
