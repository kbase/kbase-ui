export enum AsyncProcessStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface AsyncProcessBase {
  status: AsyncProcessStatus;
}

export interface AsyncProcessNone extends AsyncProcessBase {
  status: AsyncProcessStatus.NONE;
}

export interface AsyncProcessPending extends AsyncProcessBase {
  status: AsyncProcessStatus.PENDING;
}

export interface AsyncProcessError extends AsyncProcessBase {
  status: AsyncProcessStatus.ERROR;
  message: string;
}

export interface AsyncProcessSuccess<T> extends AsyncProcessBase {
  status: AsyncProcessStatus.SUCCESS;
  value: T;
}

export type AsyncProcess<T> =
  | AsyncProcessNone
  | AsyncProcessPending
  | AsyncProcessError
  | AsyncProcessSuccess<T>;
