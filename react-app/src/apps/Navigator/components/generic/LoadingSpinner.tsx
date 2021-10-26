import React from 'react';

interface Props {
  loading: boolean;
  message?: string;
}

export function LoadingSpinner(props: Props) {
  if (!props.loading) {
    return <></>;
  }

  return (
    <p className="black-60 mt3">
      <i className="fa fa-gear fa-spin"></i> {props.message || 'Loading...'}
    </p>
  );
}
