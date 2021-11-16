import { Component } from 'react';
import { Nav } from 'react-bootstrap';

export interface CategoryMenuProps {
    onChange: (category: string) => void;
    category?: string;
}

interface CategoryMenuState {}

export default class CategoryMenu extends Component<
    CategoryMenuProps,
    CategoryMenuState
> {
    render() {
        return (
            <Nav
                variant="pills"
                defaultActiveKey={this.props.category || 'own'}
                onSelect={(eventKey: string | null) => {
                    switch (eventKey) {
                        case 'own':
                            this.props.onChange('own');
                            break;
                        case 'shared':
                            this.props.onChange('shared');
                            break;
                        case 'tutorials':
                            this.props.onChange('tutorials');
                            break;
                        case 'public':
                            this.props.onChange('public');
                            break;
                        default:
                    }
                }}
            >
                <Nav.Item>
                    <Nav.Link as="button" eventKey="own" title="My Narratives">
                        My Narratives
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as="button"
                        eventKey="shared"
                        title="Shared With Me"
                    >
                        Shared With Me
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as="button"
                        eventKey="tutorials"
                        title="Tutorials"
                    >
                        Tutorials
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as="button" eventKey="public" title="Public">
                        Public
                    </Nav.Link>
                </Nav.Item>

                {/* <div>
                                <a
                                    className="btn btn-primary narrative-new"
                                    href="/#narrativemanager/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className="mr1 fa fa-plus"></i> New
                                    Narrative
                                </a>
                            </div> */}
            </Nav>
        );
    }
}
