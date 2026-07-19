import { Badge } from '@/components/ui/badge';
import {
    statusBadgeClassName,
    statusLabel,
} from '@/features/fixed-expenses/format';
import type { OccurrenceStatus } from '@/features/fixed-expenses/types';
import { cn } from '@/lib/utils';

type OccurrenceStatusBadgeProps = {
    status: OccurrenceStatus;
    className?: string;
};

export function OccurrenceStatusBadge({
    status,
    className,
}: OccurrenceStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn('text-xs', statusBadgeClassName(status), className)}
        >
            {statusLabel(status)}
        </Badge>
    );
}
