import { Component } from 'react';

import WorkEditor, { EditableWork } from '../newEditor/WorkEditor';

export interface EditWorkProps {
    work: EditableWork;
    // orcidLink: LinkRecord;
    updateWork: (update: EditableWork) => Promise<void>;
}

interface EditWorkState { }

export default class EditWork extends Component<EditWorkProps, EditWorkState> {
    render() {
        return (
            <WorkEditor
                onSave={this.props.updateWork}
                work={this.props.work}
            />
        );
    }
}
