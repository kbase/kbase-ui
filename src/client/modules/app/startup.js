(function (root) {
    function handleStartupError(err) {
        root.KBaseFallback.showError({
            title: 'AMD Error',
            content: [
                'An error has occurred while loading one of the modules required to run the KBase Application.',
                err.message,
                'Type: ' + err.requireType,
                err.requireModules ? 'Modules: ' + err.requireModules.join(', ') : null
            ],
            references: [{
                title: 'Reporting Application Errors',
                url: 'https://www.kbase.us/support'
            }]
        });
        throw err;
    }

    function domEncodedText(rawContent) {
        const donorNode = document.createElement("div");
        donorNode.innerText = rawContent;
        // xss safe
        return donorNode.innerHTML;
    }

    require(['app/main'], (main) => {
        if (root.KBaseFallback.getErrorState()) {
            return;
        }
        main.start()
            .catch((err) => {
                console.error('Startup Error', err);
                root.KBaseFallback.showError({
                    title: 'KBase UI Startup Error',
                    content: [
                        'An error has occurred while starting the KBase UI.',
                        domEncodedText(err.message)
                    ],
                    references: [{
                        title: 'Reporting Errors',
                        url: 'https://www.kbase.us/support'
                    }]
                });
            });
    }, handleStartupError);
}(window));
