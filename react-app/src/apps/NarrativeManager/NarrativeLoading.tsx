import { Component } from "react";

const SLOW_TIME = 3000;
const VERY_SLOW_TIME = 10000;

export interface NarrativeLoadingProps {
    detectSlow?: boolean;
    message: string;
}

enum NarrativeLoadingStatus {
    NONE = 'NONE',
    SLOW = 'SLOW',
    VERY_SLOW = 'VERYSLOW',

}

interface NarrativeLoadingState {
    status: NarrativeLoadingStatus
}

export default class NarrativeLoading extends Component<NarrativeLoadingProps, NarrativeLoadingState> {
    watchListener: null | number;
    constructor(props: NarrativeLoadingProps) {
        super(props);
        this.watchListener = null;
        this.state = {
            status: NarrativeLoadingStatus.NONE
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
        }, SLOW_TIME);
    }

    startWatchingVerySlow() {
        this.watchListener = window.setTimeout(() => {
            this.setState({
                status: NarrativeLoadingStatus.VERY_SLOW,
            });
            this.startWatchingVerySlow();
        }, VERY_SLOW_TIME);
    }

    stopWatching() {
        if (this.watchListener) {
            window.clearTimeout(this.watchListener);
        }
    }

    renderLoadingMessage() {
        return <div className="-message">
                <span className="fa fa-2x fa-spinner fa-pulse"></span>
                {' '}
                {this.props.message}
            </div>
    }

    render() {
        const message = (() => {
            switch (this.state.status) {
            case NarrativeLoadingStatus.NONE:
                return this.renderLoadingMessage();
            case NarrativeLoadingStatus.SLOW:
                return  <div>
                    {this.renderLoadingMessage()}
                    <p className="text text-warning" style={{marginTop: '1em'}}>
                        <span className="fa fa-exclamation-triangle"></span>
                        This process is taking longer than expected. Still trying...
                    </p>
                </div>;
            case NarrativeLoadingStatus.VERY_SLOW:
                return <div>
                        {this.renderLoadingMessage()}
                        <p className="text text-danger" style={{marginTop: '1em'}}>
                            <span className="fa fa-exclamation-triangle"></span>
                            This process is taking <b>much</b> longer than expected. Still trying...
                        </p>
                    </div>;
            }
        })();

        return  <div className="well NarrativeLoading" style={{width: '50%', margin: '0 auto'}}>
            <div className="well-body">
                {message}
            </div>
        </div>
    }
}
