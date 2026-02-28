import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAchievementStore } from '../store/achievementStore';

/**
 * Hook that watches game state changes and triggers achievement updates.
 * Place this in GameScreen — it observes player stats each turn.
 */
export function useAchievementTracker() {
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const turnPhase = useGameStore(s => s.turnPhase);
    const maxStat = useAchievementStore(s => s.maxStat);

    const prevPhaseRef = useRef(turnPhase);

    // Track human player stats each turn end
    useEffect(() => {
        const wasActionDone = prevPhaseRef.current === 'action_done';
        prevPhaseRef.current = turnPhase;

        if (!wasActionDone || turnPhase !== 'turn_end') return;

        const humanPlayer = players.find(p => p.isHuman);
        if (!humanPlayer) return;

        // Update max stats
        maxStat('maxAssetsInOneGame', humanPlayer.assets.length);
        maxStat('totalSavingsEverReached', humanPlayer.savings);

        // Detect debt paid off
        if (humanPlayer.debt === 0 && humanPlayer.assets.length > 0) {
            // Will only trigger achievement when it reaches threshold
            maxStat('totalDebtPaidOff', 1);
        }
    }, [turnPhase, players, maxStat]);
}
