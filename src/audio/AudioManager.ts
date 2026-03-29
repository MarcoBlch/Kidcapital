import { useGameStore } from '../store/gameStore';

export type SoundEffect =
    | 'dice'
    | 'coin_gain'
    | 'coin_loss'
    | 'oink'
    | 'payday'
    | 'buy_asset'
    | 'temptation_buy'
    | 'temptation_skip'
    | 'bank'
    | 'quiz_correct'
    | 'quiz_wrong'
    | 'victory';

// ─── Music note data ─────────────────────────────────────────────────────────
// 4 bars / 16 beats loop in C major, BPM 120 (beat = 0.5s)
// Format: [freq_hz, start_beat, duration_beats]

const MELODY: [number, number, number][] = [
    // Bar 1 — G A B C5 D5 C5 B A (ascending then down)
    [392.00, 0,    0.44], // G4
    [440.00, 0.5,  0.44], // A4
    [493.88, 1,    0.44], // B4
    [523.25, 1.5,  0.44], // C5
    [587.33, 2,    0.44], // D5
    [523.25, 2.5,  0.44], // C5
    [493.88, 3,    0.44], // B4
    [440.00, 3.5,  0.44], // A4
    // Bar 2 — G E G A B A G E
    [392.00, 4,    0.44], // G4
    [329.63, 4.5,  0.44], // E4
    [392.00, 5,    0.44], // G4
    [440.00, 5.5,  0.44], // A4
    [493.88, 6,    0.44], // B4
    [440.00, 6.5,  0.44], // A4
    [392.00, 7,    0.44], // G4
    [329.63, 7.5,  0.44], // E4
    // Bar 3 — C5 D5 E5 D5 C5 B4 A4 G4 (scale up then down)
    [523.25, 8,    0.44], // C5
    [587.33, 8.5,  0.44], // D5
    [659.25, 9,    0.44], // E5
    [587.33, 9.5,  0.44], // D5
    [523.25, 10,   0.44], // C5
    [493.88, 10.5, 0.44], // B4
    [440.00, 11,   0.44], // A4
    [392.00, 11.5, 0.44], // G4
    // Bar 4 — C5 E5 G5 E5 C5 G4 C5 (triumphal resolution)
    [523.25, 12,   0.44], // C5
    [659.25, 12.5, 0.44], // E5
    [783.99, 13,   0.44], // G5
    [659.25, 13.5, 0.44], // E5
    [523.25, 14,   0.44], // C5
    [392.00, 14.5, 0.44], // G4
    [523.25, 15,   0.94], // C5 — held (quarter note landing)
];

const BASS: [number, number, number][] = [
    [130.81, 0,    1.85], // C3
    [196.00, 2,    1.85], // G3
    [110.00, 4,    1.85], // A2
    [174.61, 6,    1.85], // F3
    [174.61, 8,    1.85], // F3
    [130.81, 10,   1.85], // C3
    [196.00, 12,   1.85], // G3
    [130.81, 14,   1.85], // C3
];

// ─── Class ────────────────────────────────────────────────────────────────────

class AudioManager {
    private ctx: AudioContext | null = null;
    private musicLoopId: ReturnType<typeof setTimeout> | null = null;
    private musicPlaying = false;

    private getCtx(): AudioContext | null {
        try {
            if (!this.ctx) this.ctx = new AudioContext();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            return this.ctx;
        } catch {
            return null;
        }
    }

    private get enabled(): boolean {
        return useGameStore.getState().soundEnabled;
    }

    // ── Public: sound effects ─────────────────────────────────────────────────

    play(sound: SoundEffect): void {
        if (!this.enabled) return;
        const ctx = this.getCtx();
        if (!ctx) return;
        switch (sound) {
            case 'dice':            this.playDice(ctx); break;
            case 'coin_gain':       this.playCoinGain(ctx); break;
            case 'coin_loss':       this.playCoinLoss(ctx); break;
            case 'oink':            this.playOink(ctx); break;
            case 'payday':          this.playPayday(ctx); break;
            case 'buy_asset':       this.playBuyAsset(ctx); break;
            case 'temptation_buy':  this.playTemptationBuy(ctx); break;
            case 'temptation_skip': this.playTemptationSkip(ctx); break;
            case 'bank':            this.playBank(ctx); break;
            case 'quiz_correct':    this.playQuizCorrect(ctx); break;
            case 'quiz_wrong':      this.playQuizWrong(ctx); break;
            case 'victory':         this.playVictory(ctx); break;
        }
    }

    // ── Public: background music ──────────────────────────────────────────────

    startMusic(): void {
        if (this.musicPlaying) return;
        if (!this.enabled) return;
        const ctx = this.getCtx();
        if (!ctx) return;
        this.musicPlaying = true;
        this.scheduleMusicLoop(ctx);
    }

