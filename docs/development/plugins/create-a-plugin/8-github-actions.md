# Step 8. GitHub Actions

The actual packaging up of the plugin for usage by kbase-ui is conducted at GitHub through GitHub Action Workflows.

There are two, as you'll see. One to conduct the build and packaging for Pull Requests, and one to conduct the build, packaging, and release when a release is created.

We'll be adding these files:

```text
.github
  workflows
    build-dist.yml
    build-release.yml
```

1. Create the github directory

    ```shell
    mkdir -pr .github/workflows
    ```

2. Add the PR build workflow file `.github/workflows/build.yml`

    ```yaml
    name: Plugin build and create dist in PR against main
    on:
    pull_request:
        branches:
        - main
        types:
        - opened
        - reopened
        - synchronize
    jobs:
    build-dist:
        runs-on: ubuntu-latest
        steps:
        - name: Check out GitHub Repo
            uses: actions/checkout@v2

        - name: Build the plugin dist
            run: ./build.sh
    ```

3. Add the release workflow file `.github/workflows/build-release.yml`

    ```yaml
    name: Plugin build and create dist upon release
    on:
    release:
        branches: 
        -main
        types: [published]
    jobs:
    build-dist:
        runs-on: ubuntu-latest
        steps:
        - name: Check out GitHub Repo
            uses: actions/checkout@v2

        - name: Build the plugin dist
            run: ./build.sh

        - name: Upload dist to release
            uses: alexellis/upload-assets@0.4.0
            env:
            # GITHUB_TOKEN: ${{ secrets.KBASE_BOT_TOKEN }}
            GITHUB_TOKEN: ${{ github.token }}
            with:
            asset_paths: '["dist.tgz"]'
    ```


## References

- [abc](abc)

## Next Step

[Step 9. Push to Repo](./9-push-to-repo)

\---
