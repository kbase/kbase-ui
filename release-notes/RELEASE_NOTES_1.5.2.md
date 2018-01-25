# KBase kbase-ui 1.5.2 Release Notes

Add jobbrowser; hide jgi search

## CHANGES

### FIXES

- Add the job browser to the production build
  https://github.com/kbase/kbase-ui/commit/55476dfe2429dcef6b3dab69b73a34232feaff1a
- Hide jgi search from the menu; the path #jgi-search is still active. This is proposed as a new strategy for soft-releasing new features. The soft-release allows us to sync up back-end services properly before it is exposed to users. When the new feature is functioning correctly, we can expose it in the menu and issue a small release.
  https://github.com/kbase/kbase-ui/commit/5f5176a031f35f90b568b02e98a7deb961c6745d