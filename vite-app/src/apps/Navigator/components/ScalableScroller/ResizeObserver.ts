function outerDimensions(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const width = Math.ceil(rect.right - rect.left);
    const height = Math.ceil(rect.bottom - rect.top);
    return {
        width,
        height,
    };
}

export default class ResizeObserverWrapper {
    observer: ResizeObserver | FakeResizeObserver;
    constructor(callback: () => void) {
        if (window.ResizeObserver) {
            this.observer = new window.ResizeObserver(callback);
        } else {
            this.observer = new FakeResizeObserver(callback);
        }
    }

    observe(element: HTMLElement) {
        this.observer.observe(element);
    }

    unobserve(element: HTMLElement) {
        this.observer.unobserve(element);
    }
}

class FakeResizeObserver {
    callback: () => void;
    interval: number;
    lastWidth?: number;
    lastHeight?: number;
    observedElement: HTMLElement | null;
    intervalTimer?: number;
    constructor(callback: () => void) {
        this.callback = callback;
        this.interval = 100; // ms
        this.observedElement = null;
    }

    observe(element: HTMLElement) {
        this.observedElement = element;
        this.intervalTimer = window.setInterval(() => {
            const { width, height } = outerDimensions(element);
            if (this.lastWidth !== width || this.lastHeight !== height) {
                try {
                    this.callback();
                } catch (ex) {
                    console.error('Error in callback, stopping observation.');
                    this.unobserve();
                }
            }
        }, this.interval);
    }

    unobserve() {
        if (this.intervalTimer) {
            window.clearTimeout(this.intervalTimer);
        }
        this.observedElement = null;
    }
}
