import React from 'react';
import View, { FilterEditorProps } from './view';

/* For HOC */
// type ExternalProps = FilterEditorProps;

// export interface InjectedProps {
//     narrative: Array<OptionValue<string>>;
// }


// export const dataWrapper = () => {
//     <OriginalProps extends {}>(
//         Component: (React.ComponentClass<OriginalProps & InjectedProps> |
//             React.StatelessComponent<OriginalProps & InjectedProps>)
//     ) => {

//     };
// };

/* For Component */
export interface DataProps {
    token: string;
    username: string;
    workspaceURL: string;
}

// interface SuppliedProps {
//     narratives: Array<OptionValue<string>>;
// }

type TheProps = Omit<DataProps & FilterEditorProps, "narratives">;

interface DataState {
    ready: boolean;
}

export default class Data extends React.Component<TheProps, DataState> {
    constructor(props: TheProps) {
        super(props);
        this.state = {
            ready: true
        };
    }

    async componentDidMount() {
    }

    render() {
        if (this.state.ready) {
            return <View
                filter={this.props.filter}
                onChange={this.props.onChange}
            />;
        } else {
            return "loading...";
        }

    }
}