import Select from 'antd/lib/select';
import { Component } from 'react';
import { OptionValue } from '../../../lib/types';

export interface AppModuleSelectProps {
    options: Array<OptionValue<string>>;
    onChange: (moduleName: string) => void;
    value: string;
    defaultValue?: Array<string>;
}

interface AppModuleSelectState {

}

export default class AppModuleSelect extends Component<AppModuleSelectProps, AppModuleSelectState> {

    // onChange(value: string) {
    //     // oddly enough, clearing a field will set value
    //     // to undefined :(
    //     // TODO: either file a bug report w/ ant design, or switch to antd 4 and
    //     // see if it is fixed.
    //     if (typeof value === 'undefined') {
    //         value = '';
    //     }
    //     if (value.length === 0) {
    //         this.props.onChange('');
    //     } else {
    //         this.props.onChange(value);
    //     }
    // }

    renderAppModuleSelector() {
        const options = this.props.options
            .map((option) => {
                return <Select.Option
                    key={option.value}
                    value={option.value}>{option.label}</Select.Option>;
            });

        // const defaultValue = this.props.defaultValue ? this.props.defaultValue[0] : undefined;
        return <Select<string>
            showSearch
            onChange={this.props.onChange}
            // TODO: figure out how to remove this hack; without it, display is
            // inline-block, and the control does not fill the column.
            style={{display: 'block'}}
            allowClear
            // defaultValue={defaultValue}
            value={this.props.value}
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
            {options}
        </Select>;
    }
    render() {
        return this.renderAppModuleSelector();
    }
}