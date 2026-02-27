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

const variantStyles: Record<Variant, string> = {
    primary:
        'bg-gradient-to-b from-amber-400 to-amber-500 text-amber-900 shadow-md hover:from-amber-500 hover:to-amber-600',
    secondary:
        'bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50',
    danger:
        'bg-gradient-to-b from-rose-400 to-rose-500 text-white shadow-md',
    success:
        'bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-md',
    ghost:
        'bg-transparent text-slate-500 hover:bg-slate-100',
};

const sizeStyles: Record<Size, string> = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
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
    return (
        <motion.button
            whileTap={disabled ? undefined : { scale: 0.95 }}
            whileHover={disabled ? undefined : { scale: 1.02 }}
            className={`
        font-display font-bold
        transition-colors duration-150
        select-none cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed saturate-0' : ''}
        ${className}
      `}
            disabled={disabled}
            {...(props as any)}
        >
            {children}
        </motion.button>
    );
}
