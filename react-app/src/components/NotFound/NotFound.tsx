import {Component, Fragment} from 'react';
import {Config} from '../../types/config';
import flapjack from './flapjack.png';

export interface NotFoundProps {
    config: Config;
    realPath: string;
    hashPath: string;
    params: URLSearchParams;
    setTitle: (title: string) => void;
}

interface NotFoundState {
}

export default class NotFound extends Component<NotFoundProps, NotFoundState> {
    componentDidMount() {
        this.props.setTitle(`Not Found - ${this.props.hashPath}`);
    }

    renderNotFound() {
        return (
            <div className="well">
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <div style={{flex: '0 0 auto', marginRight: '30px'}}>
                        <img src={flapjack} alt="The Flapjack"/>
                    </div>
                    <div style={{flex: '1 1 0px'}}>
                        <p
                            className="text-danger"
                            style={{fontSize: '140%', marginTop: '10px'}}
                        >
                            Sorry, "{this.props.realPath}" was not found.
                        </p>
                        {this.renderKBaseLinks()}
                    </div>
                </div>
            </div>
        );
    }

    renderKBaseLinks() {
        return (
            <Fragment>
                <p>
                    You may find what you are looking for on one of the
                    following KBase sites:
                </p>

                <ul>
                    <li>
                        <a
                            href={`https://${this.props.config.ui.urls.marketing.url}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Homepage
                        </a>
                    </li>
                    <li>
                        <a
                            href={`https://${this.props.config.ui.urls.documentation.url}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Documentation
                        </a>
                    </li>
                    <li>
                        <a href="/#narrativemanager/start">Narrative</a>
                    </li>
                    <li>
                        <a href="/#dashboard">Dashboard</a>
                    </li>
                </ul>

                <p>
                    Or you may wish to{' '}
                    <a
                        href={`https://${this.props.config.ui.urls.marketing.url}/support/`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        reach out the KBase
                    </a>{' '}
                    for further assistance.
                </p>
            </Fragment>
        );
    }

    render() {
        return <div style={{margin: '0 10px'}}>{this.renderNotFound()}</div>;
    }
}
