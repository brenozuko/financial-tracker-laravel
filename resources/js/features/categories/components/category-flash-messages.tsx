type Flash = {
    success?: string | null;
    error?: string | null;
};

type CategoryFlashMessagesProps = {
    flash?: Flash;
};

export function CategoryFlashMessages({ flash }: CategoryFlashMessagesProps) {
    return (
        <>
            {flash?.success ? (
                <p
                    className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-800 dark:text-green-200"
                    role="status"
                >
                    {flash.success}
                </p>
            ) : null}
            {flash?.error ? (
                <p
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
                    role="alert"
                >
                    {flash.error}
                </p>
            ) : null}
        </>
    );
}
