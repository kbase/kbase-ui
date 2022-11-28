import { ReactNode } from "react";

export function ifEmpty(value: string | null | undefined, defaultValue: string) {
    if (value) {
        return value;
    }
    return na(defaultValue)
}

export function when(value: string | null | undefined, trueValue: ReactNode, falseValue: ReactNode) {
    if (value) {
        return trueValue;
    }
    return falseValue;
}

export function na(symbol: string = "∅") {
    return <span style={{ fontStyle: 'italic', color: 'rgba(100, 100, 100, 1)' }}>{symbol}</span>;
}
