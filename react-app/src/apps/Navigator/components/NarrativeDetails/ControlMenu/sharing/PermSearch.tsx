import Select, {MultiValue} from 'react-select';
import AsyncSelect from 'react-select/async';
import DashboardButton from '../../../generic/DashboardButton';
import React, { Component } from 'react';
import { PERM_MAPPING } from './Definitions';
import { AuthService } from '../../../../utils/AuthService';
import {AuthInfo} from "../../../../../../contexts/Auth";
import {Config} from "../../../../../../types/config";

/* The main user input search bar */
interface PermSearchProps {
  authInfo: AuthInfo;
  addPerms: (userIds: string[], perm: string) => void;
  currentUser: string; // the current user id
  config: Config
}

interface PermSearchState {
  selectedUsers: string[]; // user ids
  perm: string;
}

export interface PermOption {
  value: string;
  label: string;
}

export default class PermSearch extends Component<PermSearchProps> {
  state: PermSearchState = {
    selectedUsers: [],
    perm: 'r',
  };
  private permOptions: Array<PermOption> = [
    { value: 'r', label: PERM_MAPPING['r'] },
    { value: 'w', label: PERM_MAPPING['w'] },
    { value: 'a', label: PERM_MAPPING['a'] },
  ];

  searchUsers(term: string, _callback: any): Promise<Array<any>> {
    if (term.length < 2) {
      return Promise.resolve([]);
    }
    const auth = new AuthService(this.props.config.services.Auth2.url, this.props.authInfo.token);
    return auth.searchUsernames(term).then((usernames) => {
      return Object.keys(usernames)
        .filter((userId) => userId !== this.props.currentUser)
        .map((userId) => ({
          value: userId,
          label: `${usernames[userId]} (${userId})`,
        }))
        .sort((a, b) => a.value.localeCompare(b.value));
    });
  }

  handleUserChange = (selected: MultiValue<string>) => {
    if (!selected) {
      this.setState({ selectedUsers: [] });
    } else {
      const selectedUsers = selected.map((s) => s);
      this.setState({ selectedUsers });
    }
  };

  handlePermChange = (selected: any) => {
    this.setState({ perm: selected.value });
  };

  updatePerms = () => {
    this.props.addPerms(this.state.selectedUsers, this.state.perm);
  };

  render() {
    return (
      <div className="flex flex-row flex-nowrap">
        <AsyncSelect
          isMulti
          cacheOptions
          defaultOptions
          loadOptions={this.searchUsers.bind(this)}
          placeholder={'Share with...'}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            container: (base) => ({ ...base, flex: 2 }),
          }}
          menuPortalTarget={document.body}
          onChange={this.handleUserChange.bind(this)}
        />
        <Select
          defaultValue={this.permOptions[0]}
          options={this.permOptions}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            container: (base) => ({ ...base, flex: 1 }),
          }}
          menuPortalTarget={document.body}
          onChange={this.handlePermChange}
        />
        <div style={{ flexShrink: 1 }}>
          <DashboardButton
            disabled={this.state.selectedUsers.length === 0}
            onClick={this.updatePerms}
            bgcolor={'lightblue'}
          >
            Apply
          </DashboardButton>
        </div>
      </div>
    );
  }
}
