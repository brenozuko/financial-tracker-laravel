# Plano de Implementação — Gerenciador Financeiro Pessoal

Um tutorial passo a passo. Cada capítulo constrói em cima do anterior. Os conceitos de Laravel aparecem quando fazem sentido no projeto, não isolados.

O starter kit React do Laravel já entrega: Fortify configurado, todas as telas de auth (login, registro, reset de senha, verificação de email), tela de settings (update de perfil, senha, exclusão de conta), layouts prontos (sidebar + auth), shadcn/ui, TypeScript, Tailwind 4, Inertia 2. Esse plano parte daí — sem repetir o que já veio pronto.

**Pré-requisitos:** PHP 8.2+, Composer, Node.js 20+, PostgreSQL rodando local, Redis rodando local (pra queues).

---

## Capítulo 0 — Setup do projeto

**Conceitos:** Laravel installer, estrutura de diretórios, configuração de ambiente.

### 0.1 — Criar o projeto

```
laravel new finance-manager
```

O installer pergunta a stack. Escolha React com Inertia. Escolha Pest como test runner. Escolha PostgreSQL como banco.

O starter kit já instala: `laravel/fortify`, `@inertiajs/react`, `react`, `tailwindcss`, `shadcn/ui`, TypeScript configurado, e todas as páginas de auth em `resources/js/pages/auth/`. Abra o projeto e explore o que veio pronto — entender a estrutura do starter kit é o primeiro passo.

### 0.2 — Configurar o `.env`

Configure as variáveis de banco (`DB_CONNECTION=pgsql`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`). Configure `QUEUE_CONNECTION=redis` e `REDIS_HOST=127.0.0.1`. Configure `MAIL_MAILER=log` por enquanto (emails vão pro log em vez de serem enviados de verdade).

Rode `php artisan migrate`. O starter kit cria as tabelas `users`, `password_reset_tokens`, `sessions`, `cache`, `jobs`.

### 0.3 — Instalar dependência adicional

O starter kit já traz shadcn/ui, Tailwind e Lucide icons. A única lib extra que você precisa agora é a de gráficos:

```
npm install recharts
```

### 0.4 — Verificar que tudo funciona

Rode `composer run dev` (o starter kit já configura esse comando pra subir Laravel + Vite juntos). Abra `localhost:8000`. Teste o fluxo de auth: registro → login → settings → logout. Tudo funciona sem você escrever uma linha de código.

Explore os arquivos que o starter kit gerou:

- `app/Actions/Fortify/` — Actions de auth (CreateNewUser, UpdateUserProfile, etc.)
- `config/fortify.php` — Features habilitadas
- `resources/js/pages/auth/` — Telas de login, registro, reset
- `resources/js/pages/settings/` — Telas de perfil, senha, exclusão de conta
- `resources/js/layouts/` — AppLayout (sidebar) e AuthLayout
- `resources/js/components/ui/` — Componentes shadcn/ui

### 0.5 — Adicionar colunas custom na tabela users

O starter kit cria a tabela `users` padrão do Laravel. Adicione as colunas do projeto:

```
php artisan make:migration add_profile_columns_to_users_table
```

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('currency', 3)->default('BRL');
    $table->boolean('notifications_enabled')->default(true);
});
```

Rode `php artisan migrate`. Atualize o model `User.php` adicionando os novos campos no `$fillable`.

Opcionalmente, adicione currency e notifications na tela de settings que o starter kit já criou — basta editar a Action `UpdateUserProfileInformation` e a página React correspondente.

### 0.6 — Configurar redirect pós-login

No `config/fortify.php`, configure `'home' => '/dashboard'`. Crie um `DashboardController` placeholder que retorna uma página Inertia vazia por enquanto, e registre a rota protegida:

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
});
```

**Checkpoint:** Projeto rodando com auth completa. Banco conectado. Você entende a estrutura do starter kit e onde cada coisa fica. Zero código de auth escrito na mão.

---

## Capítulo 1 — Categorias (CRUD básico)

**Conceitos:** Resource Controllers, Migrations, Eloquent Models, Seeders, Observers, Form Requests, Policies.

Este é o primeiro código que você escreve de verdade. Um CRUD simples pra aquecer antes das features mais complexas.

> **CLI shorthand:** Se quiser gerar tudo de uma vez:
> ```
> php artisan make:model Category -mcrRs --policy
> ```
> Isso cria Model, Migration (`-m`), Controller resource (`-cr`), Form Requests (`-R`), Seeder (`-s`) e Policy (`--policy`). Depois você ainda precisa criar o Observer separado (`make:observer`). O tutorial abaixo explica cada arquivo individualmente pra você entender o que cada um faz.

### 1.1 — Migration

```
php artisan make:migration create_categories_table
```

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name', 100);
    $table->string('color', 7)->default('#6b7280');
    $table->string('icon', 50)->nullable();
    $table->integer('sort_order')->default(0);
    $table->boolean('is_default')->default(false);
    $table->timestamps();

    $table->index(['user_id', 'sort_order']);
});
```

