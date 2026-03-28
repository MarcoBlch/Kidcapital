import {
    pennyWave,
    pennyCelebrate,
    pennyWorried,
    pennyTeach,
    pennyThink,
    pennyProud,
} from '../../assets/game';

const PENNY_POSES = {
    wave: pennyWave,
    celebrate: pennyCelebrate,
    worried: pennyWorried,
    teach: pennyTeach,
    think: pennyThink,
    proud: pennyProud,
} as const;

export type PennyPose = keyof typeof PENNY_POSES;

interface PennyAvatarProps {
    pose: PennyPose;
    size?: number;
    showBubble?: boolean;
    className?: string;
}

export default function PennyAvatar({
    pose,
    size = 48,
    showBubble = false,
    className = '',
}: PennyAvatarProps) {
    const src = PENNY_POSES[pose];

    const img = (
        <img
            src={src}
            alt={`Penny ${pose}`}
            width={size}
            height={size}
            className="object-contain"
            style={{ width: size, height: size }}
            draggable={false}
        />
    );

    if (showBubble) {
        return (
            <div
                className={`flex items-center justify-center rounded-full flex-shrink-0 ${className}`}
                style={{
                    width: size + 12,
                    height: size + 12,
                    background: '#FFE0E6',
                    border: '3px solid #FF8FAB',
                }}
            >
                {img}
            </div>
        );
    }

    return (
        <div className={`flex-shrink-0 ${className}`}>
            {img}
        </div>
    );
}
