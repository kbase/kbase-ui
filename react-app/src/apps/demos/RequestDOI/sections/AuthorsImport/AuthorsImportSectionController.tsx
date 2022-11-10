
import { Author, MinimalNarrativeInfo } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { JSONLikeObject } from 'lib/kb_lib/jsonLike';
import { Component } from 'react';
import { Model, NarrativePermission } from '../../Model';
import AuthorsImportSection from './AuthorsImportSection';


export interface ImportableAuthor extends JSONLikeObject {
    username: string;
    firstName?: string,
    middleName?: string,
    lastName?: string,
    institution?: string;
    orcidId?: string,
    permission: NarrativePermission
}

export interface AuthorsImportSectionControllerProps {
    model: Model;
    authors: Array<Author>
    narrativeInfo: MinimalNarrativeInfo;
    setTitle: (title: string) => void;
    onDone: (authors: Array<ImportableAuthor>) => void;
}

export interface AuthorsImportState {
    authors: Array<ImportableAuthor>;
}


export type AuthorsImportSectionControllerState = AsyncProcess<AuthorsImportState, { message: string }>



export default class AuthorsImportSectionController extends Component<AuthorsImportSectionControllerProps, AuthorsImportSectionControllerState> {
    constructor(props: AuthorsImportSectionControllerProps) {
        super(props);

        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.loadData();
    }

    // Model interaction

    onDone() {
        if (this.state.status === AsyncProcessStatus.SUCCESS) {
            this.props.onDone(this.state.value.authors);
        }
    }

    async loadData() {
        this.setState({
            status: AsyncProcessStatus.PENDING
        })
        // Get all authors from the narrative.
        try {
            const sharingUsers = await this.props.model.getNarrativeSharingUsers(this.props.narrativeInfo);

            const authors: Array<ImportableAuthor> = sharingUsers.map(({ username, firstName, middleName, lastName, institution, permission }) => {
                return {
                    username,
                    firstName,
                    middleName,
                    lastName,
                    institution,
                    orcidId: '',
                    permission
                };
            });

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    authors
                }
            });
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: ex.message
                    }
                });
            } else {
                this.setState({
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'Unknown error'
                    }
                });
            }
        }
    }
    // Renderers

    renderLoading() {
        return <Loading message="Loading authors from Narrative ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess({ authors }: AuthorsImportState) {
        return <AuthorsImportSection authors={authors} onDone={this.onDone.bind(this)} />
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.value);
        }
    }
}