    stopMusic(): void {
        this.musicPlaying = false;
        if (this.musicLoopId !== null) {
            clearTimeout(this.musicLoopId);
            this.musicLoopId = null;
        }
    }

    // ── Private: music scheduling ─────────────────────────────────────────────

    private scheduleMusicLoop(ctx: AudioContext): void {
        const BPM = 120;
        const beat = 60 / BPM;           // 0.5s
        const loopBeats = 16;
        const loopDur = beat * loopBeats; // 8s
        const start = ctx.currentTime + 0.02;

        this.scheduleNotes(ctx, start, beat);

        // Re-schedule 150ms before loop ends so there's no gap
        this.musicLoopId = setTimeout(() => {
            if (!this.musicPlaying) return;
            this.scheduleMusicLoop(ctx);
        }, (loopDur - 0.15) * 1000);
    }

    private scheduleNotes(ctx: AudioContext, startTime: number, beat: number): void {
        // Melody — triangle wave (soft, flute-like)
        MELODY.forEach(([freq, startBeat, durBeats]) => {
            const t = startTime + startBeat * beat;
            const dur = durBeats * beat;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.055, t + 0.012);
            gain.gain.setValueAtTime(0.055, t + dur - 0.02);
            gain.gain.linearRampToValueAtTime(0, t + dur);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(t); osc.stop(t + dur + 0.01);
        });