Rode `php artisan migrate`. Observe como `foreignId(...)->constrained()->cascadeOnDelete()` cria a FK com cascade numa linha só. Abra o banco e confira a tabela — acostume-se a verificar que a migration fez o que você esperava.

### 1.2 — Model

```
php artisan make:model Category
```

Configure `$fillable`, o `belongsTo` com User, e o `hasMany` com Transaction (que você vai criar no próximo capítulo — por enquanto só declare o relationship, mesmo sem a tabela).

Adicione um scope `ordered()`:

```php
public function scopeOrdered(Builder $query): Builder
{
    return $query->orderBy('sort_order');
}
```

No model `User`, adicione o relationship `categories()`:

```php
public function categories(): HasMany
{
    return $this->hasMany(Category::class);
}
```

### 1.3 — Seeder + Observer

O seeder define as categorias padrão. O Observer copia elas pra cada novo usuário.

```
php artisan make:seeder CategorySeeder
```

Crie um método estático `defaults()` que retorna o array de categorias padrão:

```php
public static function defaults(): array
{
    return [
        ['name' => 'Alimentação', 'color' => '#ef4444', 'icon' => 'utensils'],
        ['name' => 'Transporte', 'color' => '#f59e0b', 'icon' => 'car'],
        ['name' => 'Moradia', 'color' => '#3b82f6', 'icon' => 'home'],
        ['name' => 'Saúde', 'color' => '#22c55e', 'icon' => 'heart-pulse'],
        ['name' => 'Lazer', 'color' => '#8b5cf6', 'icon' => 'gamepad-2'],
        ['name' => 'Educação', 'color' => '#06b6d4', 'icon' => 'graduation-cap'],
        ['name' => 'Compras', 'color' => '#ec4899', 'icon' => 'shopping-bag'],
        ['name' => 'Assinaturas', 'color' => '#f97316', 'icon' => 'repeat'],
        ['name' => 'Outros', 'color' => '#6b7280', 'icon' => 'ellipsis'],
    ];
}
```

```
php artisan make:observer UserObserver --model=User
```

No método `created()`, crie as categorias padrão pro novo usuário:

```php
public function created(User $user): void
{
    foreach (CategorySeeder::defaults() as $i => $category) {
        $user->categories()->create([
            ...$category,
            'sort_order' => $i,
            'is_default' => true,
        ]);
    }
}
```

Registre o Observer no model User com o atributo `#[ObservedBy(UserObserver::class)]`.

Teste: crie um novo usuário via registro. Confira no banco que as 9 categorias foram criadas. Se você já tem usuários de teste no banco sem categorias, delete-os e recrie.

### 1.4 — Form Requests

```
php artisan make:request StoreCategoryRequest
php artisan make:request UpdateCategoryRequest
```

