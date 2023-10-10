import { RouteProps } from "components/Router2";
import { AuthenticationState } from "contexts/Auth";
import { Component } from "react";
import Nav from "react-bootstrap/esm/Nav";
import { Config } from "types/config";
import AlertMessageGallery from "./AlertMessageGallery";
import EmptyGallery from "./EmptyGallery";
import styles from './index.module.css';

export interface GalleryProps extends RouteProps {
    authState: AuthenticationState;
    config: Config;
    setTitle: (title: string) => void;
}

export default class Gallery extends Component<GalleryProps> {
    componentDidMount() {
        this.props.setTitle('Component Gallery');
    }

    renderHome() {
        return <div>
            <p>Welcome to the Gallery.</p>
        </div>
    }

    renderAlertMessage() {
        return <AlertMessageGallery />
    }

    renderEmpty() {
        return <EmptyGallery />
    }

    renderBody() {
        switch (this.props.params.get('name') || 'home') {
            case 'home':
                return this.renderHome();
            case 'alertmessage':
                return this.renderAlertMessage();
            case 'empty':
                return this.renderEmpty()
        }
    }

    render() {
        return <div className={styles.main}>
            <div className={styles.sidebar}>
                <Nav defaultActiveKey={this.props.params.get('name') || 'home'} className="flex-column" variant="pills">
                    <Nav.Item>
                        <Nav.Link eventKey="home" href="/#gallery/home">Home</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="alertmessage" href="/#gallery/alertmessage">AlertMessage</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="empty" href="/#gallery/empty">Empty</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
            <div className={styles.body}>
                {this.renderBody()}
            </div>
        </div>
    }
}
