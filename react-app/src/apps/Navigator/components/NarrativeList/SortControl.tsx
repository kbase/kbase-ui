import { Component } from 'react';
import Select, { SingleValue } from 'react-select';
import { sorts } from '../../utils/NarrativeSearch';

// TODO: Is it not exported from react-select?
interface OptionType<T> {
    [key: string]: T;
}

interface SortControlState {
    sort: string;
}

interface SortControlProps {
    searching: boolean;
    onSortChange: (sort: string) => void;
    sort: string;
}
// const sortSlugDefault = Object.keys(sorts)[0];
const sortOptions = Object.entries(sorts).map(([value, label]) => {
    return {
        label,
        value,
    };
});

// Filter bar for searching and sorting data results
export default class SortControl extends Component<
    SortControlProps,
    SortControlState
> {
    constructor(props: SortControlProps) {
        super(props);
        this.state = {
            sort: this.props.sort,
        };
    }

    getSort(sort: string): OptionType<string> {
        if (sort in sorts) {
            return {
                value: sort,
                label: sorts[sort],
            };
        }
        // An invalid value  (can this occur? TODO!)
        throw new Error(`Sort option "${sort}" not recognized`);
    }

    handleSortChange(option: SingleValue<OptionType<string>>): void {
        if (option === null) {
            // This should not be possible since we do not allow an empty
            // option, but if it is, we would use "natural order", I suppose.
            return;
        }
        const sort = option.value;

        this.setState({
            ...this.state,
            sort,
        });
        this.props.onSortChange(sort);
    }

    render() {
        const sortOption = this.getSort(this.state.sort);
        return (
            <span className="SortDropdown">
                <div className="-control" role="listbox">
                    <Select<OptionType<string>>
                        isSearchable={false}
                        defaultValue={sortOption}
                        value={sortOption}
                        placeholder="Sort by..."
                        options={sortOptions}
                        styles={{
                            container: (base) => {
                                return {
                                    ...base,
                                    width: '14em',
                                };
                            },
                        }}
                        onChange={this.handleSortChange.bind(this)}
                    />
                </div>
            </span>
        );
    }
}
