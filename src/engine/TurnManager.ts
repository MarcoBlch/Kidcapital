import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { BOARD } from '../data/board';
import { BOARD_SIZE } from '../data/board';
import { getPennyPhrase } from '../data/penny-phrases';
import { getRandomEvent } from '../data/events';
import { getRandomHustle } from '../data/hustles';
import { getRandomTemptation } from '../data/temptations';
import { getAvailableAssets } from '../data/assets';
import { canBuyAsset } from '../engine/FinancialEngine';
import { rollDice, sleep } from '../utils/helpers';
import { TIMING, GO_BONUS } from '../utils/constants';

/**
 * TurnManager — Orchestrates the turn flow.
 * Called from GameScreen via hooks.
 */
export async function executeHumanRoll(): Promise<void> {
    const game = useGameStore.getState();
    const ui = useUIStore.getState();

    if (game.turnLocked || game.turnPhase !== 'idle') return;

    const player = game.getCurrentPlayer();
    if (!player.isHuman) return;

    game.setTurnLocked(true);

    // 1. Roll dice
    const diceResult = rollDice();
    game.setDiceResult(diceResult);
    game.setTurnPhase('rolling');

    await sleep(TIMING.DICE_ROLL);

    // 2. Move player
    game.setTurnPhase('moving');

    const oldPos = player.position;
    const newPos = (oldPos + diceResult) % BOARD_SIZE;
    const passedGo = oldPos + diceResult >= BOARD_SIZE;

    // Animate step by step
    for (let step = 1; step <= diceResult; step++) {
        const stepPos = (oldPos + step) % BOARD_SIZE;
        game.movePlayerTo(player.id, stepPos, step === diceResult && passedGo);
        await sleep(TIMING.TOKEN_MOVE_PER_SPACE);
    }

    if (passedGo) {
        ui.showCoin(GO_BONUS);
        ui.showPenny(`You passed GO! +$${GO_BONUS} allowance 💰`);
        await sleep(1500);
    }

    await sleep(TIMING.SPACE_ARRIVAL_PAUSE);

    // 3. Resolve space
    const space = BOARD[newPos];

    if (space.type === 'start') {
        game.setTurnPhase('turn_end');
        game.setTurnLocked(false);
        return;
    }

    // Show modal for this space type
    game.setTurnPhase('modal_open');
    ui.showModal(space.type);

    // Penny speaks after space arrive
    await sleep(TIMING.PENNY_DELAY_AFTER_ACTION);
    showPennyForSpace(space.type, player);
}

/**
 * Called when player closes a modal (action done).
 */
export async function completeAction(): Promise<void> {
    const game = useGameStore.getState();

    game.setTurnPhase('action_done');
    await sleep(TIMING.POST_ACTION_PAUSE);

    // Check win
    const winnerId = game.checkWinCondition();
    if (winnerId !== null) {
        const ui = useUIStore.getState();
        ui.showPenny('🎉 Financial Freedom achieved! You did it!');
        await sleep(3000);
        ui.setScreen('end');
        game.setTurnLocked(false);
        return;
    }

    game.setTurnPhase('turn_end');
    game.setTurnLocked(false);
}

/**
 * Advance to next turn.
 */
export async function nextTurn(): Promise<void> {
    const game = useGameStore.getState();

    game.advanceTurn();

    // If next player is bot, auto-play
    const nextPlayer = game.getCurrentPlayer();
    if (!nextPlayer.isHuman) {
        await executeBotTurn();
    }
}

/**
 * Execute a bot turn (auto-play, visible and readable).
 */
async function executeBotTurn(): Promise<void> {
    const game = useGameStore.getState();
    const ui = useUIStore.getState();

    const bot = game.getCurrentPlayer();
    if (bot.isHuman) return;

    game.setTurnLocked(true);
    game.setTurnPhase('bot_acting');
    ui.addLog(`${bot.avatar} ${bot.name}'s turn...`);

    await sleep(TIMING.BOT_STEP_PAUSE);

    // Roll
    const diceResult = rollDice();
    game.setDiceResult(diceResult);
    ui.addLog(`${bot.avatar} rolled ${diceResult}`);

    await sleep(TIMING.BOT_STEP_PAUSE);

    // Move
    const oldPos = bot.position;
    const newPos = (oldPos + diceResult) % BOARD_SIZE;
    const passedGo = oldPos + diceResult >= BOARD_SIZE;

    game.movePlayerTo(bot.id, newPos, passedGo);
    if (passedGo) {
        ui.addLog(`${bot.avatar} passed GO! +$${GO_BONUS}`);
    }

    await sleep(TIMING.BOT_STEP_PAUSE);

    // Resolve space (no modal for bots)
    const space = BOARD[newPos];
    await resolveBotSpace(bot.id, space.type, bot.personality ?? 'balanced');

    await sleep(TIMING.BOT_STEP_PAUSE);

    // Check win
    const winnerId = game.checkWinCondition();
    if (winnerId !== null) {
        ui.setScreen('end');
        game.setTurnLocked(false);
        return;
    }

    // Next turn
    game.setTurnPhase('turn_end');
    game.setTurnLocked(false);

    game.advanceTurn();

    // Chain bot turns
    const next = useGameStore.getState().getCurrentPlayer();
    if (!next.isHuman) {
        await executeBotTurn();
    }
}

/**
 * Resolve a space for a bot (no modals).
 */
