function outerDimensions(el: Element) {
    const rect = el.getBoundingClientRect();
    const width = Math.ceil(rect.right - rect.left);
    const height = Math.ceil(rect.bottom - rect.top);
    return {
        width,
        height,
    };
}

export default class KBResizeObserver {
    observer: ResizeObserver;
    constructor(callback: () => void) {
        if (window.ResizeObserver) {
            this.observer = new window.ResizeObserver(callback);
        } else {
            this.observer = new FakeResizeObserver(callback);
        }
    }

    observe(element: Element) {
        this.observer.observe(element);
    }

    unobserve(element: Element) {
        this.observer.unobserve(element);
    }
}

// TODO: should observe multiple elements.
class FakeResizeObserver {
    callback: () => void;
    observedElement: Element | null;
    intervalTimer?: number;
    interval: number;
    lastWidth?: number;
    lastHeight?: number;
    constructor(callback: () => void) {
        this.callback = callback;
        this.interval = 100; // ms
        this.observedElement = null;
        // this.lastWidth;
        // this.lastHeight;
    }

    observe(element: Element) {
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

    disconnect() {
        this.unobserve();
    }
}
