import React from 'react';
import UserModel, { UserProfile } from '../../utils/UserModel';
import { readableDate } from '../../utils/readableDate';
import { NarrativeSearchDoc } from '../../utils/NarrativeModel';
import { Config } from '../../../../types/config';
import { AuthInfo } from '../../../../contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from '../../../../lib/AsyncProcess';
import Loading from '../../../../components/Loading';
import PropTable from 'components/PropTable';
import ErrorMessage from '../../../../components/ErrorMessage';
import './NarrativeHeader.css';

export type CellType =
    | 'markdown'
    | 'code_cell'
    | 'data'
    | 'kbase_app'
    | 'widget';

export interface CellTypeInfo {
    label: string;
    count: number;
}

export type CellTypesInfo = Record<CellType, CellTypeInfo>;

function countCellTypes(narrative: NarrativeSearchDoc): CellTypesInfo {
    const cells = narrative.cells;
    const cellTypes: CellTypesInfo = {
        markdown: {
            label: 'Markdown',
            count: 0,
        },
        code_cell: {
            label: 'Code',
            count: 0,
        },
        data: {
            label: 'Data Object',
            count: 0,
        },
        kbase_app: {
            label: 'App',
            count: 0,
        },
        widget: {
            label: 'Output',
            count: 0,
        },
    };
    return cells.reduce<CellTypesInfo>((acc, cell) => {
        const key = cell.cell_type as CellType;
        acc[key].count += 1;
        return acc;
    }, cellTypes);
}

const profileLink = (username: string, realname: string) => (
    <a key={username} href={`/#user/${username}`} title={username}>
        {realname}
    </a>
);

// const detailsSharedWith = (users: string[], profiles: any) => {
//     /*
//     Convert the string names into a JSX array of arrays of commas and links,
//     flatten into a single array and finally slice off the first comma.
//     */
//     const separator = (key: string) => (
//         <React.Fragment key={`${key}-sep`}>, </React.Fragment>
//     );
//     const sharedWithLinks = users
//         .map((share: string, ix: number) => {
//             let displayName = share;
//             if (profiles[ix]) {
//                 displayName = profiles[ix].user.realname;
//             }
//             return [separator(share), profileLink(share, displayName)];
//         })
//         .reduce((acc, elt) => acc.concat(elt), [])
//         .slice(1);
//     const sharedFirst = sharedWithLinks.slice(0, 20);
//     const sharedRest = sharedWithLinks.slice(20);
//     let sharedRestDetails = <></>;
//     if (sharedRest.length > 0) {
//         sharedRestDetails = (
//             <>
//                 <input
//                     type="checkbox"
//                     name="narrative-shared-status"
//                     id="narrative-shared-status"
//                 />
//                 <label
//                     htmlFor="narrative-shared-status"
//                     id="narrative-shared-more"
//                 >
//                     ... &nbsp; (<a className="label">show</a>{' '}
//                     {profiles.length - 10} more)
//                 </label>
//                 <span id="narrative-shared-rest">{sharedRest}.</span>
//                 <label
//                     htmlFor="narrative-shared-status"
//                     id="narrative-shared-less"
//                 >
//                     &nbsp; (<a className="label">show</a> fewer)
//                 </label>
//             </>
//         );
//     }
//     return [
//         <div id="narrative-shared" key="narrative-shared">
//             <span>{sharedFirst}</span>
//             {sharedRestDetails}
//         </div>,
//     ];
// };

export interface NarrativeHeaderProps {
    narrativeDoc: NarrativeSearchDoc;
    config: Config;
    authInfo: AuthInfo;
}

interface NarrativeHeaderData {
    authorProfile: UserProfile;
    sharedWithProfiles: Array<UserProfile | null>;
    sharedWith: Array<string>;
}

interface NarrativeHeaderState {
    data: AsyncProcess<NarrativeHeaderData, string>;
}

export default class NarrativeHeader extends React.Component<
    NarrativeHeaderProps,
    NarrativeHeaderState