        // Bass — sine wave (warm, unobtrusive)
        BASS.forEach(([freq, startBeat, durBeats]) => {
            const t = startTime + startBeat * beat;
            const dur = durBeats * beat;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.038, t + 0.025);
            gain.gain.setValueAtTime(0.038, t + dur - 0.04);
            gain.gain.linearRampToValueAtTime(0, t + dur);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(t); osc.stop(t + dur + 0.01);
        });
    }

    // ── Private: sound effects ────────────────────────────────────────────────

    // Dice: continuous rumble that slows + 2 final settle clicks
    private playDice(ctx: AudioContext): void {
        const rollDur = 0.52;
        const bufLen = Math.floor(ctx.sampleRate * rollDur);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            const progress = i / bufLen;
            const rotMod = 0.55 + 0.45 * Math.cos(progress * Math.PI * 8);
            data[i] = (Math.random() * 2 - 1) * rotMod;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 1.2;
        const rollGain = ctx.createGain();
        rollGain.gain.setValueAtTime(0.38, ctx.currentTime);
        rollGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + rollDur);
        src.connect(bp); bp.connect(rollGain); rollGain.connect(ctx.destination);
        src.start(); src.stop(ctx.currentTime + rollDur);

        [0.36, 0.48].forEach((t, idx) => {
            const clickLen = Math.floor(ctx.sampleRate * 0.016);
            const clickBuf = ctx.createBuffer(1, clickLen, ctx.sampleRate);
            const cd = clickBuf.getChannelData(0);
            for (let i = 0; i < clickLen; i++) cd[i] = (Math.random() * 2 - 1) * (1 - i / clickLen);
            const clickSrc = ctx.createBufferSource();
            clickSrc.buffer = clickBuf;
            const hp = ctx.createBiquadFilter();
            hp.type = 'highpass'; hp.frequency.value = 1800;
            const cg = ctx.createGain();
            const ct = ctx.currentTime + t;
            cg.gain.setValueAtTime(idx === 1 ? 0.52 : 0.30, ct);
            cg.gain.exponentialRampToValueAtTime(0.001, ct + 0.016);
            clickSrc.connect(hp); hp.connect(cg); cg.connect(ctx.destination);
            clickSrc.start(ct); clickSrc.stop(ct + 0.016);
        });
    }

    // Coin gain: high metallic tap + inharmonic ring × 3
    private playCoinGain(ctx: AudioContext): void {
        [0, 0.062, 0.118].forEach(delay => {
            const t = ctx.currentTime + delay;
            const tapLen = Math.floor(ctx.sampleRate * 0.007);
            const tapBuf = ctx.createBuffer(1, tapLen, ctx.sampleRate);
            const td = tapBuf.getChannelData(0);
            for (let i = 0; i < tapLen; i++) td[i] = Math.random() * 2 - 1;
            const tapSrc = ctx.createBufferSource();
            tapSrc.buffer = tapBuf;
            const tapGain = ctx.createGain();
            tapGain.gain.setValueAtTime(0.18, t);
            tapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.007);
            tapSrc.connect(tapGain); tapGain.connect(ctx.destination);
            tapSrc.start(t); tapSrc.stop(t + 0.007);

            [[3200, 0.14], [5520, 0.06]].forEach(([freq, amp]) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(amp, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(t); osc.stop(t + 0.20);
            });
        });
    }

    // Coin loss: descending whoosh + dull thud
    private playCoinLoss(ctx: AudioContext): void {
        const osc = ctx.createOscillator();
        const filt = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
        filt.type = 'lowpass'; filt.frequency.value = 700;
        gain.gain.setValueAtTime(0.10, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.35);

        const t2 = ctx.currentTime + 0.28;
        const bufLen = Math.floor(ctx.sampleRate * 0.06);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.15));
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filt2 = ctx.createBiquadFilter();
        filt2.type = 'lowpass'; filt2.frequency.value = 200;
        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0.4, t2);
        gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.06);
        src.connect(filt2); filt2.connect(gain2); gain2.connect(ctx.destination);
        src.start(t2); src.stop(t2 + 0.06);
    }

    // Oink: pig squeal — sawtooth with vibrato descending
    private playOink(ctx: AudioContext): void {
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(560, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(290, ctx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(230, ctx.currentTime + 0.20);

        // Vibrato — gives the "oink" wobble
        lfo.type = 'sine';
        lfo.frequency.value = 22;
        lfoGain.gain.value = 28;
        lfo.connect(lfoGain); lfoGain.connect(osc.frequency);

        filt.type = 'lowpass'; filt.frequency.value = 800;

        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.setValueAtTime(0.22, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

        osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
        lfo.start(); lfo.stop(ctx.currentTime + 0.24);
        osc.start(); osc.stop(ctx.currentTime + 0.24);
    }

    // Payday: ka-ching (metallic bell ring + mechanical click)
    private playPayday(ctx: AudioContext): void {
        [[1760, 0.18], [3520, 0.09], [5280, 0.04]].forEach(([freq, amp]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(amp, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.65);
        });
        const t = ctx.currentTime + 0.04;
        const bufLen = Math.floor(ctx.sampleRate * 0.018);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0.35, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
        src.connect(gain2); gain2.connect(ctx.destination);
        src.start(t); src.stop(t + 0.018);
    }

    // Buy asset: low thump + ascending shimmer
    private playBuyAsset(ctx: AudioContext): void {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.18);
        gain1.gain.setValueAtTime(0.45, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc1.connect(gain1); gain1.connect(ctx.destination);
        osc1.start(); osc1.stop(ctx.currentTime + 0.18);

        [880, 1100, 1320].forEach((freq, i) => {
            const t = ctx.currentTime + 0.06 + i * 0.05;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(t); osc.stop(t + 0.22);
        });
    }

    // Temptation buy: guilty bubbly pops
    private playTemptationBuy(ctx: AudioContext): void {
        [0, 0.08, 0.16, 0.24, 0.30].forEach((delay, i) => {
            const baseFreq = 350 + i * 120;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq * 0.65, ctx.currentTime + delay);
            osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + delay + 0.06);
            gain.gain.setValueAtTime(0.14, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 0.12);
        });
    }

    // Temptation skip: virtuous C-E-G chime
    private playTemptationSkip(ctx: AudioContext): void {
        [[523.25, 0], [659.25, 0.1], [783.99, 0.2]].forEach(([freq, delay]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle'; osc.frequency.value = freq;
            const t = ctx.currentTime + delay;
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(t); osc.stop(t + 0.38);
        });
    }

    // Bank: heavy safe-door clunk + resonant ping
    private playBank(ctx: AudioContext): void {
        const bufLen = Math.floor(ctx.sampleRate * 0.07);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.12));
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.value = 280;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
        src.start(); src.stop(ctx.currentTime + 0.12);

        const t2 = ctx.currentTime + 0.04;
        const osc = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = 620;
        gain2.gain.setValueAtTime(0.08, t2);
        gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.4);
        osc.connect(gain2); gain2.connect(ctx.destination);
        osc.start(t2); osc.stop(t2 + 0.4);
    }

    // Quiz correct: bright ascending sparkle
    private playQuizCorrect(ctx: AudioContext): void {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = freq;
            const t = ctx.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(t); osc.stop(t + 0.28);
        });
    }

    // Quiz wrong: game-show buzzer
    private playQuizWrong(ctx: AudioContext): void {
        const osc = ctx.createOscillator();
        const filt = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.45);
        filt.type = 'lowpass'; filt.frequency.value = 900;
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.setValueAtTime(0.07, ctx.currentTime + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.45);
    }

    // Victory: triumphant multi-voice fanfare
    private playVictory(ctx: AudioContext): void {
        const fanfare: [number, number, number][] = [
            [523.25, 0,    0.14],
            [659.25, 0.16, 0.14],
            [783.99, 0.32, 0.14],
            [1046.5, 0.48, 0.9],
        ];
        fanfare.forEach(([freq, delay, dur]) => {
            [freq, freq * 1.5, freq * 2].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = i === 0 ? 'triangle' : 'sine';
                osc.frequency.value = f;
                const t = ctx.currentTime + delay;
                const vol = [0.20, 0.08, 0.04][i];
                gain.gain.setValueAtTime(vol, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(t); osc.stop(t + dur);
            });
        });
    }
}

export const audioManager = new AudioManager();
