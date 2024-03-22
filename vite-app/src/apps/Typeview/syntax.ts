import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';

hljs.registerLanguage('kidl', () => {
    return {
        case_insensitive: false,
        keywords: {
            keyword: 'module typedef funcdef authentication returns',
            builtin: 'string int float UnspecifiedObject list mapping structure tuple'
        },
        contains: [
            hljs.C_BLOCK_COMMENT_MODE
            // hljs.COMMENT(
            //     '/\\*', // begin
            //     '\\*/' // end
            // )
        ]
    };
});


const linkRegex = /#(.+?)\.(.+?)-(.+?)\.(.+?)#/g;

export function replaceMarkedTypeLinksInSpec(specText: string) {
    const hostname = window.location.hostname.split('.').slice(1).join('.');
    const url = new URL(window.location.href);
    url.hostname = hostname;
    return specText.replace(linkRegex, `<a href="${url.origin}/legacy/spec/type/$1.$2-$3.$4" target="_blank">$2</a>`);
}

let lastGeneratedSpecPrefix = 0;

export function generateSpecPrefix() {
    lastGeneratedSpecPrefix += 1;
    return lastGeneratedSpecPrefix;
};

export function highlightKIDL(input: string) {
    return hljs.highlight(input, {language: 'kidl'} );
}

