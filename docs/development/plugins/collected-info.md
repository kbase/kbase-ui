## Plugins

Now to explain plugins again.

The new CRA-TS kbase-ui build still supports plugins.

The essence of a kbase-plugin is a SPA web app which adheres to a simple Post-Message based api and protocol.

Post-Message is a simple message-based communication mechanism built into all modern web browsers. It allows messages (static Javascript data) to be sent and received by any Javascript code in any window currently running in the browser.

It implements some basic security measures to help prevent scripts from targeting unrelated windows. In addition to this, we implement our own measures which make the messaging both more secure and programmatically safer.

To facilitate this, kbase-ui and plugins use a library class named WindowChannel. The WindowChannel allows messages to be sent and received between a pair of windows. Each window needs to have a complementary WindowChannel instance in order to exchange messages. We call the instance a "channel".

A key concept of channels is the "channel id". A channel id is a uuid assigned to each unique channel. By only accepting messages targeting its id, that id begin essentially impossible to guess (via uuid characteristics), and by carefully providing this channel id to the partner channel, we can establish a relatively safe and secure relationship between two windows.

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


