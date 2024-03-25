import Select from 'antd/lib/select';
import { Component } from 'react';
import { OptionValue } from '../../../lib/types';

export interface UserSelectProps {
    options: Array<OptionValue<string>>;
    changed: (apps: Array<string>) => void;
    search: (term: string) => void;
    defaultValue?: Array<string>;
}

interface UserSelectState {
}

export default class UserSelect extends Component<UserSelectProps, UserSelectState> {
    onChange(value: string) {
        // oddly enough, clearing a field will set value
        // to undefined :(
        // TODO: either file a bug report w/ ant design, or switch to antd 4 and
        // see if it is fixed.
        if (typeof value === 'undefined') {
            value = '';
        }
        if (value.length === 0) {
            this.props.changed([]);
        } else {
            this.props.changed([value]);
        }
    }

    onSearch(value: string) {
        this.props.search(value);
    }

    render() {
        const defaultValue = this.props.defaultValue ? this.props.defaultValue[0] : undefined;

        return <Select<string>
            showSearch
            allowClear
            onChange={this.onChange.bind(this)}
            onSearch={this.onSearch.bind(this)}
            // TODO: figure out how to remove this hack; without it, display is
            // inline-block, and the control does not fill the column.
            style={{display: 'block'}}
            filterOption={false}
            defaultValue={defaultValue}
            options={this.props.options}
        />;
    }
}
