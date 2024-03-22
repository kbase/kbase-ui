import { FilterSpec } from "apps/JobBrowser/lib/JobBrowserBFFClient";
import { ConfigContext } from "contexts/ConfigContext";
import { AuthenticationStatus, EuropaContext } from "contexts/EuropaContext";
import { AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import FilterEditor from "./view";

export interface FilterEditorControllerProps {
    onChange: (filter: FilterSpec) => void;
    filter: FilterSpec;
}

interface FilterEditorControllerState {
}

export default class FilterEditorController extends Component<FilterEditorControllerProps, FilterEditorControllerState> {
    render() {
        return <ConfigContext.Consumer>
            {(value) => {
                if (value.status !== AsyncProcessStatus.SUCCESS) {
                    return;
                }
                return <EuropaContext.Consumer>
                    {(value) => {
                         if (value.status !== AsyncProcessStatus.SUCCESS) {
                            return;
                        }
                        if (value.value.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                            return;
                        }
                        return <FilterEditor
                            onChange={this.props.onChange}
                            filter={this.props.filter}
                            config={value.value.config}
                            auth={value.value.authState}
                        />
                    }}
                </EuropaContext.Consumer>
            }}
        </ConfigContext.Consumer>
    }
}
