import { Component, createRef, PropsWithChildren, RefObject } from 'react';
import styles from './ScrollingArea.module.css';

export interface ScrollingAreaProps extends PropsWithChildren {}

const SCROLL_BUFFER_DURATION: number = 100;

interface ScrollingAreaState {
    ready: boolean;
    fromTop: number;
    fromBottom: number;
    scrollOverflow: number;
}
export default class ScrollingArea extends Component<ScrollingAreaProps, ScrollingAreaState> {
    ref: RefObject<HTMLDivElement>;
    scrollBufferTimer: number | null = null;
    constructor(props: ScrollingAreaProps) {
        super(props);
        this.ref = createRef();
        this.state = {
            ready: false,
            fromTop: 0,
            fromBottom: 0,
            scrollOverflow: 0,
        };
    }
    componentDidMount() {
        this.calcScroll();
    }

    handleScroll() {
        if (this.scrollBufferTimer) {
            return;
        }
        this.scrollBufferTimer = window.setTimeout(() => {
            this.calcScroll();
            this.scrollBufferTimer = null;
        }, SCROLL_BUFFER_DURATION);
    }

    calcScroll() {
        const el = this.ref.current;
        if (el === null) {
            return;
        }
        // The fromTop and fromBottom measures are used to fade the
        // shading at the top and bottom, based on the scroll distance
        // to top or bottom as a proportion of the scroll height....

        const scrollOverflow = el.scrollHeight - el.offsetHeight;

        const maxOpacity = 1;

        const fromTop = (maxOpacity * el.scrollTop) / scrollOverflow;

        const fromBottom = (maxOpacity * (scrollOverflow - el.scrollTop)) / scrollOverflow;

        this.setState({
            ready: true,
            fromTop,
            fromBottom,
            scrollOverflow,
        });
    }
    render() {
        return (
            <div className={styles.container}>
                <div
                    className={styles.overlay}
                    style={{
                        background: `linear-gradient(to top, rgba(200, 200, 200, ${this.state.fromBottom}), transparent 40px, transparent), linear-gradient(to bottom, rgba(200, 200, 200, ${this.state.fromTop}), transparent 40px, transparent)`,
                    }}
                ></div>
                <div
                    ref={this.ref}
                    className={styles.scrollArea}
                    onScroll={(ev) => {
                        this.handleScroll();
                    }}
                >
                    {this.props.children}
                </div>
            </div>
        );
    }
}
