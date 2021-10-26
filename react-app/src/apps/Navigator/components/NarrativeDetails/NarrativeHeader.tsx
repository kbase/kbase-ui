import React from 'react';
import UserModel, {UserProfile} from "../../utils/UserModel";
import {readableDate} from "../../utils/readableDate";
import {Doc} from "../../utils/NarrativeModel";
import {Config} from '../../../../types/config';
import {AuthInfo} from "../../../../contexts/Auth";
import {AsyncProcess, AsyncProcessStatus} from "../../../../lib/AsyncProcess";
import Loading from "../../../../components/Loading";
import ErrorMessage from "../ErrorMessage";
import './NarrativeHeader.css';


function countCellTypes(cells: any[]): any {
    const defaults = {
        markdown: 0,
        code_cell: 0,
        data: 0,
        kbase_app: 0,
        widget: 0,
    };
    return cells.reduce((acc: any, cell: any) => {
        acc[cell.cell_type] += 1;
        return acc;
    }, defaults);
}

const profileLink = (username: string, realname: string) => (
    <a key={`${username}-link`} href={`/#user/${username}`} title={username}>
        {realname}
    </a>
);

const detailsSharedWith = (users: string[], profiles: any) => {
    /*
    Convert the string names into a JSX array of arrays of commas and links,
    flatten into a single array and finally slice off the first comma.
    */
    const separator = (key: string) => (
        <React.Fragment key={`${key}-sep`}>, </React.Fragment>
    ); // Turn a comma into a JSX element
    const sharedWithLinks = users
        .map((share: string, ix: number) => {
            let displayName = share;
            if (profiles[ix]) {
                displayName = profiles[ix].user.realname;
            }
            return [separator(share), profileLink(share, displayName)];
        })
        .reduce((acc, elt) => acc.concat(elt), [])
        .slice(1);
    const sharedFirst = sharedWithLinks.slice(0, 20);
    const sharedRest = sharedWithLinks.slice(20);
    let sharedRestDetails = <></>;
    if (sharedRest.length > 0) {
        sharedRestDetails = (
            <>
                <input
                    type="checkbox"
                    name="narrative-shared-status"
                    id="narrative-shared-status"
                />
                <label htmlFor="narrative-shared-status" id="narrative-shared-more">
                    ... &nbsp; (<a className="label">show</a> {profiles.length - 10} more)
                </label>
                <span id="narrative-shared-rest">{sharedRest}.</span>
                <label htmlFor="narrative-shared-status" id="narrative-shared-less">
                    &nbsp; (<a className="label">show</a> fewer)
                </label>
            </>
        );
    }
    return [
        <div id="narrative-shared" key="narrative-shared">
            <span>{sharedFirst}</span>
            {sharedRestDetails}
        </div>,
    ];
};

export interface NarrativeHeaderProps {
    narrativeDoc: Doc;
    config: Config;
    authInfo: AuthInfo;
}

interface NarrativeHeaderData {
    authorProfile: UserProfile;
    sharedWithProfiles: Array<UserProfile | null>;
    sharedWith: Array<string>;
}

interface NarrativeHeaderState {
    data: AsyncProcess<NarrativeHeaderData>

}

export default class NarrativeHeader extends React.Component<NarrativeHeaderProps,NarrativeHeaderState> {
    state: NarrativeHeaderState = {
        data: {
            status: AsyncProcessStatus.NONE
        }
    }
    componentDidMount() {
        // fetch data
        this.fetchData();
    }

