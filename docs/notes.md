# Notes

History, release, and general status.

## 12/18/15
As we are reparing this for CI, there is still much to do. This week focusing on the build process. It may seem trivial, since it is "just" an SPA, which is "just" files after all. However, there is an evolving release build process, and the task of a build process which is friendly for both deployment, testing, kbase-ui developers, and plugin developers. 

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