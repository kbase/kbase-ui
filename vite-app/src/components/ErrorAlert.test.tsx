import { render, screen } from '@testing-library/react';
import ErrorAlert, { ErrorAlertProps } from './ErrorAlert';

const cases: Array<ErrorAlertProps> = [
    {
        message: 'Hello',
    },
    {
        message: 'Howdy',
        title: 'Greetings'
    },
    {
        message: 'Hola',
    },
];

test('renders simple, minimal ErrorAlert', () => {
    for (const { message } of cases) {
        render(<ErrorAlert
            message={message}
        />);
        expect(screen.getByText(message!)).toBeInTheDocument();
    }
});

test('renders ErrorAlert in all sizes', () => {
    for (const { message, title } of cases) {
        if (title) {
            render(<ErrorAlert
                message={message}
                title={title}
            />);
            expect(screen.getByText(message)).toBeInTheDocument();
            expect(screen.getByText(title)).toBeInTheDocument();
        }
    }
});

