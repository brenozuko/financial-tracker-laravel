<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderCategoriesRequest;
use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use App\Support\CategoryIcons;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Category::class);

        return Inertia::render('categories/index', [
            'categories' => $this->categoryService->listOrderedForUser($request->user()),
            'categoryIcons' => CategoryIcons::values(),
        ]);
    }

    public function reorder(ReorderCategoriesRequest $request): RedirectResponse
    {
        /** @var list<int> $orderedIds */
        $orderedIds = array_map(intval(...), $request->validated('ordered_ids'));

        $this->categoryService->reorderForUser($request->user(), $orderedIds);

        return redirect()->back()->with('success', __('Categories reordered.'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon' => ['nullable', 'string', Rule::in(CategoryIcons::values())],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->categoryService->store($request->user(), [
            'name' => $request->input('name'),
            'color' => $request->input('color'),
            'icon' => $request->input('icon'),
            'sort_order' => $request->input('sort_order'),
        ]);

        return redirect()->back()->with('success', __('Category created.'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $this->authorize('update', $category);

        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon' => ['nullable', 'string', Rule::in(CategoryIcons::values())],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->categoryService->update($category, $request->all());

        return redirect()->back()->with('success', __('Category updated.'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        $this->categoryService->deleteOrFail($category);

        return redirect()->back()->with('success', __('Category deleted.'));
    }
}
