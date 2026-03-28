// ============================================
// KidCapital — Board Grid Position Mapping
// Maps board space index (0-19) to 6×6 CSS grid coordinates
// Clockwise perimeter loop starting from top-left
// ============================================

export interface GridPos {
    col: number;
    row: number;
}

export const GRID_COLS = 6;
export const GRID_ROWS = 6;

export const GRID_POSITIONS: GridPos[] = [
    // Top row (L→R): indices 0-5
    { col: 0, row: 0 },
    { col: 1, row: 0 },
    { col: 2, row: 0 },
    { col: 3, row: 0 },
    { col: 4, row: 0 },
    { col: 5, row: 0 },
    // Right column (T→B): indices 6-9
    { col: 5, row: 1 },
    { col: 5, row: 2 },
    { col: 5, row: 3 },
    { col: 5, row: 4 },
    // Bottom row (R→L): indices 10-15
    { col: 5, row: 5 },
    { col: 4, row: 5 },
    { col: 3, row: 5 },
    { col: 2, row: 5 },
    { col: 1, row: 5 },
    { col: 0, row: 5 },
    // Left column (B→T): indices 16-19
    { col: 0, row: 4 },
    { col: 0, row: 3 },
    { col: 0, row: 2 },
    { col: 0, row: 1 },
];

/** Returns CSS grid placement style for a board space index (1-based for CSS Grid) */
export function getGridStyle(index: number): { gridColumn: number; gridRow: number } {
    const pos = GRID_POSITIONS[index];
    return { gridColumn: pos.col + 1, gridRow: pos.row + 1 };
}
