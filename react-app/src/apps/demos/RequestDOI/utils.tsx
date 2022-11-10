import { ReactNode } from "react";

export function ifEmpty(value: string | null | undefined, defaultValue: string = 'n/a') {
    if (value) {
        return value;
    }
    return <span style={{ fontStyle: 'italic', color: 'rgba(100, 100, 100, 1)' }} >{defaultValue}</span>;
}

export function when(value: string | null | undefined, trueValue: ReactNode, falseValue: ReactNode) {
    if (value) {
        return trueValue;
    }
    return falseValue;
}