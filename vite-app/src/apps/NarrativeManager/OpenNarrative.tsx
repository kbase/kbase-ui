import { Component } from "react";

export interface OpenNarrativeProps {
    workspaceID: number;
}

export default class OpenNarrative extends Component<OpenNarrativeProps, {}> {
    url: string;
    constructor(props: OpenNarrativeProps) {
        super(props);
        this.url = this.makeNarrativePath();
    }
    componentDidMount() {
        window.location.href = this.makeNarrativePath();
    }
    makeNarrativePath() {
        return `${window.location.origin}/narrative/${this.props.workspaceID}`;
    }

    render() {
        const url = this.makeNarrativePath();
        return <div className="well">
            <div className="well-header">
                Opening your Narrative...
            </div>
            <div className="well-body">
                <p>
                    If the Narrative does not open within a few seconds, use the following link to open it directly:
                </p>
                <p>
                    <a href={url} target="_blank" rel="noreferrer">
                        Open your Narrative: {url}
                    </a>
                </p>
            </div>
        </div>
    }
}