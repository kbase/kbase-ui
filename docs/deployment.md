# Deployment

[in progress]


## Testing a tag locally

This is necessary for local next/appdev/prod testing since the build will fail if there is no tag on the current commit.

```
git tag -a v1.5.0 -m "1.5.0"
```

after additional commits you'll need to delete the tag and the add it again

```
git tag -d v1.5.0
```
