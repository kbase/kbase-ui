import React, { Component } from 'react';

interface NotFoundPageProps {
  href?: string;
  linkText?: string;
}

interface NotFoundPageState {}

export default class NotFoundPage extends Component<
  NotFoundPageProps,
  NotFoundPageState
> {
  render() {
    const href = this.props.href || '/';
    const linkText = this.props.linkText || 'Return home';
    return (
      <section className="mt4 tc">
        <img src="/static/images/flapjack.png" alt="Confused Flapjack 404" />
        <h1>Page Not Found</h1>
        <p>
          <a href={href}>{linkText}</a>
        </p>
      </section>
    );
  }
}
