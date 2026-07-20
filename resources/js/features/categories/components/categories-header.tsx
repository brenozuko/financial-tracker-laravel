import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type CategoriesHeaderProps = {
    search: string;
    onSearchChange: (value: string) => void;
};

export function CategoriesHeader({
    search,
    onSearchChange,
}: CategoriesHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold tracking-tight">Categorias</h1>
            <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar categorias…"
                    className="pl-9"
                    aria-label="Buscar categorias"
                />
            </div>
        </div>
    );
}
