import Well from "components/Well";
import { $GlobalMessenger } from "contexts/EuropaContext";
import { europaBaseURL, navigationPathToURL } from "contexts/RouterContext";
import { Component } from "react";

export interface OpenNarrativeProps {
    workspaceID: number;
}

export default class OpenNarrative extends Component<OpenNarrativeProps, {}> {

    makeNarrativeURL() {
        return navigationPathToURL({
            path: `narrative/${this.props.workspaceID}`,
            type: 'europaui',
        }, false).toString();
    }

    componentDidMount() {
        const url = europaBaseURL();
        url.pathname = `narrative/${this.props.workspaceID}`;
        $GlobalMessenger.send('europa', 'redirect', {url: url.toString()});
    }
    
    render() {
        const url = this.makeNarrativeURL();
        return <Well variant="info">
            <Well.Header>
                Opening your Narrative...
            </Well.Header>
            <Well.Body>
                <p>
                    If the Narrative does not open within a few seconds, use the following link to open it directly:
                </p>
                <p>
                    <a href={url} target="_top" rel="noreferrer">
                        Open your Narrative: {url}
                    </a>
                </p>
            </Well.Body>
        </Well>
    }
}