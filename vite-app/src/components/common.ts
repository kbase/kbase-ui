export function plural(amount: number, singular: string, plural: string) {
    if (amount === 1) {
        return singular;
    }
    return plural;
}

export interface PluralizeOptions {
    plural?: string
}

export function pluralize(amount: number, singular: string, { plural }: PluralizeOptions = {}) {
    if (amount === 1) {
        return `${amount} ${singular}`;
    }
    return `${amount} ${plural || singular + 's'}`;
}
