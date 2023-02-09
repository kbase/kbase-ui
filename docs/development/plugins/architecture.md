# Plugin Architecture

The essence of a kbase-plugin is a "Single Page App" (SPA) web app which adheres to a simple Post-Message based api and protocol.

Post-Message is a simple message-based communication mechanism built into all modern web browsers. It allows messages (Javascript data) to be sent and received by any Javascript code in any window currently running in the browser.

It implements some basic security measures to help prevent scripts from targeting unrelated windows. In addition to this, we implement our own measures which make the messaging both more secure and programmatically safer.

## Window Channel

To facilitate this, kbase-ui and plugins use a library class named `WindowChannel`. A `WindowChannel` allows messages to be sent and received between a pair of windows. Each window needs to have a complementary `WindowChannel` instance in order to exchange messages. We call the instance a "channel".

A key concept of channels is the *channel id*. A channel id is a uuid assigned to each parter in a channel. By only accepting messages targeting its id, that id being essentially impossible to guess (via uuid characteristics), and by carefully providing this channel id to the partner channel, we can establish a relatively safe and secure relationship between two windows.

## Plugin Runtime Lifecycle

There are many plugins in kbase-ui, some very old, some quite new. Not all of them are designed in a manner enabling tight integration with kbase-ui. A tight integration has not proven to be necessary, either. So, overall, the integration between kbase-ui and plugins is rather simple.

### Navigation

kbase-ui uses `hashchange`-style navigation. That is, paths within kbase-ui are implemented with a url style like:

```text
https://ci.kbase.us#search
```

where `search` is the path into kbase-ui. The hash (octothorp) `#` prefixes the kbase-ui path. This is known as a URL "fragment" in URL terminology, and as the "hash" in the DOM API. The URL fragment is recognized by the browser in which the URL resides, but is not sent to the server when requesting the URL. Thus, when kbase-ui is initially loaded at `https://ci.kbase.us` the server provides the kbase-ui "boot" page, but ignores the `#search`. kbase-ui itself, when initially started, looks for the hash to determine what to do and show. Subsequently, kbase-ui listens for the `hashchange` event in order to determine what to do and show next.

(Well, that is basically how a SPA works, although modern SPAs use normal URL paths.)

Let us just call the hash the navigation path, because that is how kbase-ui sees it.

kbase-ui uses a bespoke routing API. kbase-ui registers "handlers" for navigation paths. Upon needing to handle a navigation path (either at first startup or when a hashchange event is detected), it searches the router for a handler. If a handler is found, it is invoked; if not, a "page not found" faux 404 page is displayed.

Some handlers provide functionality defined internally by kbase-ui. Examples include the about pages, a primitive developer tool, and an experimental dashboard. By design, however, most of what one would think of as the functional components, like landing pages, search, orgs, feeds, and so forth, are provided through plugins.

When a navigation path corresponds to a plugin, a single entrypoint is invoked, the Plugin Wrapper. This wrapper is the beginning of the plugin lifecycle.

### Starting Plugin



### The Handshake

[ to do ]

### Navigating Away

[ to do ]

The basic plugin loading protocol:

kbase-ui (host) establishes a channel.
host creates an iframe with the host channel id embedded in it
the iframe also has a second uuid, the plugin channel id, embedded
the iframe loads the plugin web app
the plugin creates its own channel using the id embedded in the iframe
the plugin sends a 'ready' message to the host
the host sends the 'start' message to the plugin, with essential information including configuration, authentication, and navigation.
the plugin validates and accepts this information, and sends a 'started' message
the plugin loads the requested view
the plugin sends a 'set-title' message to cause the host (kbase-ui) to display the provided text in the page header and browser title.

at this point, the plugin is running.

there are a handful of other protocols:

navigation for the plugin

navigation for the host

navigation with authentication for the host

authentication change for the plugin

logged out for the plugin

logged in for the plugin
