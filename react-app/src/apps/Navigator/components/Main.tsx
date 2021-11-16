import { Component } from 'react';

// Components
import NarrativeList from './NarrativeList/NarrativeList';
import { AuthInfo } from '../../../contexts/Auth';
import { RuntimeContext } from '../../../contexts/RuntimeContext';
import { NavigatorContext } from '../context/NavigatorContext';
import styles from './Main.module.css';

export interface MainProps {
    authInfo: AuthInfo;
}

// Parent page component for the dashboard page
export default class Main extends Component<MainProps> {
    render() {
        return (
            <section className={styles.Main}>
                <RuntimeContext.Consumer>
                    {(value) => {
                        if (value === null) {
                            return null;
                        }
                        return (
                            <NavigatorContext.Consumer>
                                {(value) => {
                                    if (value === null) {
                                        return null;
                                    }
                                    return (
                                        <NarrativeList
                                            categoryChange={value.setCategory}
                                            queryChange={value.setQuery}
                                            sortChange={value.setSort}
                                            refresh={value.refresh}
                                            searchState={value.searchState}
                                        />
                                    );
                                }}
                            </NavigatorContext.Consumer>
                        );
                    }}
                </RuntimeContext.Consumer>
            </section>
        );
    }
}
