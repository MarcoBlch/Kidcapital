import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { useAchievementStore } from '../../store/achievementStore';
import { getRandomChallenge } from '../../data/challenges';
import Button from '../ui/Button';

export default function ChallengeModal() {
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const playerQuizResult = useGameStore(s => s.playerQuizResult);
    const playerApplyLifeEvent = useGameStore(s => s.playerApplyLifeEvent);
    const closeModal = useUIStore(s => s.closeModal);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];
    const difficulty = useGameStore(s => s.difficulty);
    const challenge = useMemo(() => getRandomChallenge(difficulty), [difficulty]);

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);

    const isCorrect = selectedIndex === challenge.correctIndex;
    const REWARD = 10;
    const PENALTY = -5;

    const handleSelect = (index: number) => {
        if (revealed) return;
        setSelectedIndex(index);
        setRevealed(true);

        const correct = index === challenge.correctIndex;
        playerQuizResult(player.id, correct, correct ? REWARD : 0);

        // Track achievement
        if (player.isHuman) {
            useAchievementStore.getState().recordQuizResult(correct);
        }

        if (correct) {
            showCoin(REWARD);
        } else {
            // Wrong answer costs money — learning has stakes!
            playerApplyLifeEvent(player.id, PENALTY);
            showCoin(PENALTY);
        }
    };

    const handleClose = () => closeModal();

    return (
        <div>
            <h2 className="font-display text-lg text-cyan-600 mb-1">
                🧠 Money Quiz!
            </h2>
            <p className="text-[10px] text-slate-400 mb-2">
                Answer correctly to earn ${REWARD} — but wrong answers cost ${Math.abs(PENALTY)}!
            </p>

            <p className="text-sm font-medium text-slate-800 mb-4 leading-relaxed">
                {challenge.question}
            </p>

            <div className="space-y-2 mb-4">
                {challenge.options.map((option, i) => {
                    let style = 'bg-white border-slate-200 text-slate-700';

                    if (revealed) {
                        if (i === challenge.correctIndex) {
                            style = 'bg-emerald-50 border-emerald-400 text-emerald-700';
                        } else if (i === selectedIndex) {
                            style = 'bg-rose-50 border-rose-400 text-rose-700';
                        } else {
                            style = 'bg-slate-50 border-slate-100 text-slate-400';
                        }
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={revealed}
                            className={`
                w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${style}
                ${!revealed ? 'hover:border-cyan-300 hover:bg-cyan-50 active:scale-[0.98]' : ''}
              `}
                        >
                            {option}
                            {revealed && i === challenge.correctIndex && ' ✅'}
                            {revealed && i === selectedIndex && i !== challenge.correctIndex && ' ❌'}
                        </button>
                    );
                })}
            </div>

            {/* Result */}
            {revealed && (
                <div className={`rounded-xl p-4 mb-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                    <div className="font-display text-sm font-bold mb-2">
                        {isCorrect
                            ? `🎉 Correct! +$${REWARD}`
                            : `😕 Wrong! -$${Math.abs(PENALTY)}`}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        🐷 {challenge.pennyExplanation}
                    </p>
                </div>
            )}

            {revealed && (
                <Button fullWidth onClick={handleClose}>
                    Continue
                </Button>
            )}
        </div>
    );
}
