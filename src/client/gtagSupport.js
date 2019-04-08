/* eslint-disable no-console */
/* eslint-disable strict */
window.onpopstate = function (){
    const str = document.URL.toLowerCase();
    const sliceAt = str.indexOf('kbase.us') + 'kbase.us'.length;
    const path = str.slice(sliceAt);
    const regex = /\/#\/|#\/|\/#/gi;
    const title = path.replace(regex, '');
    console.log('path, title', str, path, title);
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line no-undef
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-137652528-1', {
        'username': "something",
        'Page_location': document.URL,
        'page_path': path,
        'page_title': title
    });
};