> {
    state: NarrativeHeaderState = {
        data: {
            status: AsyncProcessStatus.NONE,
        },
    };
    componentDidMount() {
        // fetch data
        this.fetchData();
    }

    componentDidUpdate(prevProps: NarrativeHeaderProps) {
        if (
            prevProps.narrativeDoc.access_group !==
            this.props.narrativeDoc.access_group
        ) {
            this.fetchData();
        }
    }

    async fetchData() {
        try {
            const userModel = new UserModel(
                this.props.config.services.UserProfile.url,
                this.props.authInfo.token
            );
            const authorProfile = await userModel.fetchProfile(
                this.props.narrativeDoc.creator
            );
            const sharedWith = this.props.narrativeDoc.shared_users.filter(
                // We handle the "*" public user because it has been known to appear
                // in search, even though it is normally ommitted.
                (user: string) => {
                    return (
                        user !== this.props.authInfo.tokenInfo.user &&
                        user === '*'
                    );
                }
            );
            const sharedWithProfiles = await userModel.fetchProfiles(
                sharedWith
            );

            this.setState({
                data: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        authorProfile,
                        sharedWithProfiles,
                        sharedWith,
                    },
                },
            });
        } catch (ex) {
            this.setState({
                data: {
                    status: AsyncProcessStatus.ERROR,
                    error: ex instanceof Error ? ex.message : 'Unknown error',
                },
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

    // countDataTypes(data: any) {
    //     const counts: Record<string, number> = {};
    //     const normalize = (typeId: string) => {
    //         const [module, name, majorVersion, minorVersion] =
    //             typeId.split(/[.-]/);
    //         return name;
    //     };
    //     const sortCountDesc = (
    //         freq1: [string, number],
    //         freq2: [string, number]
    //     ) => {
    //         const count1 = freq1[1];
    //         const count2 = freq2[1];
    //         return -1 + +(count1 === count2) + 2 * +(count1 < count2);
    //     };
    //     data.data_objects.forEach((obj: any) => {
    //         const key = normalize(obj.obj_type);
    //         if (!(key in counts)) {
    //             counts[key] = 0;
    //         }
    //         counts[key] = counts[key] + 1;
    //     });
    //     const dataPlaces = Object.entries(counts)
    //         .sort(sortCountDesc)
    //         .slice(0, 3);
    //     const out = [<></>, <></>, <></>];
    //     return out.map((el, ix) => {
    //         if (ix in dataPlaces) {
    //             const [dataType, count] = dataPlaces[ix];
    //             return this.renderDetailsHeaderItem(dataType, count.toString());
    //         }
    //         return el;
    //     });
    // }

    countDataTypes(narrative: NarrativeSearchDoc) {
        const typeCounts = narrative.data_objects.reduce<Map<string, number>>(
            (dataTypeCounts, objectInfo) => {
                const typeName = objectInfo.obj_type.split(/[.-]/)[1];
                if (dataTypeCounts.has(typeName)) {
                    dataTypeCounts.set(
                        typeName,
                        dataTypeCounts.get(typeName)! + 1
                    );
                } else {
                    dataTypeCounts.set(typeName, 1);
                }
                return dataTypeCounts;
            },
            new Map()
        );

        return Array.from(typeCounts.entries()).sort((a, b) => {
            // return a[0].localeCompare(b[0]);
            return b[1] - a[1];
        });
    }

    /**
     * Shows some basic details, specifically:
     *  - author (user id of owner)
     *  - total cells
     *  - visibility (public or private)
     *  - created date
     *  - data objects
     * @param {NarrativeSearchDoc} data - a representation of a narrative
     * @return {JSX}
     */
    renderHeader(loadData: NarrativeHeaderData) {
        const narrativeDoc = this.props.narrativeDoc;
        if (!narrativeDoc) {
            return null;
        }

        const cellTypesInfo = countCellTypes(narrativeDoc);
        // const [gold, silver, bronze] = this.countDataTypes(narrativeDoc);

        const authorName = loadData.authorProfile.user.realname;
        // const sharedWithLinks = detailsSharedWith(
        //     loadData.sharedWith,
        //     loadData.sharedWithProfiles
        // );
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-5">
                        <PropTable
                            // title="Data Objects"
                            noRowsMessage="No data objects in this narrative"
                            rows={
                                [
                                    ['Author', () => {
                                        return  profileLink(
                                            narrativeDoc.creator,
                                            authorName
                                        )
                                    }],
                                    [
                                        'Created on',
                                        readableDate(narrativeDoc.creation_date)
                                    ],
                                    [
                                        'Last saved',
                                        readableDate(narrativeDoc.timestamp)
                                    ],
                                    [
                                        'Version',
                                        String(narrativeDoc.version)
                                    ],
                                    [
                                        'Visibility',
                                        narrativeDoc.is_public
                                            ? 'Public'
                                            : 'Private'
                                            ]
                                ]
                            }
                            styles={{
                                col1: {
                                    flex: '0 0 7em',
                                    // textAlign: 'right',
                                    // fontFamily: 'monospace',
                                },
                                col2: {
                                    justifyContent: 'flex-start'
                                },
                                body: {
                                    // maxHeight: '7em',
                                },
                            }}
                        />
                            
                    </div>
                    <div className="col-4">
                        <PropTable
                            // title="Data Objects"
                            noRowsMessage="No data objects in this narrative"
                            rows={this.countDataTypes(narrativeDoc).map(
                                ([key, value]) => {
                                    return [key, value.toString()];
                                }
                            )}
                            header={[
                                'Data Objects',
                                narrativeDoc.data_objects.length.toString(),
                            ]}
                            styles={{
                                col2: {
                                    flex: '0 0 2em',
                                    textAlign: 'right',
                                    fontFamily: 'monospace',
                                },
                                body: {
                                    maxHeight: '7em',
                                },
                            }}
                        />
                    </div>
                    <div className="col-3">
                        <div className="-prop-table">
                            <PropTable
                                // title="Cells"
                                rows={[
                                    [
                                        cellTypesInfo.kbase_app.label,
                                        cellTypesInfo.kbase_app.count.toString(),
                                    ],
                                    [
                                        cellTypesInfo.code_cell.label,
                                        cellTypesInfo.code_cell.count.toString(),
                                    ],
                                    [
                                        cellTypesInfo.markdown.label,
                                        cellTypesInfo.markdown.count.toString(),
                                    ],
                                    [
                                        cellTypesInfo.data.label,
                                        cellTypesInfo.data.count.toString(),
                                    ],
                                    [
                                        cellTypesInfo.widget.label,
                                        cellTypesInfo.widget.count.toString(),
                                    ],
                                ]}
                                header={[
                                    'Cells',
                                    narrativeDoc.total_cells.toString(),
                                ]}
                                styles={{
                                    col2: {
                                        flex: '0 0 2em',
                                        textAlign: 'right',
                                        fontFamily: 'monospace',
                                    },
                                }}
                            />
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
        return (
            <Loading
                size={'normal'}
                type={'block'}
                message={'Loading data...'}
            />
        );
    }

    renderError(message: string) {
        return <ErrorMessage message={message} />;
    }

    renderState() {
        switch (this.state.data.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.data.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderHeader(this.state.data.value);
        }
    }

    render() {
        return (
            <div className="NarrativeHeader container-fluid">
                {this.renderState()}
            </div>
        );
    }
}
