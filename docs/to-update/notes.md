# Notes

History, release, and general status.

## 12/18/15
As we are preparing this for CI, there is still much to do. This week focusing on the build process. It may seem trivial, since it is "just" an SPA, which is "just" files after all. However, there is an evolving release build process, and the task of a build process which is friendly for both deployment, testing, kbase-ui developers, and plugin developers. 

So, for instance, whenever there is kbase dependency, we need to enable a process for local development as well as normal bower-controlled package installation.

At the moment, the supported make tasks are:

- make build
- make dist
- make start
- make stop
- make preview

Up shortly (have been working, but need to catch up to recent changes):

- make clean
- make test
- make deploy

And what we've never had:

- make release

---

Just pushed up v0.1.0 to account eapearson. Need just a tad more work before we review this. 
Specifically, no matter the state, I want the README.md and docs/*.md to reflect the current state. To that end, I'm going to make sure README.md and docs/building.md are up to snuff and work 100%, and move the rest of the docs into a holding directory until they can be updated.

And the instructions must be fully implemented! They are mostly there, just a few rough edgets.

Other nice-to-haves for basic usability:

- flesh out dev setup and teardown
- make clean, make test, make deploy
- first pass at release: release.js, make release, release branch, release tagging