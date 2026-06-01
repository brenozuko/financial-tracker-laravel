import { Head } from '@inertiajs/react';
import { CategorySpending } from '@/features/dashboard/components/category-spending';
import { RecentTransactions } from '@/features/dashboard/components/recent-transactions';
import { SummaryCards } from '@/features/dashboard/components/summary-cards';
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
};

export default function Dashboard({
    income = 0,
    expenses = 0,
    balance = 0,
    recentTransactions = [],
    categorySpending = [],
}: DashboardPageProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <SummaryCards income={income} expenses={expenses} balance={balance} />
                <div className="grid gap-4 lg:grid-cols-2">
                    <RecentTransactions recentTransactions={recentTransactions} />
                    <CategorySpending categorySpending={categorySpending} />
                </div>
            </div>
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
