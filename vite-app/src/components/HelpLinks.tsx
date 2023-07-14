import {Component, Fragment} from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { AsyncProcessStatus } from '../lib/AsyncProcess';

export interface AuthProblemProps {
}

interface AuthProblemState {
}

export default class NotFound extends Component<AuthProblemProps, AuthProblemState> {
    render() {
        return <ConfigContext.Consumer>
            {(value) => {
                if (value.status !== AsyncProcessStatus.SUCCESS) {
                    return;
                }
                return (
                    <Fragment>
                        <p>
                            You may find what you are looking for on one of the
                            following KBase sites:
                        </p>

                        <ul>
                            <li>
                                <a
                                    href={`https://${value.value.config.ui.urls.marketing.url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Homepage
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`https://${value.value.config.ui.urls.documentation.url}`}
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
                                href={`https://${value.value.config.ui.urls.marketing.url}/support/`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                reach out the KBase
                            </a>{' '}
                            for further assistance.
                        </p>
                    </Fragment>
                );
            }}
        </ConfigContext.Consumer>
        
    }

}
