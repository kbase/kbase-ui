import { Button } from "antd";
import { Component } from "react";

export interface CheckUsernameFieldProps {
    disabled: boolean;
    value?: CheckState;
    username?: string;
    onChange?: (newValue: string) => void; // (event: ChangeEvent<HTMLInputElement>) => void
    checkUsername: (username: string) => Promise<string|null>
}

export type CheckState = "na" | "required" | "available" | "unavailable";

interface CheckUsernameFieldState {

}

export default class CheckUsernameField extends Component<CheckUsernameFieldProps, CheckUsernameFieldState> {
    renderStatus() {
        switch (this.props.value) {
            case "na":
                return "";
            case "required":
                return <span>Please check if this username is available</span>
            case "available":
                return <span className="text-success">Username <b>{this.props.username}</b> available for you to use</span>
            case "unavailable":
                return <span>Username <b>{this.props.username}</b> is not available</span>
        }
    }


    render() {
        return <div>
            {/* <input onChange={this.props.onChange} value={this.props.value} /> */}

            <Button  
                disabled={this.props.disabled} 
                onClick={async () => { 
                    if (this.props.username) {
                        const errorMessage = await this.props.checkUsername(this.props.username);
                        if (errorMessage) {
                            this.props.onChange!("unavailable");
                        } else {
                            this.props.onChange!("available");
                        }
                    }
                    
                    // if (this.props.onChange) {
                    //     if (this.props.username === "foo") {
                    //         this.props.onChange("unavailable");
                    //     } else {
                    //         this.props.onChange("available");
                    //     }
                    // }
                }}>Check</Button>
                {' '}
                {this.renderStatus()}
        </div>
    }
}