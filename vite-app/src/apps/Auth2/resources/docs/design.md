# Auth2 Javascript Client Design Ideas

## Lifecycle

client created

client queries auth2 service for session state
  - for now we need to extract the cookie manually and send that,


so - to extract cookie or not - three ideas:

1. for now - the cookie set by auth2, and read by the client. the client needs to know the cookie name, read it, and extract the token (the only value), to use with the api (e.g. introspection)

pros:
- the way it works now
- api usage same as non-browser clients

cons:
- requires client and auth service to be on same host (e.g. via proxy) and path (/).
- requires client to know the session cookie name (configuration sync)

2. the auth2 service sets and reads the cookie, the client doesn't touch it. The cookie would be implicitly sent in all communication with the service. This simplifies the client, configuration (cookie name), and is symmetric (auth2 sets and reads the same cookie)

pros:
- cookie known only to auth service
- client does not need to be configured with cookie name
- client code is simpler
- client and auth server may be on different hosts
- in fact, by allowing the cookie be on a different host and/or path the cookie is protected from accidental meddling by the client

cons:
- api usage is different than non-browser apps which need to use token explicitly

3. the auth2 service provides and receives the token via an api argument, and the client manages cookies. This has the advantage that the client is in control of the client environment, and the disadvantage of the same (duplication of the more complex client code across environments.)

pros:
- client environment controlled by client
- client api same across all environments

cons:
- token must be exposed in redirect response
  (on the other hand, token is always exposed via the browser developer tools anyway)
- client coding more complex 
  (but this is the way we already do it)

More detail 

1. cookie set by auth2, read by client

- user requests client resource with browser
- client starts
- client reads session cookie by known name
- client asks auth2 service via api call for token info (aka "introspection")
- auth2 service may return either token error or token info
- token error is same as no token for this logic
- if token is required (none or error) send browser to login page
- on login page user selects auth provider and continues
- ... skip this part in which the user authenticates ...
- browser is redirected back to client either to one of:
  1. requested url with token
  2. auth canceled page
  3. more info needed page
- 1) successful case
  - start back at top


2. auth2 service sets and gets cookie, client session interaction solely through api

- user requests client resource with browser
- client starts
- client makes api call to auth2 service
- 