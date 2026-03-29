import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useTutorialStore } from '../store/tutorialStore';
import { executeHumanRoll, completeAction, nextTurn } from '../engine/TurnManager';

// HUD
import Header from '../components/hud/Header';
import ActionBar from '../components/hud/ActionBar';
import PlayersOverlay from '../components/hud/PlayersOverlay';

// Board
import BoardGrid from '../components/board/BoardGrid';

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
    const tutorialIsCompleted = useTutorialStore(s => s.isCompleted);
    const startTutorial = useTutorialStore(s => s.startTutorial);
    const signalEvent = useTutorialStore(s => s.signalEvent);

    const currentPlayer = players[currentPlayerIndex];

    // Players overlay state
    const [showPlayers, setShowPlayers] = useState(false);

    // Start tutorial on first game
    useEffect(() => {
        if (!tutorialIsCompleted) {
            const timer = setTimeout(() => startTutorial(), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    // Signal tutorial events + handle modal close
    const prevModalRef = useRef(activeModal);
    const modalActionConfirmed = useUIStore(s => s.modalActionConfirmed);
    const showModal = useUIStore(s => s.showModal);
    useEffect(() => {
        const prevModal = prevModalRef.current;
        const wasOpen = prevModal !== null;
        const nowClosed = activeModal === null;
        prevModalRef.current = activeModal;

        if (wasOpen && nowClosed) {
            signalEvent('modal_close');
            if (turnPhase === 'modal_open') {
                // For bank modal: only advance if player explicitly confirmed (Skip or action).
                // Otherwise re-open so player doesn't lose their bank turn accidentally.
                if (prevModal === 'bank' && !modalActionConfirmed) {
                    showModal('bank');
                } else {
                    completeAction();
                }
            }
        }
    }, [activeModal, turnPhase, signalEvent, modalActionConfirmed, showModal]);

    const handleRoll = useCallback(() => {
        signalEvent('roll');
        executeHumanRoll();
    }, [signalEvent]);

    const handleNext = useCallback(() => {
        signalEvent('next_turn');
        nextTurn();
    }, [signalEvent]);

    // Auto-advance after 3s at turn_end (human only) — player can still click Next to skip wait
    useEffect(() => {
        if (turnPhase !== 'turn_end' || !currentPlayer?.isHuman) return;
        const timer = setTimeout(handleNext, 3000);
        return () => clearTimeout(timer);
    }, [turnPhase, currentPlayer?.id]);

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
        <div className="h-dvh w-full flex flex-col overflow-visible" style={{ background: '#2B6A4E' }}>
            {/* Header — sky-tinted area */}
            <div style={{ background: 'linear-gradient(180deg, #6DB8A0 0%, #2B6A4E 100%)' }}>
                <Header />
            </div>

            {/* Board grid — fills remaining space, self-centers */}
            <div className="flex-1 flex items-center justify-center min-h-0 py-2">
                <BoardGrid onRoll={handleRoll} onNext={handleNext} />
            </div>

            {/* Bottom nav */}
            <ActionBar onOpenPlayers={() => setShowPlayers(true)} />

            {/* Players overlay */}
            <PlayersOverlay isOpen={showPlayers} onClose={() => setShowPlayers(false)} />

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
