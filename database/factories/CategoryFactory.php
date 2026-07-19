<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use App\Support\CategoryIcons;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'color' => fake()->hexColor(),
            'icon' => fake()->optional(0.7)->randomElement(CategoryIcons::values()),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
