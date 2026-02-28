import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useTutorialStore } from '../store/tutorialStore';
import { executeHumanRoll, completeAction, nextTurn } from '../engine/TurnManager';
import { getFreedomPercent } from '../engine/WinCondition';

// HUD
import Header from '../components/hud/Header';
import PlayerRow from '../components/hud/PlayerRow';
import ProgressBar from '../components/hud/ProgressBar';
import ActionBar from '../components/hud/ActionBar';

// Board
import BoardStrip from '../components/board/BoardStrip';

// Modals
import BottomSheet from '../components/modals/BottomSheet';
import InvestModal from '../components/modals/InvestModal';
import PaydayModal from '../components/modals/PaydayModal';
import LifeEventModal from '../components/modals/LifeEventModal';
import HustleModal from '../components/modals/HustleModal';
import TemptationModal from '../components/modals/TemptationModal';
import ChallengeModal from '../components/modals/ChallengeModal';
import BankModal from '../components/modals/BankModal';
import PortfolioModal from '../components/modals/PortfolioModal';

// Overlays
import PennyBubble from '../components/penny/PennyBubble';
import CoinAnimation from '../components/ui/CoinAnimation';
import AchievementToast from '../components/ui/AchievementToast';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import { useAchievementTracker } from '../hooks/useAchievementTracker';

export default function GameScreen() {
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const turnPhase = useGameStore(s => s.turnPhase);

    // Achievement tracker
    useAchievementTracker();
    const activeModal = useUIStore(s => s.activeModal);
    const modalSpaceColor = useUIStore(s => s.modalSpaceColor);
    const turnLog = useUIStore(s => s.turnLog);
    const tutorialIsCompleted = useTutorialStore(s => s.isCompleted);
    const startTutorial = useTutorialStore(s => s.startTutorial);
    const signalEvent = useTutorialStore(s => s.signalEvent);

    const currentPlayer = players[currentPlayerIndex];
    const freedomPct = currentPlayer ? getFreedomPercent(currentPlayer) : 0;

    // Start tutorial on first game
    useEffect(() => {
        if (!tutorialIsCompleted) {
            const timer = setTimeout(() => startTutorial(), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    // Signal tutorial events
    const prevModalRef = useRef(activeModal);
    useEffect(() => {
        const wasOpen = prevModalRef.current !== null;
        const nowClosed = activeModal === null;
        prevModalRef.current = activeModal;

        if (wasOpen && nowClosed) {
            // Signal tutorial
            signalEvent('modal_close');
            // Bridge modal close → completeAction
            if (turnPhase === 'modal_open') {
                completeAction();
            }
        }
    }, [activeModal, turnPhase, signalEvent]);

    const handleRoll = useCallback(() => {
        signalEvent('roll');
        executeHumanRoll();
    }, [signalEvent]);

    const handleNext = useCallback(() => {
        signalEvent('next_turn');
        nextTurn();
    }, [signalEvent]);

    const handleModalClose = useCallback(() => {
        useUIStore.getState().closeModal();
    }, []);

    // Auto-start bot turns on mount if first player is bot
    useEffect(() => {
        if (currentPlayer && !currentPlayer.isHuman) {
            const timer = setTimeout(() => nextTurn(), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!currentPlayer) return null;

    return (
        <div className="h-dvh game-bg flex flex-col overflow-hidden">
            {/* Header */}
            <Header />

            {/* Player cards */}
            <div className="px-2 py-1 space-y-1 flex-shrink-0">
                {players.map(p => (
                    <PlayerRow
                        key={p.id}
                        player={p}
                        isActive={p.id === currentPlayer.id}
                    />
                ))}
            </div>

            {/* Freedom progress with milestones */}
            <div className="py-1.5 flex-shrink-0">
                <ProgressBar percent={freedomPct} />
            </div>

            {/* Board — fills remaining space */}
            <div className="flex-1 flex items-center min-h-0">
                <div className="w-full">
                    <BoardStrip />
                </div>
            </div>

            {/* Bot turn log */}
            {turnLog.length > 0 && (
                <div className="px-3 py-1 flex-shrink-0">
                    <div className="bg-white/5 rounded-xl px-3 py-1.5 max-h-14 overflow-y-auto no-scrollbar border border-white/5">
                        {turnLog.slice(-3).map((log, i) => (
                            <div key={i} className="text-[10px] text-white/40 py-0.5">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action bar */}
            <ActionBar onRoll={handleRoll} onNext={handleNext} />

            {/* Penny overlay */}
            <PennyBubble />

            {/* Coin animations */}
            <CoinAnimation />

            {/* Achievement toasts */}
            <AchievementToast />

            {/* Tutorial overlay */}
            <TutorialOverlay />

            {/* Modal system */}
            <BottomSheet
                isOpen={activeModal !== null}
                onClose={handleModalClose}
                accentColor={modalSpaceColor}
            >
                {activeModal === 'invest' && <InvestModal />}
                {activeModal === 'payday' && <PaydayModal />}
                {activeModal === 'life' && <LifeEventModal />}
                {activeModal === 'hustle' && <HustleModal />}
                {activeModal === 'temptation' && <TemptationModal />}
                {activeModal === 'challenge' && <ChallengeModal />}
                {activeModal === 'bank' && <BankModal />}
                {activeModal === 'portfolio' && <PortfolioModal />}
            </BottomSheet>
        </div>
    );
}
