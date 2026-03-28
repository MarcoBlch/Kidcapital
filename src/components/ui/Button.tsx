import { motion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    children: ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<Variant, { bg: string; color: string; border?: string; shadow: string; activeShadow: string }> = {
    primary: {
        bg: '#FFD700',
        color: '#4A3800',
        shadow: '0 5px 0 #B8860B, 0 8px 16px rgba(0,0,0,0.2)',
        activeShadow: '0 1px 0 #B8860B, 0 2px 4px rgba(0,0,0,0.2)',
    },
    secondary: {
        bg: '#FFFFFF',
        color: '#1A1A2E',
        border: '2.5px solid #E0E0E0',
        shadow: '0 3px 0 #D0D0D0',
        activeShadow: '0 1px 0 #D0D0D0',
    },
    danger: {
        bg: '#EC407A',
        color: '#FFFFFF',
        shadow: '0 5px 0 #C2185B, 0 8px 16px rgba(0,0,0,0.2)',
        activeShadow: '0 1px 0 #C2185B, 0 2px 4px rgba(0,0,0,0.2)',
    },
    success: {
        bg: '#4CAF50',
        color: '#FFFFFF',
        shadow: '0 5px 0 #2E7D32, 0 8px 16px rgba(0,0,0,0.2)',
        activeShadow: '0 1px 0 #2E7D32, 0 2px 4px rgba(0,0,0,0.2)',
    },
    ghost: {
        bg: 'transparent',
        color: '#5D5D6E',
        shadow: 'none',
        activeShadow: 'none',
    },
};

const sizeStyles: Record<Size, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    fullWidth = false,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const vs = variantStyles[variant];

    return (
        <motion.button
            whileTap={disabled ? undefined : { y: variant === 'ghost' ? 0 : 4 }}
            className={`
                font-display font-bold
                rounded-[16px] select-none cursor-pointer
                transition-all duration-100
                ${sizeStyles[size]}
                ${fullWidth ? 'w-full' : ''}
                ${disabled ? 'opacity-40 cursor-not-allowed saturate-0' : ''}
                ${className}
            `}
            style={{
                background: vs.bg,
                color: vs.color,
                border: vs.border || 'none',
                boxShadow: disabled ? 'none' : vs.shadow,
            }}
            onPointerDown={(e) => {
                if (!disabled && variant !== 'ghost') {
                    const el = e.currentTarget;
                    el.style.boxShadow = vs.activeShadow;
                    el.style.transform = 'translateY(4px)';
                }
            }}
            onPointerUp={(e) => {
                if (!disabled && variant !== 'ghost') {
                    const el = e.currentTarget;
                    el.style.boxShadow = vs.shadow;
                    el.style.transform = 'translateY(0)';
                }
            }}
            onPointerLeave={(e) => {
                if (!disabled && variant !== 'ghost') {
                    const el = e.currentTarget;
                    el.style.boxShadow = vs.shadow;
                    el.style.transform = 'translateY(0)';
                }
            }}
            disabled={disabled}
            {...(props as any)}
        >
            {children}
        </motion.button>
    );
}
