import React, {Component} from 'react';
import {sorts} from '../../utils/NarrativeSearch';

// Components
import {NarrativeList} from '../NarrativeList';

import {AuthInfo} from "../../../../contexts/Auth";
import {RuntimeContext} from "../../../../contexts/RuntimeContext";
import './Dashboard.css';

interface Props {
    authInfo: AuthInfo;
    category?: string;

    // From path
    id?: string;
    obj?: string;
    ver?: string;

    // From url search
    limit: number;
    search: string;
    sort: string;
    view: string;
}

interface State {
}

const SORT_SLUG_DEFAULT = Object.keys(sorts)[0];

// Parent page component for the dashboard page
export class Dashboard extends Component<Props, State> {
    render() {
        const {id, obj, ver} = this.props;
        const category = this.props.category || 'own';

        // TODO: should default to null rather than 0
        const paramId = parseInt(id || '0');
        const paramObj = parseInt(obj || '0');
        const paramVer = parseInt(ver || '0');

        return (
            <section className="Dashboard">
                <RuntimeContext.Consumer>
                    {(value) => {
                        if (value === null) {
                            return null;
                        }
                        return <NarrativeList
                            authInfo={this.props.authInfo}
                            category={category}
                            id={paramId}
                            limit={this.props.limit}
                            obj={paramObj}
                            search={this.props.search}
                            sort={this.props.sort}
                            ver={paramVer}
                            view={this.props.view}
                            config={value.config}
                        />
                    }}
                </RuntimeContext.Consumer>
            </section>
        );
    }
}
