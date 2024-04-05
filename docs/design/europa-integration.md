# Euoropa Integration of kbase-ui

In 2024 kbase-ui became a client application of the Europa UI. At the same time,
kbase-ui had undergone a slow transformation from an old-school AMD javascript
to a "modern" React / Typescript web app.

The initial Europa integration was based on the old kbase-ui codebase. It basically
worked, but was incomplete and carried several important defects. Soon after this
release, the next release was based on the new kbase-ui codebase, and a refactored
integration.

We'll not discuss the original implementation in detail.

## Overview

The integration itself is based almost purely on "window messages" passed back
and forth between Europa and kbase-ui.

A "window message" is a browser DOM event of type "message" that is only
implemented on windows. A window, in this context, is either the main browser
window or an iframe. In the Europa/kbase-ui integration, Europa is associated
with the main browser window, and, when loaded, kbase-ui is associated with an
iframe window.

We'll discuss the messaging implementation later, but suffice to say for now
that Europa sends messages to kbase-ui on the iframe window, and kbase-ui sends
messages to Europa on the Europa window.

### Invoking a kbase-ui endpoint

The "hash path" form is that used by kbase-ui since it's inception. The
"fragment identifier" component of a url is used by kbase-ui to match a request
path. This fragment identifier may have parameters attached. One example is the
path to a user profile, which looks like `#people/foo`
(`https://ci.kbase.us#people/foo`) to view the profile for user "foo". Another
is a path to the search page with a pre-supplied query: `#data-search$q=coli`
(`https://ci.kbase.us#data-search$q=coli`).

The "legacy path" is a transformation of the hash path. It is a "normal" URL
path, with a common prefix of `/legacy`. The legacy path form of the examples
above are `/legacy/people/foo` and `/legacy/data-search?q=coli`.

### kbase-ui startup

1. kbase-ui is hosted in an iframe within Europa. As such, kbase-ui comes to life
when the iframe is inserted into the DOM with a `src` url pointing to the
kbase-ui deployment location. Eruopa will naturally perform this when it detects
a url destined for kbase-ui, as described above.

    This is **step 1** of the sequence illustrated in [Diagram 1](#diagram01) below.

2. As Europa creates the iframe, it also creates a "timeout monitor". This is a
separate process which, if it reaches the timeout limit (defaults to 60
seconds), will remove the iframe and display an error message.

    Don't worry, the timeout monitor is canceled in step 7, after the
communication handshake is complete.

3. Back to the loading sequence, kbase-ui should have been contacted at the appropriate
   URL, e.g. `https://legacy.ci.kbase.us`, after which the web app will start loading,
   loading it's configuration, and then ...

4. After kbase-ui loads and it's app starts up successfully, it sends a
   `kbase-ui.connect` message to Europa. This message's payload contains a
   unique "connection id". As described in the [window message
   implemenatation](#window-messaging-implementation), this unique channel id
   ensures that the communication between Europa and kbase-ui is private.

5. After receiving `kbase-ui.connect`, Europa will set up it's channel with the channel
   id, do some housekeeping, and send the message `europa.connect`.

6. After receive `europa.connect`, kbase-ui will do some housekeeping, prepare itself
   for operation, and send the message `kbase-ui.connected`.

7. This last message indicates that the connection between Europa and kbase-ui
   has been established. Europa proceeds to stop the timeout monitor it had
   previuosly started.

8. Finally, Europa sends the message `europa.authnavigate`. This message
   contains the KBase Login Token if Europa is authenticated, and the requested
   path and params from the original request (URL).

   This special message allows kbase-ui to both set up it's authentication state
   and then follow this immediately with a navigation to the requested location.

<div id="diagram01" style="font-style: italic;">
Diagram 1: Europa/kbase-ui startup sequence
</div>

![startup sequence](../diagrams/out/europa-startup-sequence.png)

### Login

### Logout

### Navigation

### Authentication Events

## Technical Topics

### URL Formats

### Window Messaging Implementation

Due to the need to run kbase-ui, initially, on a subhost (e.g. legacy.ci.kbase.us),
