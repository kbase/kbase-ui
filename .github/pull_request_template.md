# Pull Request

> Replace quoted instructions with the requested information.
> 
> Leave checkboxes in place, check them off as tasks completed
> 
> (And yes, remove this quote block!)

## Description

> * Summarize the changes.

> * Describe relevant motivation and context.

> * List any dependencies involved in this change.

## Issues Resolved

> * list Jira tickets resolved in this PR
> 
>   e.g.  https://kbase-jira.atlassian.net/browse/PTV-XXX

> * list Github issues resolved by this PR
> 
>   e.g. https://github.com/myrepo/issues/xxx

* [ ] Added the Jira Tickets to the title of the PR e.g. (PTV-XXX fixes a terrible bug)
* [ ] Added the Github Issue to the title of the PR e.g. (PTV-XXX adds an awesome feature)


## Testing Instructions

> Provide details for testing status and how to test the PR:
  
* [ ] Tests pass locally
* [ ] Tests pass in github actions
* [ ] Manually verified that changes area available (by spinning up an instance and navigating to _X_ to see _Y_)

## Dev Checklist

* [ ] Code follows the guidelines at [https://sites.google.com/truss.works/kbasetruss/development](https://sites.google.com/truss.works/kbasetruss/development)
* [ ] I have performed a self-review of my own code
* [ ] I have commented my code, particularly in hard-to-understand areas
* [ ] I have made corresponding changes to the documentation
* [ ] My changes generate no new warnings
* [ ] I have added tests that prove my fix is effective or that my feature works
* [ ] New and existing unit tests pass locally with my changes
* [ ] Integration tests have been run and fully pass (only when preparing a release)
* [ ] I have run run the code quality script against the codebase (also done implicitly during a build)

## Release Notes

* [ ] Ensure there is an "upcoming release notes" file located in release-notes/RELEASE_NOTES_NEXT.md
* [ ] Add relevant notes to this document

## Release

> This section only relevant if this PR is preparing a release

* [ ] Bump version in config/release.yml
* [ ] Rename release-notes/RELEASE_NOTES_NEXT.md to the appropriate release
* [ ] Add release notes document to the release notes index release-notes/index.md