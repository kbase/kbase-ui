import { Component } from "react";
import { highlightKIDL, replaceMarkedTypeLinksInSpec } from "../syntax";
import './Spec.css';

export interface SpecProps {
    spec: string;
}

export default class Spec extends Component<SpecProps> {
    render() {
        const highlighted = highlightKIDL(this.props.spec);
        const spec = replaceMarkedTypeLinksInSpec(highlighted.value);
       
        return <div className="TypeView-Spec">
            <pre>
                <code className="kidl" dangerouslySetInnerHTML={{__html: spec}}>
                </code>
            </pre>
        </div>
    }
}
