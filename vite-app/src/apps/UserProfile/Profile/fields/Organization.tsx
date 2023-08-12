import { AutoComplete, Form } from 'antd';
import Search from 'antd/es/input/Search';
import React from 'react';
import { MAX_INSTITUTIONS_TO_SHOW, MIN_ORGANIZATION_CHARS } from '../../constants';
import institutions from '../../dataSources/institutions';
import { AntDesignValidationStatus } from '../../types';
import { noScriptTag } from '../../utils';

export interface OrganizationProps {
    name: number | string | Array<number | string>;
    label?: string
    required: boolean;
}

interface OrganizationState {
    message: string;
    status: AntDesignValidationStatus;
    tooManyInstitutionsToRender: [boolean, number?];
    institutionFiltered: Array<{ value: string, label: string }>;
}

export default class Organization extends React.Component<OrganizationProps, OrganizationState> {
    constructor(props: OrganizationProps) {
        super(props)
        this.state = {
            message: '',
            status: '',
            tooManyInstitutionsToRender: [false],
            institutionFiltered: []
        };
    }

    onSearch(searchValue: string) {
        const searchValueLower = searchValue.toLowerCase();
        if (searchValue.length >= MIN_ORGANIZATION_CHARS) {
            const filtered = institutions.filter(({ value, label }) =>
                value.toLowerCase().includes(searchValueLower) ||
                label.toLowerCase().includes(searchValueLower)
            );
            if (filtered.length <= MAX_INSTITUTIONS_TO_SHOW) {
                this.setState({
                    tooManyInstitutionsToRender: [false],
                    institutionFiltered: filtered
                });
            } else {
                this.setState({
                    tooManyInstitutionsToRender: [true, filtered.length],
                    institutionFiltered: [{
                        value: "", label: `Too Many Institutions to Render (${filtered.length}) - keep typing!`
                    }]
                });
            }
        } else {
            this.setState({
                tooManyInstitutionsToRender: [false],
                institutionFiltered: [{
                    value: "",
                    label: `Enter at least ${MIN_ORGANIZATION_CHARS} characters for search - keep typing!!`
                }]
            });
        }
    }

    render() {
        return <Form.Item
            name={this.props.name}
            label={this.props.label}
            required={this.props.required}
            rules={[
                { required: false, message: 'an organization is required' },
                {
                    validator: async (_, value: string) => {
                        noScriptTag(value);
                    }
                }
            ]}
        >
            <AutoComplete
                options={this.state.institutionFiltered}
                onSearch={this.onSearch.bind(this)}
                popupMatchSelectWidth={false}
            >
                <Search autoComplete='' />
            </AutoComplete>
        </Form.Item>;
    }
}