No `StoreCategoryRequest`:

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:100'],
        'color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        'icon' => ['nullable', 'string', 'max:50'],
    ];
}
```

Form Requests isolam a validação do controller. Quando a validação falha, o Inertia recebe os erros automaticamente e o `useForm` os popula no front.

### 1.5 — Policy

```
php artisan make:policy CategoryPolicy --model=Category
```

Implemente `view`, `update`, `delete`: todos checam `$category->user_id === $user->id`. No `delete`, adicione: não permitir deletar se `is_default === true`.

O Laravel 12 resolve Policies automaticamente pela naming convention (CategoryPolicy → Category). Não precisa registrar manualmente.

### 1.6 — Controller

```
php artisan make:controller CategoryController --resource
```

**index:** `$request->user()->categories()->ordered()->get()` → `Inertia::render('Categories/Index', [...])`.

**store:** Recebe `StoreCategoryRequest`, cria a categoria, redireciona com flash.

**update:** Recebe `UpdateCategoryRequest`, atualiza, redireciona.

**destroy:** Se tem transações vinculadas, move pra "Outros" ou retorna erro. Se não, deleta.

Registre as rotas:

```php
Route::resource('categories', CategoryController::class)->except(['show', 'create', 'edit']);
```

O `except` remove rotas que não fazem sentido numa SPA — criar e editar acontecem na mesma tela (modal ou inline).

### 1.7 — Tela React

**Categories/Index.tsx:** Use os componentes shadcn/ui que já vieram no starter kit (Button, Input, Dialog, etc.). Lista de categorias com badge de cor. Botão "Nova categoria" abre um Dialog com o form. Cada item tem botões de editar e excluir. O form usa `useForm` do Inertia.

Pra reordenação via drag-and-drop, instale `@dnd-kit/core` e envie a nova ordem via PATCH.

**Checkpoint:** CRUD completo. Você entende Resource Controllers, Form Requests, Policies, Seeders, Observers, e o ciclo create-validate-persist-redirect do Inertia.

---

## Capítulo 2 — Transações (CRUD manual)

**Conceitos:** Eloquent Scopes, Enums PHP, Filtros dinâmicos, Paginação, Bulk operations.

### 2.1 — Enum de tipo

> **CLI shorthand:** Gere o esqueleto completo:
> ```
> php artisan make:model Transaction -mcrRs --policy
> ```
> Cria Model, Migration, Controller resource, Form Requests (Store + Update), Seeder e Policy. O Enum e os Scopes você adiciona manualmente no model.

Crie `app/Enums/TransactionType.php`:

```php
enum TransactionType: string
{
    case Income = 'income';
    case Expense = 'expense';
}
```

Enums nativos do PHP 8.1+ se integram com Eloquent via casting. O banco armazena a string, o PHP trabalha com o enum tipado.

### 2.2 — Migration

```
php artisan make:migration create_transactions_table
```

Siga o schema do documento de banco. Pontos de atenção: `document_id` é `nullable()` (transações manuais), `category_id` usa `nullOnDelete()` em vez de `cascadeOnDelete()`. O campo `amount` é integer, nunca decimal.

Adicione os índices compostos:

```php
$table->index(['user_id', 'date']);
$table->index(['user_id', 'is_confirmed']);
```

### 2.3 — Model com Scopes

Configure `$fillable`, `$casts` (com `'type' => TransactionType::class`, `'date' => 'date'`, `'is_confirmed' => 'boolean'`, `'amount' => 'integer'`).

Defina os relationships e scopes:

```php
public function scopeConfirmed(Builder $query): Builder
{
    return $query->where('is_confirmed', true);
}

public function scopeThisMonth(Builder $query): Builder
{
    return $query->whereBetween('date', [
        now()->startOfMonth(),
        now()->endOfMonth(),
    ]);
}

public function scopeExpenses(Builder $query): Builder
{
    return $query->where('type', TransactionType::Expense);
}

public function scopeIncome(Builder $query): Builder
{
    return $query->where('type', TransactionType::Income);
}

public function scopeByCategory(Builder $query, int $categoryId): Builder
{
    return $query->where('category_id', $categoryId);
}
```

Scopes deixam queries legíveis: `Transaction::confirmed()->thisMonth()->expenses()->sum('amount')`.

### 2.4 — Form Request e Policy

`StoreTransactionRequest` valida: `date` (required, date, before_or_equal:today), `amount` (required, integer, min:1), `type` (required, in:income,expense), `description` (required, string, max:500), `category_id` (nullable, exists na tabela do user), `notes` (nullable, string).

Pra garantir que o `category_id` pertence ao usuário autenticado:

```php
'category_id' => ['nullable', Rule::exists('categories', 'id')
    ->where('user_id', $this->user()->id)],
