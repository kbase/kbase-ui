define(['preact'], (Preact) => {
    'use strict';

    const { h } = Preact;

    class TokenStuffer extends Preact.Component {
        constructor(params) {
            super(params);

            this.inputRef = Preact.createRef();
        }

        doStuffToken() {
            const token = this.inputRef.current.value;
            console.log('stuffing', token);
            document.cookie = `kbase_session=${token}; path=/`;
        }

        render() {
            return h(
                'div',
                null,
                h('span', null, 'Token:'),
                h('input', { ref: this.inputRef, style: { width: '20em' } }),
                h(
                    'button',
                    {
                        onClick: () => {
                            this.doStuffToken();
                        }
                    },
                    'Assign Token'
                )
            );
        }
    }

    return TokenStuffer;
});
