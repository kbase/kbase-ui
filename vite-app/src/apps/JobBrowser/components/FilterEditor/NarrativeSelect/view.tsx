import Select from 'antd/lib/select';
import { Component } from 'react';
import { OptionValue } from '../../../lib/types';

export interface NarrativeSelectProps {
    narratives: Array<OptionValue<number>>;
    onChange: (narratives: Array<number>) => void;
    defaultValue?: Array<number>;
}

interface NarrativeSelectState {
}

export default class NarrativeSelect extends Component<NarrativeSelectProps, NarrativeSelectState> {
    onChange(value: number) {
        // oddly enough, clearing a field will set value
        // to undefined :(
        // TODO: either file a bug report w/ ant design, or switch to antd 4 and
        // see if it is fixed.
        if (typeof value === 'undefined') {
            this.props.onChange([]);
        } else {
            this.props.onChange([value]);
        }
    }

    render() {
        const narrativeOptions = this.props.narratives
            .map((narrative) => {
                return <Select.Option
                    key={narrative.value}
                    value={narrative.value}>{narrative.label}</Select.Option>;
            });

        const defaultValue = this.props.defaultValue ? this.props.defaultValue[0] : undefined;

        return <Select<number>
            showSearch
            allowClear
            defaultValue={defaultValue}
            onChange={this.onChange.bind(this)}
            // TODO: figure out how to remove this hack; without it, display is
            // inline-block, and the control does not fill the column.
            style={{display: 'block'}}
            filterOption={(filterTerm, option) => {
                if (!option) {
                    return true;
                }
                if (!option.props.children) {
                    return true;
                }
                return String(option.props.children).toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0;
            }}
        >
            {narrativeOptions}
        </Select>;
    }
}
