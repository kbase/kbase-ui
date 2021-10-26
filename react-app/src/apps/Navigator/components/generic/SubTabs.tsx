/**
 * Meant to be used for subtabs in a view with larger tabs
 * (or on a page with some main tabs at the top).
 *
 * This is really just a shorthand way to making a horizontal list of
 * "buttons" that activate whatever's bound to the onTabSelect prop.
 */
import React from 'react';
import { Link } from 'react-router-dom';

// as of now eslint cannot detect when imported interfaces are used
import { Props } from './TabHeader'; // eslint-disable-line no-unused-vars

const tabClasses = {
  active: 'subtab active',
  inactive: 'subtab inactive',
};

export const SubTabs: React.FC<Props> = ({ className, selected, tabs }) => {
  return (
    <div className="w-100 bb b--black-20">
      <ul className="pa0 ma0 tc b w-100">
        {tabs.map(([tabSlug, tabData]) => {
          const className =
            selected === tabSlug ? tabClasses.active : tabClasses.inactive;
          return (
            <Link key={tabSlug} to={tabData.link}>
              <li
                key={tabSlug}
                className={className}
                style={{ userSelect: 'none', float: 'none' }}
              >
                {tabData.name}
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};

export default SubTabs;
