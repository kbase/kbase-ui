import React, { Component } from 'react';
import Select, {StylesConfig} from 'react-select';
import { GroupIdentity } from '../../../utils/OrganizationsClient';
import DashboardButton from '../../generic/DashboardButton';

interface OrgListProps {
  linkOrg: (orgId: string) => void;
  orgs: Array<GroupIdentity>;
}

interface OrgOption {
  value: string;
  label: string;
}

interface OrgListState {
  selectedOrgId: string;
}

export default class OrgSelect extends Component<OrgListProps, OrgListState> {
  private orgOptions: Array<OrgOption> = [];
  constructor(props: OrgListProps) {
    super(props);
    for (const org of props.orgs) {
      this.orgOptions.push({
        value: org.id,
        label: org.name,
      });
    }
    this.state = {
      selectedOrgId: '',
    };
  }

  handleOrgChange = (selected: any) => {
    this.setState({ selectedOrgId: selected?.value || '' });
  };

  render() {
    // const selectStyles: Partial<Styles<OrgOption, false>> = {
    //   menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    // };
    const selectStyles: StylesConfig<OrgOption, false> = {
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };
    return (
      <div className="flex flex-row flex-nowrap">
        <Select
          // defaultOptions
          isClearable
          isSearchable
          placeholder="Select an Organization ..."
          styles={{
            ...selectStyles,
            container: (base) => ({ ...base, flex: 2 }),
          }}
          menuPortalTarget={document.body}
          className="basic-single"
          classNamePrefix="select"
          options={this.orgOptions}
          onChange={this.handleOrgChange}
        />
        <DashboardButton
          disabled={this.state.selectedOrgId.length === 0}
          onClick={() => this.props.linkOrg(this.state.selectedOrgId)}
          bgcolor={'lightblue'}
        >
          Link
        </DashboardButton>
      </div>
    );
  }
}
