import Well from "components/Well";
import { Account } from "lib/kb_lib/Auth2";
import { Component } from "react";
import AccountEditor from "./AccountEditor/view";
import AccountInfo from "./AccountInfo/view";
import { AccountEditorFields } from "./controller";

export interface AccountEditorViewProps {
    account: Account;
    fields: AccountEditorFields;
    save: (fields: AccountEditorFields) => Promise<void>;
}

interface AccountEditorViewState {
}

export default class AccountEditorView extends Component<AccountEditorViewProps, AccountEditorViewState> {
    renderAccountEditor() {
        return <AccountEditor
            fields={this.props.fields}
            save={this.props.save}
        />
    }

    renderAccountInfo() {
        return <AccountInfo account={this.props.account} />
    }

    render() {
        return <div>
            <Well variant="secondary" className="mb-4">
                <Well.Header>
                    Edit Account
                </Well.Header>
                <Well.Body>
                    {this.renderAccountEditor()}
                </Well.Body>
            </Well>
            <Well variant="secondary">
                <Well.Header>
                    Account Info
                </Well.Header>
                <Well.Body>
                    {this.renderAccountInfo()}
                </Well.Body>
            </Well>
        </div>
    }
}
