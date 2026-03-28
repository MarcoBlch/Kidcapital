import { BOARD } from '../../data/board';
import { useGameStore } from '../../store/gameStore';
import { getGridStyle, GRID_COLS, GRID_ROWS } from '../../utils/gridPositions';
import SpaceTile from './SpaceTile';
import BoardCenter from './BoardCenter';

interface BoardGridProps {
    onRoll: () => void;
    onNext: () => void;
}

export default function BoardGrid({ onRoll, onNext }: BoardGridProps) {
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const currentPlayer = players[currentPlayerIndex];

    return (
        <div className="flex items-center justify-center w-full px-2 md:px-4">
            <div
                className="relative w-full"
                style={{
                    maxWidth: 'min(100vw - 24px, 500px)',
                    aspectRatio: '1',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                    gap: 4,
                }}
            >
                {/* Board spaces on the perimeter */}
                {BOARD.map(space => {
                    const gridStyle = getGridStyle(space.index);
                    const playersOnSpace = players
                        .filter(p => p.position === space.index)
                        .map(p => ({
                            avatar: p.avatar,
                            id: p.id,
                            isActive: p.id === currentPlayer?.id,
                        }));

                    return (
                        <SpaceTile
                            key={space.index}
                            space={space}
                            isActive={currentPlayer?.position === space.index}
                            playersOnSpace={playersOnSpace}
                            style={gridStyle}
                        />
                    );
                })}

                {/* Center HUD area */}
                <BoardCenter onRoll={onRoll} onNext={onNext} />

                {/* Subtle inner border */}
                <div
                    className="pointer-events-none"
                    style={{
                        gridColumn: '1 / -1',
                        gridRow: '1 / -1',
                        border: '2px solid rgba(255,255,255,0.08)',
                        borderRadius: 16,
                    }}
                />
            </div>
        </div>
    );
}
