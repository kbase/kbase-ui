import { JSONObject } from "./json";

export enum UIErrorCode {

}


export interface UIError {
    code: number;
    message: string;
    data?: JSONObject;
}