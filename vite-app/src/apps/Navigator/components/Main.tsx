import { Component } from 'react';

// Components
import { AuthInfo, EuropaContext } from 'contexts/EuropaContext';
import { NavigatorContext } from '../context/NavigatorContext';
import styles from './Main.module.css';
import NarrativeList from './NarrativeList/NarrativeList';

export interface MainProps {
    authInfo: AuthInfo;
}

// Parent page component for the dashboard page
export default class Main extends Component<MainProps> {
    render() {
        return (
            <section className={styles.Main}>
                <EuropaContext.Consumer>
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
                                            emptyMessage='No Narratives found'
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
                </EuropaContext.Consumer>
            </section>
        );
    }
}