async function resolveBotSpace(
    botId: number,
    spaceType: string,
    personality: string,
): Promise<void> {
    const game = useGameStore.getState();
    const ui = useUIStore.getState();
    const bot = game.getPlayer(botId);

    switch (spaceType) {
        case 'invest': {
            if (bot.debt > 0) {
                ui.addLog(`${bot.avatar} can't invest (has debt)`);
                break;
            }
            const ownedIds = bot.assets.map(a => a.id);
            const available = getAvailableAssets(ownedIds, 3);
            if (available.length === 0) break;

            let chosen = null;
            if (personality === 'conservative') {
                chosen = available
                    .filter(a => bot.cash >= a.cost)
                    .sort((a, b) => a.cost - b.cost)[0] ?? null;
                if (chosen) {
                    game.playerBuyAssetCash(botId, chosen);
                    ui.addLog(`${bot.avatar} bought ${chosen.name}! 🏪`);
                    ui.showCoin(-chosen.cost);
                }
            } else if (personality === 'aggressive') {
                chosen = available
                    .filter(a => canBuyAsset(bot, a).loan || canBuyAsset(bot, a).cash)
                    .sort((a, b) => b.income - a.income)[0] ?? null;
                if (chosen) {
                    const opts = canBuyAsset(bot, chosen);
                    if (opts.cash) {
                        game.playerBuyAssetCash(botId, chosen);
                    } else {
                        game.playerBuyAssetLoan(botId, chosen);
                    }
                    ui.addLog(`${bot.avatar} bought ${chosen.name}! 🏪`);
                }
            } else {
                chosen = available
                    .filter(a => canBuyAsset(bot, a).loan || canBuyAsset(bot, a).cash)
                    .sort((a, b) => (b.income / b.cost) - (a.income / a.cost))[0] ?? null;
                if (chosen) {
                    const opts = canBuyAsset(bot, chosen);
                    if (opts.cash) {
                        game.playerBuyAssetCash(botId, chosen);
                    } else if (opts.loan) {
                        game.playerBuyAssetLoan(botId, chosen);
                    }
                    ui.addLog(`${bot.avatar} bought ${chosen.name}! 🏪`);
                }
            }
            if (!chosen) {
                ui.addLog(`${bot.avatar} skipped investing`);
            }
            break;
        }
        case 'payday': {
            const report = game.playerPayday(botId);
            ui.addLog(`${bot.avatar} payday: net $${report.net}`);
            ui.showCoin(report.net);
            break;
        }
        case 'life': {
            const event = getRandomEvent();
            game.playerApplyLifeEvent(botId, event.amount);
            const sign = event.amount >= 0 ? '+' : '';
            ui.addLog(`${bot.avatar} ${event.title} (${sign}$${event.amount})`);
            ui.showCoin(event.amount);
            break;
        }
        case 'hustle': {
            const hustle = getRandomHustle();
            game.playerApplyHustle(botId, hustle.amount);
            ui.addLog(`${bot.avatar} ${hustle.title} +$${hustle.amount}`);
            ui.showCoin(hustle.amount);
            break;
        }
        case 'temptation': {
            const temptation = getRandomTemptation();
            if (personality === 'aggressive' && Math.random() < 0.3 && bot.cash >= temptation.cost) {
                game.playerBuyTemptation(botId, temptation.cost);
                ui.addLog(`${bot.avatar} bought ${temptation.name}! 🛍️`);
                ui.showCoin(-temptation.cost);
            } else {
                game.playerSkipTemptation(botId);
                ui.addLog(`${bot.avatar} skipped ${temptation.name} 💪 +$5 saved`);
            }
            break;
        }
        case 'challenge': {
            const correct = Math.random() < 0.55;
            const reward = correct ? 10 : 0;
            const penalty = correct ? 0 : -5;
            game.playerQuizResult(botId, correct, reward);
            if (!correct) {
                game.playerApplyLifeEvent(botId, penalty);
            }
            ui.addLog(`${bot.avatar} quiz: ${correct ? 'correct! +$10 🧠' : 'wrong -$5 😕'}`);
            if (correct) ui.showCoin(10);
            else ui.showCoin(-5);
            break;
        }
        case 'bank': {
            if (personality === 'conservative' || personality === 'balanced') {
                const saveAmount = personality === 'balanced'
                    ? Math.floor(bot.cash * 0.3)
                    : Math.floor(bot.cash * 0.5);
                if (saveAmount > 0) {
                    game.playerDeposit(botId, saveAmount);
                    ui.addLog(`${bot.avatar} saved $${saveAmount} 🏦`);
                }
            } else {
                ui.addLog(`${bot.avatar} skipped saving`);
            }
            break;
        }
    }
}

/**
 * Show Penny phrase based on space type and player state.
 */
function showPennyForSpace(
    spaceType: string,
    player: { cash: number; debt: number; savings: number; assets: { income: number }[] },
): void {
    const ui = useUIStore.getState();

    // Context-aware messages
    if (player.cash < 30) {
        ui.showPenny(getPennyPhrase('low_cash'));
        return;
    }

    if (player.debt > 0 && spaceType === 'invest') {
        ui.showPenny(getPennyPhrase('cant_buy_debt'));
        return;
    }

    if (player.savings === 0 && spaceType === 'bank') {
        ui.showPenny("You have $0 in savings! Try to save some money each month — it's your safety net! 🏦");
        return;
    }

    const triggerMap: Record<string, string> = {
        invest: 'land_invest',
        payday: 'payday_positive',
        life: 'life_event_good',
        hustle: 'hustle',
        temptation: 'generic',
        challenge: 'generic',
        bank: 'bank_deposit',
    };

    const trigger = triggerMap[spaceType] ?? 'generic';
    ui.showPenny(getPennyPhrase(trigger));
}
