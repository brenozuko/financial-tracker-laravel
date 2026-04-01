# Laravel & Artisan command reference

Discover everything registered in this app:

```bash
php artisan list
php artisan help <command>
```

---

## Application & environment

| Command | Purpose |
|--------|---------|
| `php artisan about` | App, PHP, and package versions |
| `php artisan env` | Current `APP_ENV` |
| `php artisan serve` | PHP built-in dev server |
| `php artisan down` / `up` | Maintenance mode on / off |
| `php artisan key:generate` | Generate `APP_KEY` |
| `php artisan config:show <key>` | Inspect config (dot notation) |
| `php artisan docs` | Open Laravel docs |

---

## Database

| Command | Purpose |
|--------|---------|
| `php artisan migrate` | Run pending migrations |
| `php artisan migrate:status` | Migration state |
| `php artisan migrate:rollback` | Roll back last batch |
| `php artisan migrate:reset` | Roll back all |
| `php artisan migrate:refresh` | Roll back + migrate |
| `php artisan migrate:fresh` | Drop all tables + migrate |
| `php artisan db:seed` | Run seeders |
| `php artisan migrate:fresh --seed` | Fresh DB + seed |
| `php artisan db` | Open DB CLI (e.g. sqlite/mysql) |
| `php artisan db:show` | Database info |
| `php artisan db:table <name>` | Table structure |
| `php artisan db:wipe` | Drop all tables (destructive) |
| `php artisan schema:dump` | Dump schema (MySQL/pg) |

---

## Code generation (`make:`)

| Command | Creates |
|--------|---------|
| `php artisan make:controller Name` | Controller |
| `php artisan make:model Name -mf` | Model + migration + factory |
| `php artisan make:migration name` | Migration |
| `php artisan make:request Name` | Form request |
| `php artisan make:policy Name` | Policy |
| `php artisan make:middleware Name` | Middleware |
| `php artisan make:job Name` | Job |
| `php artisan make:event` / `make:listener` | Events |
| `php artisan make:mail Name` | Mailable |
| `php artisan make:notification Name` | Notification |
| `php artisan make:factory Name` | Factory |
| `php artisan make:seeder Name` | Seeder |
| `php artisan make:test Name --pest` | Pest test |
| `php artisan make:class Path/Name` | Generic class |
| `php artisan make:enum Name` | Enum |
| `php artisan make:resource Name` | API resource |
| `php artisan make:view name` | Blade view |

Use `php artisan make:<thing> --help` for options (e.g. API, invokable controller).

---

## Cache, config, routes, views

| Command | Purpose |
|--------|---------|
| `php artisan config:cache` / `config:clear` | Config cache |
| `php artisan route:cache` / `route:clear` | Route cache |
| `php artisan route:list` | All routes (filter: `--path=`, `--name=`) |
| `php artisan view:cache` / `view:clear` | Compiled views |
| `php artisan cache:clear` | Application cache |
| `php artisan optimize` / `optimize:clear` | Bootstrap + config + metadata |

---

## Queues & scheduling

| Command | Purpose |
|--------|---------|
| `php artisan queue:work` | Process jobs |
| `php artisan queue:listen` | Listen (less common than `work`) |
| `php artisan queue:failed` | List failed jobs |
| `php artisan queue:retry <id>` | Retry one failed job |
| `php artisan queue:flush` | Clear failed jobs table |
| `php artisan schedule:list` | Registered schedules |
| `php artisan schedule:run` | Run due tasks (cron entrypoint) |
| `php artisan schedule:work` | Long-running scheduler (dev) |

---

## Testing & quality

| Command | Purpose |
|--------|---------|
| `php artisan test` | Run tests (PHPUnit/Pest) |
| `php artisan test --compact` | Compact output |
| `php artisan test --filter=Name` | Filter by name |
| `php artisan pest:test Name` | Create Pest test |
| `php artisan pest:dataset Name` | Create dataset file |
| `vendor/bin/pint` | Format PHP (Laravel Pint) |

---

## Storage & assets

| Command | Purpose |
|--------|---------|
| `php artisan storage:link` | `public/storage` → `storage/app/public` |
| `php artisan storage:unlink` | Remove those links |
| `php artisan vendor:publish` | Publish package configs/views |

---

## Logs & debugging

| Command | Purpose |
|--------|---------|
| `php artisan pail` | Tail application logs |
| `php artisan tinker` | REPL (`--execute='...'` for one-liners) |

---

## Stack-specific (this project)

| Command | Purpose |
|--------|---------|
| `php artisan wayfinder:generate` | Regenerate Wayfinder TS route helpers |
| `php artisan inertia:middleware` | New Inertia middleware |
| `php artisan inertia:start-ssr` / `stop-ssr` / `check-ssr` | Inertia SSR |
| `php artisan fortify:install` | Fortify scaffolding (if reinstalling) |
| `php artisan boost:mcp` | Laravel Boost MCP |
| `php artisan boost:update` | Update Boost guidelines/skills |
| `php artisan sail:install` / `sail:add` | Docker Sail |

---

## Composer (PHP dependencies)

| Command | Purpose |
|--------|---------|
| `composer install` | Install from lock file |
| `composer update` | Update dependencies |
| `composer dump-autoload` | Regenerate autoloader |
| `composer run dev` | Project script (if defined) |

---

## Frontend (this repo uses pnpm)

| Command | Purpose |
|--------|---------|
| `pnpm install` | Install Node dependencies |
| `pnpm run dev` | Vite dev server |
| `pnpm run build` | Production frontend build |

---

## MCP (optional)

| Command | Purpose |
|--------|---------|
| `php artisan mcp:start` | Start MCP server for a handle |
| `php artisan mcp:inspector` | Debug MCP servers |