```

A `TransactionPolicy` segue o mesmo padrão da `CategoryPolicy`: usuário só acessa suas transações.

### 2.5 — Controller com filtros

O `TransactionController@index` é o método mais interessante. Ele constrói a query dinamicamente a partir dos filtros na query string:

```php
public function index(Request $request)
{
    $query = $request->user()
        ->transactions()
        ->with('category')
        ->orderByDesc('date');

    if ($request->filled('category_id')) {
        $query->byCategory($request->category_id);
    }

    if ($request->filled('type')) {
        $query->where('type', $request->type);
    }

    if ($request->filled('date_from') && $request->filled('date_to')) {
        $query->whereBetween('date', [$request->date_from, $request->date_to]);
    }

    if ($request->filled('search')) {
        $query->where('description', 'ilike', "%{$request->search}%");
    }

    return Inertia::render('Transactions/Index', [
        'transactions' => $query->paginate(25)->withQueryString(),
        'categories' => $request->user()->categories()->ordered()->get(),
        'filters' => $request->only(['category_id', 'type', 'date_from', 'date_to', 'search']),
    ]);
}
```

O `withQueryString()` mantém os filtros na URL durante a paginação. O `ilike` é o LIKE case-insensitive do PostgreSQL.

O `store` cria transações manuais já confirmadas:

```php
public function store(StoreTransactionRequest $request)
{
    $request->user()->transactions()->create([
        ...$request->validated(),
        'is_confirmed' => true,
    ]);

    return back()->with('success', 'Transação criada.');
}
```

### 2.6 — Bulk confirm/reject

Endpoint separado `POST /transactions/bulk`:

```php
public function bulk(Request $request)
{
    $request->validate([
        'ids' => ['required', 'array'],
        'ids.*' => ['integer'],
        'action' => ['required', 'in:confirm,reject'],
    ]);

    $query = $request->user()->transactions()->whereIn('id', $request->ids);

    match ($request->action) {
        'confirm' => $query->update(['is_confirmed' => true]),
        'reject' => $query->delete(),
    };

    return back();
}
```

### 2.7 — Telas React

**Transactions/Index.tsx:** Tabela com colunas: data, descrição, categoria (badge com cor), valor, tipo. Barra de filtros no topo (use os componentes Select, Input, DatePicker do shadcn/ui). Paginação no rodapé. Botão pra criar transação manual abre Dialog.

Pra formatar valores:

```ts
function formatBRL(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    });
}
```

**Checkpoint:** CRUD de transações com filtros, paginação, scopes, enums PHP, e bulk operations.

---

## Capítulo 3 — Dashboard e analytics

**Conceitos:** Query aggregations, selectRaw, groupBy, Carbon, Inertia props, Recharts.

### 3.1 — Controller do Dashboard

Transforme o `DashboardController` placeholder num invokable controller que monta todas as props:

```php
public function __invoke(Request $request)
{
    $user = $request->user();
    $month = $request->input('month', now()->format('Y-m'));
    $start = Carbon::parse($month)->startOfMonth();
    $end = Carbon::parse($month)->endOfMonth();

    $summary = $user->transactions()
        ->confirmed()
        ->whereBetween('date', [$start, $end])
        ->selectRaw("
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
        ")
        ->first();

    $byCategory = $user->transactions()
        ->confirmed()
        ->expenses()
        ->whereBetween('date', [$start, $end])
        ->join('categories', 'transactions.category_id', '=', 'categories.id')
        ->selectRaw('categories.name, categories.color, SUM(transactions.amount) as total')
        ->groupBy('categories.name', 'categories.color')
        ->orderByDesc('total')
        ->get();

    $dailyExpenses = $user->transactions()
        ->confirmed()
        ->expenses()
        ->whereBetween('date', [$start, $end])
        ->selectRaw('date, SUM(amount) as total')
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    return Inertia::render('Dashboard', [
        'month' => $month,
        'summary' => $summary,
        'byCategory' => $byCategory,
        'dailyExpenses' => $dailyExpenses,
    ]);
}
```

Estude o `selectRaw` e o `CASE WHEN` — é como você faz aggregations condicionais numa query só. O `groupBy` precisa listar todas as colunas que não são aggregations (regra do PostgreSQL, mais estrito que MySQL).

### 3.2 — Endpoint de analytics mensal

Crie `AnalyticsController@monthly` que retorna a série temporal dos últimos N meses:

```php
public function monthly(Request $request)
{
    $months = $request->input('months', 6);
    $start = now()->subMonths($months - 1)->startOfMonth();

    $data = $request->user()->transactions()
        ->confirmed()
        ->where('date', '>=', $start)
        ->selectRaw("
            TO_CHAR(date, 'YYYY-MM') as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        ")
        ->groupByRaw("TO_CHAR(date, 'YYYY-MM')")
        ->orderByRaw("TO_CHAR(date, 'YYYY-MM')")
        ->get();

    return response()->json($data);
}
```

O `TO_CHAR` é função do PostgreSQL pra formatar datas. Guarde isso — em MySQL seria `DATE_FORMAT`.

### 3.3 — Telas React com Recharts

**Dashboard.tsx:** Quatro componentes visuais:

Cards de resumo: três cards do shadcn/ui (use o componente Card) mostrando receita, despesa e saldo. Verde pra positivo, vermelho pra negativo.

Donut chart (`PieChart` + `Pie` do Recharts): dados de `byCategory`. Cada fatia usa a cor da categoria.

Line chart (`LineChart`): dados de `dailyExpenses`. Eixo X = dia, eixo Y = valor.

Bar chart (`BarChart`): dados de `/analytics/monthly`. Duas barras por mês: receita e despesa. Busque via `fetch` separado (não via Inertia props, já que é JSON puro).

Adicione um seletor de mês que navega via `router.get('/dashboard', { month: '2026-03' })` do Inertia.

**Checkpoint:** Dashboard funcional com queries de aggregação, raw SQL no Eloquent, Carbon pra datas, e gráficos React.

---

## Capítulo 4 — Orçamentos mensais

**Conceitos:** Unique constraints compostas, computed properties, Eloquent subqueries, N+1.

### 4.1 — Migration

> **CLI shorthand:**
> ```
> php artisan make:model Budget -mcrRs --policy
> ```
> Mesmo padrão dos capítulos anteriores. Gera tudo de uma vez.

Crie a tabela `budgets` seguindo o schema. O ponto mais importante é a constraint unique composta:

```php
$table->unique(['user_id', 'category_id', 'month']);
```

Isso impede no banco que o usuário crie dois orçamentos pra mesma categoria no mesmo mês. Mesmo que a validação do PHP falhe, o banco barra.

### 4.2 — Model

O `Budget` model tem um cálculo dinâmico: o valor gasto. Ele não vive no banco — é computado a cada request.

O problema: se você listar 10 orçamentos e chamar `spent()` em cada um, faz 10 queries (N+1). Resolva no controller calculando todos os totais numa query e injetando:

```php
$budgets = $user->budgets()->with('category')->where('month', $start)->get();

$spentByCategory = $user->transactions()
    ->confirmed()->expenses()
    ->whereBetween('date', [$start, $end])
    ->selectRaw('category_id, SUM(amount) as total')
    ->groupBy('category_id')
    ->pluck('total', 'category_id');

$budgets->each(function ($b) use ($spentByCategory) {
    $b->spent_amount = $spentByCategory[$b->category_id] ?? 0;
    $b->percentage = $b->amount > 0
        ? round(($b->spent_amount / $b->amount) * 100, 1)
        : 0;
});
```

### 4.3 — Form Request com validação de unicidade

No `StoreBudgetRequest`, valide que não existe outro orçamento pro mesmo par (categoria, mês):

```php
'category_id' => [
    'required',
    Rule::exists('categories', 'id')->where('user_id', $this->user()->id),
    Rule::unique('budgets')
        ->where('user_id', $this->user()->id)
        ->where('month', $this->month),
],
```

### 4.4 — Controller e telas

CRUD padrão. A tela lista os orçamentos do mês com barra de progresso colorida (verde < 80%, amarelo 80-100%, vermelho > 100%). Use o componente Progress do shadcn/ui. O form de criação mostra um dropdown de categorias que ainda não têm orçamento naquele mês.

No dashboard, adicione um alerta quando algum orçamento está acima de 80%.

**Checkpoint:** Orçamentos funcionando com constraints compostas, N+1 resolvido.

---

## Capítulo 5 — Upload e extração com IA

**Conceitos:** Jobs, Queues, Storage facade, HTTP Client, Enums, JSON columns, Service classes.

Este é o capítulo mais complexo. Divida em partes menores.

### 5.1 — Enum de status

> **CLI shorthand:**
> ```
> php artisan make:model Document -mcrRs --policy
> php artisan make:job ProcessDocumentJob
> ```
> A primeira linha gera Model, Migration, Controller, Form Requests, Seeder e Policy. A segunda cria o Job. O `ExtractionService` você cria manualmente (Laravel não tem generator pra services).

Crie `app/Enums/DocumentStatus.php`:

```php
enum DocumentStatus: string
{
    case Queued = 'queued';
    case Processing = 'processing';
    case Done = 'done';
    case Failed = 'failed';
}
```

### 5.2 — Migration e Model

Crie a tabela `documents` seguindo o schema. No Model, configure `'status' => DocumentStatus::class` e `'metadata' => 'array'` nos casts.

### 5.3 — Upload flow

O controller faz três coisas em sequência: salva o arquivo, cria o registro, dispara o job.

```php
public function store(StoreDocumentRequest $request)
{
    $file = $request->file('file');
    $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

    Storage::disk('local')->putFileAs('documents', $file, $filename);

    $document = $request->user()->documents()->create([
        'filename' => $filename,
        'original_name' => $file->getClientOriginalName(),
        'mime_type' => $file->getMimeType(),
        'status' => DocumentStatus::Queued,
    ]);

    ProcessDocumentJob::dispatch($document);

    return back()->with('success', 'Documento enviado pra processamento.');
}
```

O `dispatch` coloca o job na fila do Redis. O controller retorna imediatamente.

### 5.4 — O Job de processamento

```
php artisan make:job ProcessDocumentJob
```

O job recebe o `Document` no construtor (Laravel serializa e deserializa automaticamente). No `handle()`, delega pro `ExtractionService`:

```php
public function handle(ExtractionService $service): void
{
    $this->document->update(['status' => DocumentStatus::Processing]);

    try {
        $transactions = $service->extract($this->document);
        $this->document->user->transactions()->createMany($transactions);
        $this->document->update([
            'status' => DocumentStatus::Done,
            'transaction_count' => count($transactions),
        ]);
    } catch (\Throwable $e) {
        $this->document->update([
            'status' => DocumentStatus::Failed,
            'error_message' => $e->getMessage(),
        ]);
    }
}
```

A lógica de extração fica no service, não no job. O job só orquestra.

### 5.5 — ExtractionService

Crie `app/Services/ExtractionService.php`. Decide a estratégia pelo `mime_type` e chama a API:

```php
class ExtractionService
{
    public function extract(Document $document): array
    {
        $path = Storage::disk('local')->path("documents/{$document->filename}");

        return match (true) {
            str_contains($document->mime_type, 'csv') => $this->parseCSV($path),
            default => $this->extractWithVision($path, $document->mime_type),
        };
    }

    private function extractWithVision(string $path, string $mimeType): array
    {
        $base64 = base64_encode(file_get_contents($path));

        $response = Http::withHeaders([
            'x-api-key' => config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => 'claude-sonnet-4-20250514',
            'max_tokens' => 4096,
            'messages' => [[
                'role' => 'user',
                'content' => [
                    [
                        'type' => 'image',
                        'source' => [
                            'type' => 'base64',
                            'media_type' => $mimeType,
                            'data' => $base64,
                        ],
                    ],
                    [
                        'type' => 'text',
                        'text' => $this->buildPrompt(),
                    ],
                ],
            ]],
        ]);

        $json = $response->json('content.0.text');
        $parsed = json_decode($json, true);

        return $this->validateAndFormat($parsed);
    }

    private function buildPrompt(): string
    {
        return <<<PROMPT
        Extraia todas as transações financeiras deste documento.
        Retorne APENAS um JSON array, sem markdown, sem explicação.
        Cada item: {"date":"YYYY-MM-DD","amount":1234,"type":"expense|income","description":"texto"}
        amount em centavos (R$42.50 = 4250). Sempre positivo.
        PROMPT;
    }

    private function validateAndFormat(array $items): array
    {
        $valid = [];
        foreach ($items as $item) {
            $validator = Validator::make($item, [
                'date' => 'required|date_format:Y-m-d',
                'amount' => 'required|integer|min:1',
                'type' => 'required|in:income,expense',
                'description' => 'required|string|max:500',
            ]);

            if ($validator->passes()) {
                $valid[] = [...$validator->validated(), 'is_confirmed' => false];
            }
        }
        return $valid;
    }
}
```

Registre a API key no `config/services.php`:

```php
'anthropic' => ['key' => env('ANTHROPIC_API_KEY')],
```

O `Http` facade do Laravel é o HTTP Client. Estude a documentação dele — é o que você usa pra toda comunicação com APIs externas.

### 5.6 — Rodar o worker

Em dev, rode o queue worker num terminal separado:

```
php artisan queue:work --tries=3
```

O `--tries=3` tenta o job 3 vezes antes de marcar como falho. Faça upload de um extrato e acompanhe no terminal.

### 5.7 — Polling no frontend

O frontend precisa saber quando o processamento terminou. Use partial reloads do Inertia:

```tsx
useEffect(() => {
    if (document.status === 'queued' || document.status === 'processing') {
        const interval = setInterval(() => {
            router.reload({ only: ['documents'] });
        }, 3000);
        return () => clearInterval(interval);
    }
}, [document.status]);
```

O `router.reload({ only: ['documents'] })` busca só a prop `documents` sem recarregar a página.

### 5.8 — Tela de revisão

Depois que a extração termina, o usuário vê a lista de transações extraídas (não confirmadas). Cada linha tem: data, descrição, valor, tipo, e um Select de categoria. O usuário pode editar qualquer campo, confirmar individualmente, ou confirmar todas em bulk.

Use o endpoint `POST /transactions/bulk` que você criou no Capítulo 2.

**Checkpoint:** Pipeline completo de upload → fila → extração com IA → revisão → confirmação.

---

## Capítulo 6 — Relatórios mensais

**Conceitos:** PDF generation, Blade views como templates, data formatting.

### 6.1 — Instalar DomPDF

```
composer require barryvdh/laravel-dompdf
```

### 6.2 — Controller de relatórios

> **CLI shorthand:**
> ```
> php artisan make:controller ReportController
> ```
> Sem `--resource` — o ReportController não é um CRUD, são endpoints avulsos (`show` e `pdf`).

O `ReportController@show` reusa as mesmas queries do dashboard mas retorna dados mais completos:

```php
public function show(Request $request)
{
    $month = $request->input('month', now()->format('Y-m'));
    // ... mesmas queries do dashboard, plus:
    // - top 5 maiores gastos
    // - status de todos os budgets
    // - comparativo com mês anterior

    return Inertia::render('Reports/Monthly', compact(
        'month', 'summary', 'byCategory', 'topExpenses', 'budgetStatus', 'comparison'
    ));
}
```

### 6.3 — Geração de PDF

O endpoint `GET /reports/monthly/pdf` usa uma view Blade como template:

```php
public function pdf(Request $request)
{
    // ... montar os mesmos dados
    $pdf = Pdf::loadView('reports.monthly', compact(...));
    return $pdf->download("relatorio-{$month}.pdf");
}
```

Crie a view Blade em `resources/views/reports/monthly.blade.php`. DomPDF renderiza HTML/CSS puro (sem JS). Use tabelas HTML e CSS inline. O DomPDF tem limitações com CSS moderno, então mantenha simples.

O PDF é a única parte do projeto onde você usa Blade. O resto é tudo Inertia/React.

### 6.4 — Tela React

A tela mostra os mesmos dados do PDF em formato web (com Recharts). O botão "Exportar PDF" faz `window.open('/reports/monthly/pdf?month=2026-04')`.

**Checkpoint:** Relatórios em tela e PDF. Você entende DomPDF, Blade como template engine, e a diferença entre renderização server-side (Blade/PDF) e client-side (React/Inertia).

---

## Capítulo 7 — Testes e polimento

**Conceitos:** Pest, Factories, mocking, feature tests.

### 7.1 — Factories

Crie factories pra todos os models. O starter kit já vem com `UserFactory`:

```php
// database/factories/TransactionFactory.php
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'date' => fake()->dateTimeBetween('-3 months'),
        'amount' => fake()->numberBetween(100, 500000),
        'type' => fake()->randomElement(TransactionType::cases()),
        'description' => fake()->sentence(3),
        'is_confirmed' => true,
    ];
}
```

Crie factories pra Category, Document e Budget também.

### 7.2 — DatabaseSeeder pra desenvolvimento

```php
public function run(): void
{
    $user = User::factory()->create(['email' => 'breno@test.com']);
    // Observer cria categorias automaticamente
    Transaction::factory(200)->for($user)->create();
}
```

Rode `php artisan migrate:fresh --seed`.

### 7.3 — Feature tests

O starter kit já vem com testes de auth. Foque nos testes das features que você construiu:

```php
test('user can only see own transactions', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $transaction = Transaction::factory()->for($user2)->create();

    $this->actingAs($user1)
        ->get("/transactions/{$transaction->id}")
        ->assertForbidden();
});