    async fetchData() {
        try {
            const userModel = new UserModel(this.props.config.services.UserProfile.url, this.props.authInfo.token);
            const authorProfile = await userModel.fetchProfile(this.props.narrativeDoc.creator);
            const sharedWith = this.props.narrativeDoc.shared_users.filter(
                (user: string) => user !== this.props.authInfo.tokenInfo.user
            );
            const sharedWithProfiles = await userModel.fetchProfiles(sharedWith);

            this.setState({
                data: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        authorProfile,
                        sharedWithProfiles,
                        sharedWith
                    }
                }
            })
        } catch (ex) {
            this.setState({
                data: {
                    status: AsyncProcessStatus.ERROR,
                    message: ex instanceof Error ? ex.message : 'Unknown error'
                }
            });
        }
    }

    renderDetailsHeaderItem(key: string, value: string | JSX.Element[]) {
        return (
            <div className="-row">
                <div className="-col">{key}</div>
                <div className="-col">{value}</div>
            </div>
        );
    }

    countDataTypes(data: any) {
        const counts: Record<string, number> = {};
        const normalize = (key: any) => {
            const begin = key.indexOf('.') + 1;
            const end = key.lastIndexOf('-');
            return key.slice(begin, end);
        };
        const sortCountDesc = (freq1: [string, number], freq2: [string, number]) => {
            const count1 = freq1[1];
            const count2 = freq2[1];
            return -1 + +(count1 === count2) + 2 * +(count1 < count2);
        };
        data.data_objects.forEach((obj: any) => {
            const key = normalize(obj.obj_type);
            if (!(key in counts)) {
                counts[key] = 0;
            }
            counts[key] = counts[key] + 1;
        });
        const dataPlaces = Object.entries(counts).sort(sortCountDesc).slice(0, 3);
        const out = [<></>, <></>, <></>];
        return out.map((el, ix) => {
            if (ix in dataPlaces) {
                const [dataType, count] = dataPlaces[ix];
                return this.renderDetailsHeaderItem(dataType, count.toString());
            }
            return el;
        });
    }

    /**
     * Shows some basic details, specifically:
     *  - author (user id of owner)
     *  - total cells
     *  - visibility (public or private)
     *  - created date
     *  - data objects
     * @param {Doc} data - a representation of a narrative
     * @return {JSX}
     */
    renderHeader (loadData: NarrativeHeaderData) {
        const narrativeDoc = this.props.narrativeDoc;
        if (!narrativeDoc) return null;

        const cellTypeCounts = countCellTypes(narrativeDoc.cells);
        const [gold, silver, bronze] = this.countDataTypes(narrativeDoc);

        const authorName = loadData.authorProfile.user.realname;
        const sharedWithLinks = detailsSharedWith(loadData.sharedWith, loadData.sharedWithProfiles);
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-4">
                        <div className="-well">
                        <div className="-prop-table">
                            {this.renderDetailsHeaderItem('Author', [profileLink(narrativeDoc.creator, authorName)])}
                            {this.renderDetailsHeaderItem('Created on', readableDate(narrativeDoc.creation_date))}
                            {this.renderDetailsHeaderItem('Last saved', readableDate(narrativeDoc.timestamp))}
                            {this.renderDetailsHeaderItem(
                                'Visibility',
                                narrativeDoc.is_public ? 'Public' : 'Private'
                            )}
                         </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="-prop-table">
                            <div className="-title">Data Objects</div>
                            {this.renderDetailsHeaderItem(
                                'Data objects',
                                narrativeDoc.data_objects.length.toString()
                            )}
                            {gold}
                            {silver}
                            {bronze}
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="-prop-table">
                            <div className="-title">Narrative Stats</div>
                            {this.renderDetailsHeaderItem('Total cells', narrativeDoc.total_cells.toString())}
                            {this.renderDetailsHeaderItem('App cells', cellTypeCounts.kbase_app)}
                            {this.renderDetailsHeaderItem('Markdown cells', cellTypeCounts.markdown)}
                            {this.renderDetailsHeaderItem('Code Cells', cellTypeCounts.code_cell)}
                        </div>
                    </div>
                </div>
                {/*<div className="row">*/}
                {/*    {narrativeDoc.is_public || ! loadData.sharedWith.length ? (*/}
                {/*        <></>*/}
                {/*    ) : (*/}
                {/*        this.renderDetailsHeaderItem('Shared with', sharedWithLinks)*/}
                {/*    )}*/}
                {/*</div>*/}
            </div>
        );
    }

    renderLoading() {
        return <Loading size={"normal"} type={'block'} message={'Loading data...'} />;
    }

    renderError(message: string) {
        return <ErrorMessage message={message} />
    }

    renderState() {
        switch (this.state.data.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.data.message);
            case AsyncProcessStatus.SUCCESS:
                return this.renderHeader(this.state.data.value);
        }
    }

    render() {
        return <div className="NarrativeHeader container-fluid">
            {this.renderState()}
        </div>
    }
}