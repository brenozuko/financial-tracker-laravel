export type Category = {
    id: number;
    user_id: number;
    name: string;
    color: string;
    icon: string | null;
    sort_order: number;
};

export type CategoryFormValues = {
    name: string;
    color: string;
    icon: string;
};
