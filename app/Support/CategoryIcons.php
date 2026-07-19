<?php

namespace App\Support;

final class CategoryIcons
{
    /**
     * Allowed Lucide icon names (kebab-case) for category icons.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            'car',
            'circle-ellipsis',
            'credit-card',
            'gamepad-2',
            'graduation-cap',
            'heart-pulse',
            'house',
            'piggy-bank',
            'repeat',
            'shopping-bag',
            'star',
            'utensils',
            'wallet',
        ];
    }
}
