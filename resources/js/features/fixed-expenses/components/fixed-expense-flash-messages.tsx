type FixedExpenseFlashMessagesProps = {
    success?: string | null;
    error?: string | null;
};

export function FixedExpenseFlashMessages({
    success,
    error,
}: FixedExpenseFlashMessagesProps) {
    return (
        <>
            {success ? (
                <p
                    className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-800 dark:text-green-200"
                    role="status"
                >
                    {success}
                </p>
            ) : null}
            {error ? (
                <p
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
        </>
    );
}
