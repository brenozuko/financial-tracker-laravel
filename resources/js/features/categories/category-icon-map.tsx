import type { LucideIcon } from 'lucide-react';
import {
    Car,
    CircleEllipsis,
    CreditCard,
    Gamepad2,
    GraduationCap,
    HeartPulse,
    House,
    PiggyBank,
    Repeat,
    ShoppingBag,
    Star,
    Utensils,
    Wallet,
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
    car: Car,
    'circle-ellipsis': CircleEllipsis,
    'credit-card': CreditCard,
    'gamepad-2': Gamepad2,
    'graduation-cap': GraduationCap,
    'heart-pulse': HeartPulse,
    house: House,
    'piggy-bank': PiggyBank,
    repeat: Repeat,
    'shopping-bag': ShoppingBag,
    star: Star,
    utensils: Utensils,
    wallet: Wallet,
};

type CategoryIconProps = {
    name: string | null;
    className?: string;
};

export function CategoryIcon({ name, className }: CategoryIconProps) {
    if (!name) {
        return null;
    }

    const Icon = CATEGORY_ICON_MAP[name];

    if (!Icon) {
        return null;
    }

    return <Icon className={className} />;
}
