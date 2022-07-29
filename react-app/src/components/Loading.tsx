import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import styles from './Loading.styles';

export type Size = 'small' | 'normal' | 'large';
export type Type = 'inline' | 'block';

export const DEFAULT_PAUSE = 500;

export interface LoadingProps {
    size?: Size;
    type?: Type;
    message?: string;
    pause?: number;
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
        if (!this.props.message) {
            return null;
        }
        return <>
            {' '}
            <span style={styles.LoadingMessage}>
                {this.props.message}
            </span>
        </>;
    }
    renderLoading() {
        const spinner = (() => {
            switch (this.props.size || 'normal') {
                case 'small':
                    return (
                        <span className="fa fa-sm fa-spinner fa-pulse"></span>
                    );
                case 'normal':
                    return <span className="fa fa-spinner fa-pulse"></span>;
                default:
                    return (
                        <span className="fa fa-2x fa-spinner fa-pulse"></span>
                    );
            }
        })();
        if (this.props.type === 'inline') {
            return (
                <div style={styles.LoadingInline}>
                    {spinner}{this.renderMessage()}
                </div>
            );
        } else {
            return (
                <div style={styles.LoadingContainer}>
                    <div style={styles.Loading}>
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
