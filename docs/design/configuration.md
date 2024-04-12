# Configuration

> Copied from elsewhere, in progress.

## nginx config

The `nginx` configuration is used to control nginx logging and caching policy
for the kbase-ui web app and its assets.

It is generated from `deployment/templates/nginx.conf.tmpl` and results in an
nginx config file being deposited at `/etc/nginx/nginx.conf` in the image. Yes,
it overwrites the main nginx config file, because nginx needs to do nothing else
than support kbase-ui!

By default kbase-ui is hosted on the root path, which is mapped in the image to
`/kb/deployment/app`. The configuration supports accessing kbase-ui on a path,
but this is not utilized at present. The configuration is a fairly normal one to
support a SPA of this ilk - it resolves to the web app file `index.html` on the
root path, and otherwise attempts to load the requested resource (js, css,
images, html, etc.).

The configuration is also responsible for ensuring that the kbase-ui web app
main file `index.html` is not cached in browser memory. This ensures that a
browser, upon receiving a url to the root url for kbase ui, e.g.
`https://legacy.ci.kbase.us`, will always fetch the file. Without this, there
are strange scenarios in which a browser will utilize a copy of the kbase-ui web
app runtime, leading to consistency and state issues, especially wrt Europa.

## kbase-ui config

The `kbase-ui` configuration is used to supply:

- the base path,
- hostnames for the top level user interface (Europa, Narrative) and services.
- special auth behavior for prod (backup cookie)
- feature switches
