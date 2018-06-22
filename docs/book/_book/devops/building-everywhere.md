_kbase-ui_ is built not just on your local development workstation, but int the following places:

- in Travis CI, as part of the github workflow
- in the KBase Jenkins instance, as part of the CI deployment
- in a KBase VM (??) as part of the next/appdev/production deployment process

As such, we need to ensure that each part of the build toolchain is consistent in each environment. Thus, even though a different version of the above tools may work for you (and of course no-one is watching you to make sure you aren't!) please be advised that it is possible that you can introduce dependencies upon a version of a tool which will break in one of the other KBase build environments.


### nodejs

Node and npm are used together to build _kbase-ui_ and to run tests. Node and npm change _very_ frequently, and the number of transitive dependencies involved in the build and test toolchain number in the _thousands_. Therefore, we must always be cautious when making changes to both the toolchain and dependencies. On the other hand, they are only used for building and testing _kbase-ui_, and not the runtime operation.
