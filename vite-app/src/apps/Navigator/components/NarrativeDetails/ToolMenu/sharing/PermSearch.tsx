import Select, { MultiValue } from 'react-select';
import AsyncSelect from 'react-select/async';
import { Component } from 'react';
import { PERM_MAPPING } from './Definitions';
import { AuthService } from '../../../../utils/AuthService';
import { AuthInfo } from '../../../../../../contexts/Auth';
import { Config } from '../../../../../../types/config';
import { Button, Col, Row } from 'react-bootstrap';

/* The main user input search bar */
interface PermSearchProps {
    authInfo: AuthInfo;
    addPermissions: (usernames: string[], permission: string) => void;
    currentUsername: string;
    config: Config;
}

interface PermSearchState {
    selectedUsers: MultiValue<{ value: string; label: string }>; // user ids
    perm: string;
}

export interface PermOption {
    value: string;
    label: string;
}

export default class PermSearch extends Component<
    PermSearchProps,
    PermSearchState
> {
    state: PermSearchState = {
        selectedUsers: [],
        perm: 'r',
    };
    private permOptions: Array<PermOption> = [
        { value: 'r', label: PERM_MAPPING['r'] },
        { value: 'w', label: PERM_MAPPING['w'] },
        { value: 'a', label: PERM_MAPPING['a'] },
    ];

    async searchUsers(term: string, _callback: any): Promise<Array<any>> {
        if (term.length < 2) {
            return Promise.resolve([]);
        }
        const auth = new AuthService(
            this.props.config.services.Auth2.url,
            this.props.authInfo.token
        );
        const users = await auth.searchUsernames(term);
        return Object.entries(users)
            .filter(([username, realname]) => {
                return username !== this.props.currentUsername;
            })
            .map(([username, realname]) => {
                return {
                    value: username,
                    label: `${realname} (${username})`,
                };
            })
            .sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
    }

    handleUserChange(
        selectedUsers: MultiValue<{ value: string; label: string }>
    ) {
        if (!selectedUsers) {
            this.setState({ selectedUsers: [] });
        } else {
            this.setState({ selectedUsers });
        }
    }

    handlePermChange(selected: any) {
        this.setState({ perm: selected.value });
    }

    async updatePerms() {
        const usernames = this.state.selectedUsers.map(({ value }) => {
            return value;
        });
        await this.props.addPermissions(usernames, this.state.perm);
        this.setState({
            selectedUsers: [],
        });
    }

    render() {
        return (
            <Row className="mb-1 align-items-center">
                <Col md="7">
                    <AsyncSelect
                        isMulti
                        cacheOptions
                        defaultOptions
                        value={this.state.selectedUsers}
                        loadOptions={this.searchUsers.bind(this)}
                        placeholder={
                            'Select one or more users to share with...'
                        }
                        styles={{
                            menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                            }),
                            container: (base) => ({ ...base, flex: 2 }),
                        }}
                        noOptionsMessage={({ inputValue }) => {
                            if (inputValue.length === 0) {
                                return 'Search for a user by username or real name';
                            } else if (inputValue.length === 1) {
                                return 'Please enter 2 or more characters to search for users';
                            }
                            return `No user found matching "${inputValue}"`;
                        }}
                        menuPortalTarget={document.body}
                        onChange={this.handleUserChange.bind(this)}
                    />
                </Col>
                <Col md="4">
                    {/* <label
                            className="col-auto"
                            style={{
                                fontWeight: 'bold',
                                color: 'rgb(100 100 100)',
                            }}
                        >
                            Permission Level
                        </label> */}
                    <div className="col">
                        <Select
                            defaultValue={this.permOptions[0]}
                            options={this.permOptions}
                            styles={{
                                menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                }),
                                container: (base) => ({ ...base, flex: 1 }),
                            }}
                            menuPortalTarget={document.body}
                            onChange={this.handlePermChange.bind(this)}
                        />
                    </div>
                </Col>
                <Col md="1">
                    <Button
                        disabled={this.state.selectedUsers.length === 0}
                        onClick={this.updatePerms.bind(this)}
                    >
                        <span className="fa fa-share-alt" />
                    </Button>
                </Col>
            </Row>
        );
    }
}
