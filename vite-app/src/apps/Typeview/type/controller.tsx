import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { AuthenticationState, AuthenticationStatus } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from "lib/SimpleError";
import WorkspaceClient, { GetTypeInfoResult } from 'lib/kb_lib/comm/coreServices/Workspace';
import { Component } from "react";
import { Config } from "types/config";
import { TypeInfo, parseTypeId } from "../common";
import View from "./view";



export interface EnhancedTypeInfo extends GetTypeInfoResult {
    typeIdentifier: TypeInfo;
    typeVersions: Array<TypeInfo>
    typesUsing: Array<TypeInfo>
    typesUsed: Array<TypeInfo>
    // id: string;
    // module: string;
    // name: string;
    // minor: string;
    // major: string;
    // version: string;
}

export interface TypeViewControllerProps {
    authState: AuthenticationState;
    config: Config;
    setTitle: (title: string) => void;
    typeId: string;
}

export interface TypeViewControllerDataState {
    typeInfo: EnhancedTypeInfo
}

type TypeViewControllerState = AsyncProcess<TypeViewControllerDataState, SimpleError>



export default class TypeViewController extends Component<TypeViewControllerProps, TypeViewControllerState> {
    constructor(props: TypeViewControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.props.setTitle('Type Specification...');
        this.fetchData();
    }

    async fetchData() {
        //  const workspace = new GenericClient({
        //     module: 'Workspace',
        //     url: this.props.runtime.config('services.workspace.url'),
        //     token: this.props.runtime.service('session').getAuthToken()
        // });
        const token = (() => {
            if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                return;
            }
            return this.props.authState.authInfo.token
        })();
        const workspace = new WorkspaceClient({
            url: this.props.config.services.Workspace.url,
            token,
            timeout: this.props.config.ui.constants.clientTimeout
        })
        try {
            this.setState({
                status:  AsyncProcessStatus.PENDING
            });

            // fetch data...
            const typeInfo = await workspace.get_type_info(this.props.typeId);

            const typeIdentifier = parseTypeId(typeInfo.type_def);

            const typeVersions: Array<TypeInfo> = typeInfo.type_vers.map((typeId) => {
                return  parseTypeId(typeId);
            });

            const typesUsing: Array<TypeInfo> = typeInfo.using_type_defs.map((typeId) => {
                return parseTypeId(typeId)
            })

            const typesUsed: Array<TypeInfo> = typeInfo.used_type_defs.map((typeId) => {
                return parseTypeId(typeId)
            });

            this.props.setTitle(`Type Specification for "${typeInfo.type_def}"`);

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    typeInfo: {
                        ...typeInfo,
                        typeIdentifier,
                        typeVersions,
                        typesUsing,
                        typesUsed
                    }
                }
            });
        } catch (ex) {
            console.error(ex);
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown error'
                }
            })
        }
    }

    renderLoading() {
        return <Loading message="Loading Type Spec Viewer..." />
    }

    renderError({message}: SimpleError) {
        return <ErrorMessage message={message} />
    }

    renderSuccess({typeInfo}: TypeViewControllerDataState) {
        return <View typeInfo={typeInfo} />
    }
   
    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR: 
                return this.renderError(this.state.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.value);
        }
    }
}