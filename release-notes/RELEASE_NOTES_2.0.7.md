# KBase kbase-ui 2.0.7 Release Notes

This is a bugfix release, improving caching behavior under Chrome.

Chrome does not appear to honor http caching within iframes. This is a longstanding issue which has been fixed in other browsers. The only solution appears to be the prevalent usage of a so-called "cache busting" url. This is achieved by appending a query string which is unique between releases (or every time you want the code to be reloaded "for sure").

For releases, the unique string is the git commit hash. For development, the unique string is a timestamp which is generated at load time. The latter is not fully implemented, but can be resolved locally by running a private (incognito) browser session.

## CHANGES

Bug fixes

### NEW

none

### REMOVED

none

### UNRELEASED

none

### IMPROVEMENTS

none

### FIXES

- cache busting improved for plugin loading

## Dependency Changes

none
