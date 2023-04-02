import { render, screen } from '@testing-library/react';
import AlertMessage, { Variant } from './AlertMessage';

interface TestSpec {
    variant: Variant
    message: string,
    icon: string;
    defaultTitle?: string
}

const cases: Array<TestSpec> = [
    {
        variant: 'primary',
        message: 'Hello Primary',
        icon: "area-chart"
    },
    {
        variant: 'secondary',
        message: 'Hello Secondary',
        icon: "pie-chart"
    },
    {
        variant: 'success',
        message: 'Hello Success',
        icon: "bar-chart",
        defaultTitle: "Success"
    },
    {
        variant: 'danger',
        message: 'Hello Danger',
        icon: "bitcoin",
        defaultTitle: "Error!"
    },
    {
        variant: 'warning',
        message: 'Hello Warning',
        icon: "eur",
        defaultTitle: "Warning!"
    },
    {
        variant: 'info',
        message: 'Hello Info',
        icon: "money",
        defaultTitle: "Info"
    },
    {
        variant: 'dark',
        message: 'Hello Dark',
        icon: "ruble"
    },
    {
        variant: 'light',
        message: 'Hello Light',
        icon: "rupee"
    }
];

test('renders simple AlertMessage with all variants, a message, and a title', () => {
    for (const { variant, message } of cases) {
        const showMessage = `${message} MESSAGE`;
        const showTitle = `${message} TITLE`
        render(<AlertMessage
            variant={variant}
            message={showMessage}
            title={showTitle}
        />);
        expect(screen.getByText(showMessage)).toBeInTheDocument();
        expect(screen.getByText(showTitle)).toBeInTheDocument();
    }
});

test('renders simple AlertMessage with content as children', () => {
    for (const { variant, message } of cases) {
        render(<AlertMessage
            variant={variant}
        >
            {message}
        </AlertMessage>);
        expect(screen.getByText(message)).toBeInTheDocument();
    }
});

test('renders simple AlertMessage with a message render', () => {
    for (const { variant, message } of cases) {
        render(<AlertMessage
            variant={variant}
            render={() => {
                return <div>{message}</div>
            }}
        />)
        expect(screen.getByText(message)).toBeInTheDocument();
    }
});

test('renders simple AlertMessage with all variants and default title', () => {
    for (const { variant, message, defaultTitle } of cases) {
        const showMessage = `${message} MESSAGE`;

        render(<AlertMessage
            variant={variant}
            message={showMessage}
            showTitle />);
        expect(screen.getByText(showMessage)).toBeInTheDocument();
        if (typeof defaultTitle !== 'undefined') {
            expect(screen.getByText(defaultTitle)).toBeInTheDocument();
        }
    }
});


test('renders AlertMessage with natural icon with all variants', () => {
    for (const { variant, message } of cases) {
        const showMessage = `${message} MESSAGE`;
        const showTitle = `${message} TITLE`
        render(<AlertMessage
            variant={variant}
            message={showMessage}
            title={showTitle}
            showIcon
        />);
        expect(screen.getByText(showMessage)).toBeInTheDocument();
        expect(screen.getByText(showTitle)).toBeInTheDocument();
    }
});

test('renders AlertMessage with custom icon with all variants', () => {
    for (const { variant, message, icon } of cases) {
        const showMessage = `${message} MESSAGE`;
        const showTitle = `${message} TITLE`
        render(<AlertMessage
            variant={variant}
            message={showMessage}
            title={showTitle}
            icon={icon}
        />);
        expect(screen.getByText(showMessage)).toBeInTheDocument();
        expect(screen.getByText(showTitle)).toBeInTheDocument();
    }
});
