import { render, screen } from '@testing-library/react';
import Empty, { EmptyProps } from './Empty';

const cases: Array<EmptyProps> = [
    {
        icon: 'flask',
        message: 'Hello',
        size: 'normal'
    },
    {
        icon: 'flask',
        message: 'Howdy',
        size: 'compact'
    },
    {
        icon: 'flask',
        message: 'Hola',
        size: 'inline'
    },
];

test('renders simple, minimal Empty', () => {
    for (const { message } of cases) {
        render(<Empty
            message={message}
        />);
        expect(screen.getByText(message!)).toBeInTheDocument();
    }
});

test('renders Empty in all sizes', () => {
    for (const { message, size } of cases) {
        render(<Empty
            message={message}
            size={size}
        />);
        expect(screen.getByText(message!)).toBeInTheDocument();
    }
});

