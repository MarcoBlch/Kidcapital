import {
    avatarFox,
    avatarCat,
    avatarBunny,
    avatarOwl,
    avatarLion,
    avatarPanda,
    avatarTurtle,
    avatarMonkey,
    avatarFrog,
    avatarUnicorn,
} from '../../assets/game';

const AVATAR_MAP: Record<string, string> = {
    fox: avatarFox,
    cat: avatarCat,
    bunny: avatarBunny,
    owl: avatarOwl,
    lion: avatarLion,
    panda: avatarPanda,
    turtle: avatarTurtle,
    monkey: avatarMonkey,
    frog: avatarFrog,
    unicorn: avatarUnicorn,
};

interface AvatarImageProps {
    avatar: string;
    size?: number;
    className?: string;
}

export default function AvatarImage({ avatar, size = 36, className = '' }: AvatarImageProps) {
    const src = AVATAR_MAP[avatar];

    if (!src) {
        // Fallback for emoji avatars (e.g. bots or legacy)
        return (
            <span
                className={`flex items-center justify-center ${className}`}
                style={{ width: size, height: size, fontSize: size * 0.6 }}
            >
                {avatar}
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={avatar}
            width={size}
            height={size}
            className={`object-contain ${className}`}
            style={{ width: size, height: size }}
            draggable={false}
        />
    );
}
