# Token Web App Export / Import

A recent change added a tool for copying a token from one web app to another. A sender view (auth2/dev/sendToken) on web app A can send a token to web app B at the receiving view (auth2/dev/receiveToken).

To get started, you need to visit the view by modifying the "hashpath".

For instance, if you are on the production site on the Dashboard view:

```https://narrative.kbase.us#dashboard```

You would replace "dashboard" with "auth2/dev/sendToken"

```https://narrative.kbase.us#auth2/dev/sendToken```

Restrictions are in place to limit the token transfer to pre-configured deployment environments. The only officially supported enviroments are sending tokens from production to appdev.

However, configurations are in place for bidirectional transfer for ci/cialt and next/nextalt. These configurations allow testing the mechanism in ci and next, using an "alt" web app installed locally (there are no web apps at cialt.kbase.us or nextalt.kbase.us).

## Alternative Approaches

The initial motivation for the mechanism was to allow two or more web app hosts to operate against the same auth2 service. Since auth2 does not support multiple client hosts for certain operations (e.g. redirection), we were faced with either updating auth2 to support this, or to automate the injection of a token cookie into the web app on appdev.kbase.us.

The manual fix is to simply set the kbase_session cookie in the browser via the javascript console. It 

The most expeditious solution seemed to be to provide a tool to take the token the prod web app and place it into the appdev web app. That is what is described herein.

## How it Works

It is very simple, actually, but requires quite a bit of machinery surrounding it to work smoothly.



## Future

### should be restricted to users who have a specific role

This would allow us to provide the tool only to authorized users. More broadly, we could then provide developer tools as part of the UI without exposing them to ordinary users.

### hopefully it can be obviate in the future with changes to auth2