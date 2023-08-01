import Well, { Variant } from 'components/Well';
import { Component } from 'react';
import Spinner from 'react-bootstrap/esm/Spinner';
import { Config } from 'types/config';

export interface NarrativeLoadingProps {
    detectSlow?: boolean;
    message: string;
    config: Config;
}

enum NarrativeLoadingStatus {
    NONE = 'NONE',
    SLOW = 'SLOW',
    VERY_SLOW = 'VERYSLOW',
}

interface NarrativeLoadingState {
    status: NarrativeLoadingStatus;
}

export default class NarrativeLoading extends Component<
    NarrativeLoadingProps,
    NarrativeLoadingState
> {
    watchListener: null | number;
    constructor(props: NarrativeLoadingProps) {
        super(props);
        this.watchListener = null;
        this.state = {
            status: NarrativeLoadingStatus.NONE,
        };
    }

    // componentDidMount() {
    //     if (this.props.detectSlow) {
    //         this.startWatchingSlow();
    //     }
    // }

    componentWillUnmount() {
        this.stopWatching();
    }

    startWatchingSlow() {
        this.watchListener = window.setTimeout(() => {
            this.setState({
                status: NarrativeLoadingStatus.SLOW,
            });
            this.startWatchingVerySlow();
        }, this.props.config.ui.apps.NarrativeManager.loadingTimers.slow);
    }

    startWatchingVerySlow() {
        this.watchListener = window.setTimeout(() => {
            this.setState({
                status: NarrativeLoadingStatus.VERY_SLOW,
            });
            this.startWatchingVerySlow();
        }, this.props.config.ui.apps.NarrativeManager.loadingTimers.verySlow);
    }

    stopWatching() {
        if (this.watchListener) {
            window.clearTimeout(this.watchListener);
        }
    }

    renderLoadingMessage() {
        return (
            <div className="-message">
                <Spinner /> {this.props.message}
            </div>
        );
    }

    render() {
        const [message, variant] = ((): [JSX.Element, Variant] => {
            switch (this.state.status) {
                case NarrativeLoadingStatus.NONE:
                    return [this.renderLoadingMessage(), "info"];
                case NarrativeLoadingStatus.SLOW:
                    return [
                        <div>
                            {this.renderLoadingMessage()}
                            <p className="text text-warning" style={{ marginTop: '1em' }}>
                                <span className="fa fa-exclamation-triangle"></span>
                                This process is taking longer than expected. Still trying...
                            </p>
                        </div>,
                        "warning"
                    ];
                case NarrativeLoadingStatus.VERY_SLOW:
                    return [
                        <div>
                            {this.renderLoadingMessage()}
                            <p className="text text-danger" style={{ marginTop: '1em' }}>
                                <span className="fa fa-exclamation-triangle"></span>
                                This process is taking <b>much</b> longer than expected. Still
                                trying...
                            </p>
                        </div>,
                        "warning"
                    ];
            }
        })();

        return (
            <Well variant={variant} style={{ width: '50%', margin: '0 auto' }}>
                <Well.Body>
                    {message}
                </Well.Body>
            </Well>
        );
    }
}
