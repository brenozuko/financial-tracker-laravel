import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatLongDate, todayIsoDate } from '@/features/fixed-expenses/format';
import type {
    FixedExpenseOccurrence,
    MarkAsPaidFormValues,
} from '@/features/fixed-expenses/types';

type MarkAsPaidDialogProps = {
    occurrence: FixedExpenseOccurrence | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (
        occurrence: FixedExpenseOccurrence,
        values: MarkAsPaidFormValues,
    ) => Promise<void> | void;
};

function buildInitialValues(
    occurrence: FixedExpenseOccurrence | null,
): MarkAsPaidFormValues {
    if (!occurrence) {
        return {
            paid_amount: '',
            paid_at: todayIsoDate(),
            description: '',
        };
    }

    return {
        paid_amount: occurrence.expected_amount.toFixed(2),
        paid_at: todayIsoDate(),
        description: `${occurrence.fixed_expense.name} - ${formatLongDate(occurrence.due_date)}`,
    };
}

export function MarkAsPaidDialog({
    occurrence,
    open,
    onOpenChange,
    onConfirm,
}: MarkAsPaidDialogProps) {
    const [values, setValues] = useState<MarkAsPaidFormValues>(() =>
        buildInitialValues(occurrence),
    );
    const [errors, setErrors] = useState<
        Partial<Record<keyof MarkAsPaidFormValues, string>>
    >({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setValues(buildInitialValues(occurrence));
            setErrors({});
            setProcessing(false);
        }
    }, [open, occurrence]);

    const updateField = <K extends keyof MarkAsPaidFormValues>(
        field: K,
        value: MarkAsPaidFormValues[K],
    ) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!occurrence) {
            return;
        }

        const nextErrors: Partial<Record<keyof MarkAsPaidFormValues, string>> =
            {};
        const parsedAmount = Number(values.paid_amount.replace(',', '.'));

        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            nextErrors.paid_amount = 'Informe um valor v\u00e1lido.';
        }

        if (!values.paid_at) {
            nextErrors.paid_at = 'Informe a data do pagamento.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);

            return;
        }

        setErrors({});
        setProcessing(true);

        try {
            await onConfirm(occurrence, values);
            onOpenChange(false);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Marcar como paga</DialogTitle>
                        <DialogDescription>
                            Confirme os dados do pagamento. Uma
                            transa&ccedil;&atilde;o ser&aacute; gerada
                            automaticamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mark-paid-amount">
                                Valor pago (R$)
                            </Label>
                            <Input
                                id="mark-paid-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={values.paid_amount}
                                onChange={(e) =>
                                    updateField('paid_amount', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.paid_amount} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="mark-paid-at">
                                Data do pagamento
                            </Label>
                            <Input
                                id="mark-paid-at"
                                type="date"
                                value={values.paid_at}
                                onChange={(e) =>
                                    updateField('paid_at', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.paid_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="mark-paid-description">
                                Descri&ccedil;&atilde;o
                            </Label>
                            <Input
                                id="mark-paid-description"
                                type="text"
                                value={values.description}
                                onChange={(e) =>
                                    updateField('description', e.target.value)
                                }
                                placeholder="Aparecer&aacute; na transa&ccedil;&atilde;o gerada"
                            />
                            <InputError message={errors.description} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2" />}
                            Confirmar pagamento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
