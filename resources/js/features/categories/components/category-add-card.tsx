import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CategoryAddCardProps = {
    onAdd: () => void;
    processing?: boolean;
};

export function CategoryAddCard({
    onAdd,
    processing = false,
}: CategoryAddCardProps) {
    return (
        <Card
            className={cn(
                'gap-0 border-dashed py-4 shadow-none transition-colors',
                processing
                    ? 'opacity-70'
                    : 'hover:border-foreground/30 hover:bg-muted/40',
            )}
        >
            <CardContent className="flex flex-col items-center gap-3 px-4 pt-2">
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={processing}
                    className="flex w-full flex-col items-center gap-3 focus-visible:outline-none"
                    aria-label="Adicionar categoria"
                >
                    <span className="inline-flex size-16 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground">
                        <Plus className="size-7" />
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                        Nova categoria
                    </span>
                </button>
            </CardContent>
        </Card>
    );
}
