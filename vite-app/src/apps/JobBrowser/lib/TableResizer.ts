export interface Options {
    onResize: (rowsPerPage: number) => void;
    wrapperClass: string;
}

const RESIZE_WAIT = 1000;

export default class TableResizer {
    resizing: boolean;
    onResize: (rowsPerPage: number) => void;
    wrapperClass: string;
    constructor({ onResize, wrapperClass }: Options) {
        this.resizing = false;
        this.onResize = onResize;
        this.wrapperClass = wrapperClass;
        this.start();
    }

    start() {
        this.listenForResize();
    }

    resizeListener() {
        if (this.resizing) {
            return;
        }
        this.resizing = true;
        // window.requestAnimationFrame(() => {
        //     this.resizing = false;
        //     this.setRowsPerPage();
        // });

        window.setTimeout(() => {
            this.resizing = false;
            this.setRowsPerPage();
        }, RESIZE_WAIT);
    }

    listenForResize() {
        window.addEventListener('resize', this.resizeListener.bind(this));
    }

    stop() {
        window.removeEventListener('resize', this.resizeListener);
    }


    onNoRows(body: HTMLElement) {
        // need a special hack to keep the no-data display happy.
        body.style.flex = 'none';
    }

    onHasRows(body: HTMLElement) {
        // need a special hack to keep the no-data display happy.
        body.style.flex = '';
    }

    async getRowsPerPage() {
        // a hack for now... 
        // loop until table is rendered the first time... 
        return await new Promise<number>((resolve, reject) => {
            const retries = 20;
            let tries = 0;
            let result: number | undefined;
            // let bodyElement: HTMLElement | undefined;
            // let headerElement: HTMLElement | undefined;
            const loop = () => {
                if (tries > retries) {
                    reject('too many retries');
                    return;
                }
                tries += 1;
                result = fun();
                if (result) {
                    resolve(result);
                    return;
                }
                window.setTimeout(loop, 100);
            };
            const fun = () => {
                const body = document.querySelector(`.${this.wrapperClass} .ant-table-body`);
                if (!body) {
                    return;
                }
                const header = document.querySelector(`.${this.wrapperClass} .ant-table-body .ant-table-thead`);
                if (!header) {
                    return;
                }
                const rows = document.querySelectorAll(`.${this.wrapperClass} .ant-table-body .ant-table-row`);
                if (rows.length === 0) {
                    console.warn('cannot calculate row height -- no rows!');
                    this.onNoRows(body as HTMLElement);
                    return;
                }

                const rowHeight = (rows.item(0) as HTMLElement).offsetHeight;

                const height = (body as HTMLElement).clientHeight - (header as HTMLElement).offsetHeight;
                const rowsPerPage = Math.floor(height / rowHeight);
                return rowsPerPage;
            };
            loop();
        });
    }

    async setRowsPerPage() {
        const rowsPerPage = await this.getRowsPerPage();
        this.onResize(rowsPerPage);
    }
}