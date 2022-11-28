
import { UserProfile } from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import { Author } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Model, NarrativePermission, StaticNarrativeSummary } from '../../../Model';
import AuthorsImportSection from './AuthorsImportSection';


export interface ImportableAuthor {
    username: string;
    firstName?: string,
    middleName?: string,
    lastName?: string,
    institution?: string;
    emailAddress?: string;
    orcidId?: string,
    contributorType?: string;
    permission: NarrativePermission
    userProfile: UserProfile
}

export interface AuthorsImportSectionControllerProps {
    model: Model;
    authors: Array<Author>
    staticNarrative: StaticNarrativeSummary;
    setTitle: (title: string) => void;
    onDone: (authors: Array<ImportableAuthor>) => void;
}

export interface AuthorsImportState {
    authors: Array<ImportableAuthor>;
    selectedAuthors: Array<ImportableAuthor>;
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
            const sharingUsers = await this.props.model.getNarrativeSharingUsers(this.props.staticNarrative);

            const authors: Array<ImportableAuthor> = sharingUsers.map(({ username, firstName, middleName, lastName, institution, permission, userProfile }) => {
                return {
                    username,
                    firstName,
                    middleName,
                    lastName,
                    institution,
                    orcidId: '',
                    permission,
                    userProfile
                };
            });

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    authors,
                    selectedAuthors: authors
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

    onChangeSelected(selected: boolean, changedAuthor: ImportableAuthor) {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const selectedAuthors = (() => {
            if (selected) {
                return this.state.value.selectedAuthors.concat([changedAuthor]);
            }
            return this.state.value.selectedAuthors.filter((author) => {
                return author !== changedAuthor;
            });
        })();
        this.setState({
            ...this.state,
            value: {
                ...this.state.value,
                selectedAuthors
            }
        });
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading authors from Narrative ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess({ authors, selectedAuthors }: AuthorsImportState) {
        return <AuthorsImportSection authors={authors}
            selectedAuthors={selectedAuthors}
            onChangeSelected={this.onChangeSelected.bind(this)}
            onDone={this.props.onDone}
        />
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