import { useEffect, useRef } from 'react';
import { BOARD } from '../../data/board';
import { useGameStore } from '../../store/gameStore';
import SpaceCard from './SpaceCard';

export default function BoardStrip() {
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const scrollRef = useRef<HTMLDivElement>(null);

    const currentPlayer = players[currentPlayerIndex];

    // Auto-scroll to active player position
    useEffect(() => {
        if (!currentPlayer || !scrollRef.current) return;

        requestAnimationFrame(() => {
            const spaceEl = scrollRef.current?.querySelector(
                `[data-space-index="${currentPlayer.position}"]`,
            );
            spaceEl?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        });
    }, [currentPlayer?.position, currentPlayerIndex]);

    return (
        <div className="relative">
            {/* Connection line */}
            <div className="board-path-line" />

            {/* Scrollable board */}
            <div
                ref={scrollRef}
                className="relative flex items-center gap-3 overflow-x-auto px-6 py-4 no-scrollbar"
            >
                {BOARD.map(space => {
                    const playersOnSpace = players
                        .filter(p => p.position === space.index)
                        .map(p => ({
                            avatar: p.avatar,
                            id: p.id,
                            isActive: p.id === currentPlayer?.id,
                        }));

                    return (
                        <SpaceCard
                            key={space.index}
                            space={space}
                            isActive={currentPlayer?.position === space.index}
                            playersOnSpace={playersOnSpace}
                        />
                    );
                })}
            </div>
        </div>
    );
}
