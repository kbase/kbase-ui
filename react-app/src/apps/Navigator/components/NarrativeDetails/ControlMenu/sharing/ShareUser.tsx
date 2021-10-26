import React from 'react';
import { PERM_MAPPING, UserPerms } from './Definitions';

/* The individual user that has some sharing permissions */
interface ShareUserProps extends UserPerms {
  updatePerms: (userIds: string[], newPerm: string) => void;
  key: string;
  curUserPerm: string;
}

export default function ShareUser(props: ShareUserProps): React.ReactElement {
  let permDropdown = null;
  if (props.curUserPerm === 'a') {
    permDropdown = (
      <React.Fragment>
        <PermDropdown
          key={props.userId}
          curPerm={props.perm}
          userId={props.userId}
          updatePerms={props.updatePerms}
        />
        <div
          className="pa2 ml1 fa fa-times dim pointer white bg-red br2"
          style={{ alignSelf: 'center' }}
          onClick={() => props.updatePerms([props.userId], 'n')}
        />
      </React.Fragment>
    );
  } else {
    permDropdown = <div className="pa2 ml1">{PERM_MAPPING[props.perm]}</div>;
  }
  return (
    <div
      className={'flex flex-row flex-nowrap pt1'}
      style={{ justifyContent: 'space-between' }}
    >
      <div className="pa2">
        {props.userName} ({props.userId})
      </div>
      <div className={'flex flex-row flex-nowrap'}> {permDropdown}</div>
    </div>
  );
}

/* The little dropdown that each user has */
interface PermDropdownProps {
  curPerm: string; // one of 'n', 'r', 'w', 'a' - text comes from PERM_MAPPING
  updatePerms: (userIds: string[], newPerm: string) => void;
  userId: string;
  key: string;
}

function PermDropdown(props: PermDropdownProps): React.ReactElement {
  const options = ['r', 'w', 'a'].map((o) => (
    <option key={o} value={o}>
      {PERM_MAPPING[o]}
    </option>
  ));

  return (
    <select
      dir="rtl"
      className="br2 b--black-20 pa1"
      defaultValue={props.curPerm}
      onChange={(e) => props.updatePerms([props.userId], e.currentTarget.value)}
    >
      {options}
    </select>
  );
}
