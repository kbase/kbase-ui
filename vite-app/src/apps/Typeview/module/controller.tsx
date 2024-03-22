import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { AuthenticationState, AuthenticationStatus } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from "lib/SimpleError";
import WorkspaceClient, { GetModuleInfoResult, ListModuleVersionsResult } from 'lib/kb_lib/comm/coreServices/Workspace';
import { Component } from "react";
import { Config } from "types/config";
import { ModuleIdentifier, TypeInfo, parseModuleId, parseTypeId } from "../common";
import View from "./view";

export interface ModuleInfo {
    info: GetModuleInfoResult,
    versions: ListModuleVersionsResult,
    name: string,
    // version: number
    types: Array<TypeInfo>
    includedModules: Array<ModuleIdentifier>
}

export interface ModuleViewControllerProps {
    authState: AuthenticationState;
    config: Config;
    setTitle: (title: string) => void;
    moduleId: string;
}

export interface ModuleViewControllerDataState {
    moduleInfo: ModuleInfo
}

type ModuleViewControllerState = AsyncProcess<ModuleViewControllerDataState, SimpleError>

export default class ModuleViewController extends Component<ModuleViewControllerProps, ModuleViewControllerState> {
    constructor(props: ModuleViewControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.props.setTitle('Module Specification...');
        this.fetchData();
    }

    async fetchData() {
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

            const {name} = parseModuleId(this.props.moduleId);

            // fetch data...
            const [info, versions] = await Promise.all([
                workspace.get_module_info({mod: name}),
                workspace.list_module_versions({mod: name})
            ]);

            const types: Array<TypeInfo> = Object.keys(info.types).map((typeId: string) => {
                return parseTypeId(typeId);
            });

            const includedModules: Array<ModuleIdentifier> = Object.keys(info.included_spec_version).map((moduleId: string) => {
                return parseModuleId(moduleId);
            })

            this.props.setTitle(`Module Specification for "${name}"`);

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    moduleInfo: {
                        info, versions, name, types, includedModules
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

    renderSuccess({moduleInfo}: ModuleViewControllerDataState) {
        return <View moduleInfo={moduleInfo} />
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
