import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CategorySpending } from '@/features/dashboard/components/category-spending';
import { RecentTransactions } from '@/features/dashboard/components/recent-transactions';
import { SummaryCards } from '@/features/dashboard/components/summary-cards';
import { UpcomingBills } from '@/features/dashboard/components/upcoming-bills';
import { FixedExpenseFlashMessages } from '@/features/fixed-expenses/components/fixed-expense-flash-messages';
import { MarkAsPaidDialog } from '@/features/fixed-expenses/components/mark-as-paid-dialog';
import {
    generateMockOccurrences,
    MOCK_FIXED_EXPENSES,
} from '@/features/fixed-expenses/mocks';
import type {
    FixedExpenseOccurrence,
    MarkAsPaidFormValues,
} from '@/features/fixed-expenses/types';
import type { Category, Transaction } from '@/features/transactions/types';
import { dashboard } from '@/routes';

type CategorySpendingItem = {
    category: Category;
    total: number;
    percentage: number;
};

type DashboardPageProps = {
    income?: number;
    expenses?: number;
    balance?: number;
    recentTransactions?: Transaction[];
    categorySpending?: CategorySpendingItem[];
    upcomingBills?: FixedExpenseOccurrence[];
};

export default function Dashboard({
    income = 0,
    expenses = 0,
    balance = 0,
    recentTransactions = [],
    categorySpending = [],
    upcomingBills,
}: DashboardPageProps) {
    const [bills, setBills] = useState<FixedExpenseOccurrence[]>(
        () => upcomingBills ?? generateMockOccurrences(MOCK_FIXED_EXPENSES, 1),
    );
    const [windowDays, setWindowDays] = useState<number>(7);
    const [paying, setPaying] = useState<FixedExpenseOccurrence | null>(null);
    const [flashSuccess, setFlashSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!flashSuccess) {
            return;
        }

        const handle = window.setTimeout(() => setFlashSuccess(null), 4000);

        return () => window.clearTimeout(handle);
    }, [flashSuccess]);

    const handleConfirmPayment = async (
        occurrence: FixedExpenseOccurrence,
        values: MarkAsPaidFormValues,
    ) => {
        await new Promise((resolve) => window.setTimeout(resolve, 250));

        const paidAmount = Number(values.paid_amount.replace(',', '.'));
        const paidAt = `${values.paid_at}T12:00:00.000Z`;

        setBills((prev) =>
            prev.map((bill) =>
                bill.id === occurrence.id
                    ? {
                          ...bill,
                          paid_amount: Number.isFinite(paidAmount)
                              ? paidAmount
                              : bill.expected_amount,
                          paid_at: paidAt,
                          notes: values.description || bill.notes,
                      }
                    : bill,
            ),
        );

        setFlashSuccess(
            `Pagamento de "${occurrence.fixed_expense.name}" registrado. Transação gerada (mock).`,
        );
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FixedExpenseFlashMessages success={flashSuccess} />
                <SummaryCards
                    income={income}
                    expenses={expenses}
                    balance={balance}
                />
                <div className="grid gap-4 lg:grid-cols-2">
                    <UpcomingBills
                        bills={bills}
                        windowDays={windowDays}
                        onWindowDaysChange={setWindowDays}
                        onMarkAsPaid={(occurrence) => setPaying(occurrence)}
                    />
                    <RecentTransactions
                        recentTransactions={recentTransactions}
                    />
                </div>
                <CategorySpending categorySpending={categorySpending} />
            </div>

            <MarkAsPaidDialog
                occurrence={paying}
                open={paying !== null}
                onOpenChange={(open) => !open && setPaying(null)}
                onConfirm={handleConfirmPayment}
            />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
