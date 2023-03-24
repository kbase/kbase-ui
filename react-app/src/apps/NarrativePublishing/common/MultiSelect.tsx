import Empty from 'components/Empty';
import { Component } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Tag } from './Tag';

export interface SelectItem {
    value: string;
    label: string;
}

export interface MultiSelectProps {
    availableItems: Array<SelectItem>;
    selectedValues: Array<string>;
    noun: string;
    emptyMessage?: string;
    onChange: (selectedValues: Array<string>) => void;
}

export default class MultiSelect extends Component<MultiSelectProps> {
    removeItem(valueToRemove: string) {
        const selectedValues = this.props.selectedValues.filter((value) => {
            return value !== valueToRemove;
        });
        this.props.onChange(selectedValues);
    }

    renderSelected() {
        if (this.props.selectedValues.length === 0) {
            return <Empty size="inline" message={this.props.emptyMessage || 'None selected'} />;
        }
        const items = this.props.availableItems.filter(({ value }) => {
            return this.props.selectedValues.includes(value);
        });
        items.sort(({ label: aValue }, { label: bValue }) => {
            return aValue.localeCompare(bValue);
        });
        return items.map(({ value, label }) => {
            return (
                <Tag key={value} variant="light" border fill>
                    {label}
                    <Button
                        size="sm"
                        variant="outline-danger"
                        style={{
                            position: 'absolute',
                            right: '0',
                            top: '0',
                            border: 'none',
                            padding: '0 0.25em',
                        }}
                        onClick={() => {
                            this.removeItem(value);
                        }}
                    >
                        <span className="fa fa-times" />
                    </Button>
                </Tag>
            );
        });
    }
    onItemSelected(value: string) {
        const selectedValues = this.props.selectedValues.concat([value]);
        this.props.onChange(selectedValues);
    }
    renderSelect() {
        const options = this.props.availableItems
            .filter(({ value }) => {
                return !this.props.selectedValues.includes(value);
            })
            .map(({ value, label }) => {
                return (
                    <option key={value} value={value}>
                        {label}
                    </option>
                );
            });
        if (options.length === 0) {
            return <Tag variant="warning">All {this.props.noun}s Added</Tag>;
        } else {
            options.unshift(
                <option key="blank" value="">
                    - add a {this.props.noun} -
                </option>
            );
        }
        return (
            <Form.Select
                onChange={(ev) => {
                    this.onItemSelected(ev.target.value);
                }}
            >
                {options}
            </Form.Select>
        );
    }

    renderSelect2() {
        const options = this.props.availableItems
            .filter(({ value }) => {
                return !this.props.selectedValues.includes(value);
            })
            .map(({ value, label }) => {
                return (
                    <option key={value} value={value}>
                        {label}
                    </option>
                );
            });
        options.unshift(
            <option key="blank" value="">
                Add a {this.props.noun}
            </option>
        );
        return (
            <Form.Select
                onChange={(ev) => {
                    this.onItemSelected(ev.target.value);
                }}
            >
                {options}
            </Form.Select>
        );
    }
    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                    className="flex-row"
                    style={{
                        flexWrap: 'wrap',
                    }}
                >
                    <div className="flex-row" style={{ flex: '0 0 auto', marginRight: '0.25em' }}>
                        <div
                            className="flex-col"
                            style={{ flex: '0 0 auto', justifyContent: 'center' }}
                        >
                            {this.renderSelect()}
                        </div>
                    </div>
                    {this.renderSelected()}
                </div>
            </div>
        );
    }
}
