import type { PageProps } from '@inertiajs/core';
import { usePage as useInertiaPage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';

/**
 * Shared props merged on every Inertia response. Use this instead of
 * `usePage()` when you need typed `auth`, `name`, `sidebarOpen`, or `flash`.
 *
 * @see resources/js/types/global.d.ts — `SharedPageProps` matches this shape
 * but TypeScript collapses `PageProps & SharedPageProps` to `PageProps` when
 * `SharedPageProps` extends the index signature, so `usePage().props.auth`
 * becomes `unknown` without this helper.
 */
export type AppSharedPageProps = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

export function useAppPage<T extends PageProps = PageProps>() {
    const page = useInertiaPage<T>();

    return page as typeof page & {
        props: typeof page.props & AppSharedPageProps;
    };
}