test('extraction service rejects malformed output', function () {
    $service = new ExtractionService();
    $result = $service->validateAndFormat([
        ['date' => 'not-a-date', 'amount' => -100, 'type' => 'invalid'],
        ['date' => '2026-04-01', 'amount' => 4250, 'type' => 'expense', 'description' => 'Uber'],
    ]);

    expect($result)->toHaveCount(1);
    expect($result[0]['description'])->toBe('Uber');
});

test('upload dispatches processing job', function () {
    Queue::fake();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/documents', [
            'file' => UploadedFile::fake()->create('extrato.pdf', 1024, 'application/pdf'),
        ]);

    Queue::assertPushed(ProcessDocumentJob::class);
});
```

Rode com `php artisan test` ou `./vendor/bin/pest`.

### 7.4 — Ajustes na tela de settings

O starter kit já criou a tela de settings com update de perfil, senha, e exclusão de conta. Adicione os campos `currency` e `notifications_enabled`:

Edite a Action `UpdateUserProfileInformation` pra aceitar os novos campos. Edite a página React de settings pra exibir um Select de moeda e um Switch de notificações (ambos componentes do shadcn/ui).

**Checkpoint final:** Sistema completo, testado, com dados de seed.

---

## Referência rápida — flags do `make:model`

| Flag | O que gera | Arquivo |
|---|---|---|
| `-m` | Migration | `database/migrations/xxxx_create_models_table.php` |
| `-c` | Controller (vazio) | `app/Http/Controllers/ModelController.php` |
| `-r` | Controller resource (com index, store, etc.) | mesmo acima, com métodos CRUD |
| `-R` | Form Requests (Store + Update) | `app/Http/Requests/StoreModelRequest.php` e `UpdateModelRequest.php` |
| `-s` | Seeder | `database/seeders/ModelSeeder.php` |
| `-f` | Factory | `database/factories/ModelFactory.php` |
| `--policy` | Policy | `app/Policies/ModelPolicy.php` |
| `--all` / `-a` | Tudo acima + Factory | equivale a `-mcrRfs --policy` |

Exemplo completo pra gerar Model + Migration + Resource Controller + Form Requests + Factory + Seeder + Policy:

```
php artisan make:model Category -a
```

O `-a` é o atalho máximo, mas gera Factory e Seeder mesmo quando você não precisa deles ainda. Nos capítulos anteriores, os shorthands usam flags específicas pra gerar só o necessário.

---

## Referência rápida — conceitos por capítulo

| Capítulo | Conceitos Laravel |
|---|---|
| 0 — Setup | Installer, starter kit, estrutura de diretórios, .env |
| 1 — Categorias | Resource Controllers, Migrations, Seeders, Observers, Form Requests, Policies |
| 2 — Transações | Eloquent Scopes, PHP Enums, filtros dinâmicos, paginação, bulk operations |
| 3 — Dashboard | selectRaw, groupBy, aggregations, Carbon, Inertia props |
| 4 — Orçamentos | Unique constraints compostas, N+1, computed properties |
| 5 — Upload/IA | Jobs, Queues, Storage, HTTP Client, Service classes, JSON columns |
| 6 — Relatórios | DomPDF, Blade templates, PDF generation |
| 7 — Polimento | Pest tests, Factories, mocking, feature tests |

---

## O que o starter kit já entregou (você não precisa fazer)

Pra referência, estes itens já vieram prontos e não aparecem no tutorial:

- Fortify instalado e configurado (Service Provider, Actions, config)
- Telas de login, registro, reset de senha, verificação de email (React/Inertia/TypeScript)
- Tela de settings com update de perfil, update de senha, e exclusão de conta
- Layouts prontos: AppLayout com sidebar, AuthLayout centralizado
- Componentes shadcn/ui instalados e configurados
- TypeScript configurado
- Tailwind 4 configurado
- Vite configurado com React plugin
- Testes de auth com Pest
- Middleware de auth e verified já aplicados nas rotas de settings
