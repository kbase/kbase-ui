import UILink from 'components/UILink2';
import { Component, PropsWithChildren } from 'react';

export interface NarrativeLinkProps extends PropsWithChildren {
  narrativeID: number;
}

export default class NarrativeLink extends Component<NarrativeLinkProps> {
  render() {
    return (
      <UILink path={`narrative/${this.props.narrativeID}`} type="europaui" newWindow={true}>
        {this.props.children}
      </UILink>
    );
  }
}
