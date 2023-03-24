// import { Option, OptionsGroups } from "lib/reactSelectTypes";
import { Component } from 'react';
// import Select, { MultiValue, OnChangeValue, SingleValue } from 'react-select';
import { EditableWork } from '../Model';

import WorkEditor from '../common/WorkEditor';

export interface EditWorkProps {
    work: EditableWork;
    // orcidLink: LinkRecord;
    onSave: (update: EditableWork) => Promise<void>;
}

interface EditWorkState {}

export default class EditWork extends Component<EditWorkProps, EditWorkState> {
    render() {
        return (
            <WorkEditor
                onSave={this.props.onSave}
                work={this.props.work}
                // orcidLink={this.props.orcidLink}
            />
        );
    }
}
