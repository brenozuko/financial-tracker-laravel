<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ReorderCategoriesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('reorder', Category::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => [
                'integer',
                Rule::exists('categories', 'id')->where('user_id', $this->user()->id),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var list<int> $orderedIds */
            $orderedIds = $validator->getData()['ordered_ids'] ?? [];

            if (count($orderedIds) !== count(array_unique($orderedIds))) {
                $validator->errors()->add(
                    'ordered_ids',
                    __('The ordered ids must not contain duplicates.'),
                );

                return;
            }

            $expectedIds = $this->user()
                ->categories()
                ->orderBy('id')
                ->pluck('id')
                ->map(fn (mixed $id): int => (int) $id)
                ->all();

            $sortedOrdered = $orderedIds;
            sort($sortedOrdered);

            $sortedExpected = $expectedIds;
            sort($sortedExpected);

            if ($sortedOrdered !== $sortedExpected) {
                $validator->errors()->add(
                    'ordered_ids',
                    __('The ordered ids must include every category exactly once.'),
                );
            }
        });
    }
}
