import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { CSSProperties, Component, PropsWithChildren } from 'react';
import { Spinner } from 'react-bootstrap';
import styles from './Loading.module.css';

export type Size = 'small' | 'normal' | 'large';
export type Type = 'inline' | 'block';

export const DEFAULT_PAUSE = 500;

export interface LoadingProps extends PropsWithChildren {
    size?: Size;
    type?: Type;
    message?: string;
    pause?: number;
    style?: CSSProperties
}

type LoadingState = AsyncProcess<null, null>;

export default class Loading extends Component<LoadingProps, LoadingState> {
    timer: number | null = null;
    
    constructor(props: LoadingProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.initialize();
    }

    initialize() {
        this.timer = window.setTimeout(() => {
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: null
            })
        }, this.props.pause || DEFAULT_PAUSE);
    }

    renderMessage() {
        if (this.props.message) {
            return <>
                {' '}
                <span className={styles.message}>
                    {this.props.message}
                </span>
            </>;
        }
        return this.props.children;

    }

    renderLoading() {
        const spinner = (() => {
            switch (this.props.size || 'normal') {
                case 'small':
                    return (
                        <span className="fa fa-sm fa-spinner fa-pulse"></span>
                    );
                case 'normal':
                    return <Spinner animation="border" size="sm" />
                // return <span className="fa fa-spinner fa-pulse margin-bottom"></span>;
                default:
                    return (
                        <span className="fa fa-2x fa-spinner fa-pulse"></span>
                    );
            }
        })();
        if (this.props.type === 'inline') {
            return (
                <div className={styles.inline} style={{...(this.props.style || {}) }}>
                    {spinner}{this.renderMessage()}
                </div>
            );
        } else {
            return (
                <div className={styles.container} style={{...(this.props.style || {}) }}>
                    <div className={styles.loading}>
                        {spinner}{this.renderMessage()}
                    </div>
                </div>
            );
        }
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
            case AsyncProcessStatus.ERROR:
                return;
            case AsyncProcessStatus.SUCCESS:
                return this.renderLoading();
        }
    }
}
