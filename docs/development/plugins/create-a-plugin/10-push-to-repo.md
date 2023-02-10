# Step 9. Push to Repo

Finally, we are ready to commit our changes and push them up to GitHub. This is necessary before the plugin can be integrated into kbase-ui, because kbase-ui fetches plugins directly from GitHub (specifically from the release assets.)

The recommended workflow, and the one supported by the GHA workflows, is to use a feature branch which is pushed directly to the plugin repo. A Pull Request is created, which triggers the "build" workflow. The success of this workflow ensures that a build will succeed. When ready, the PR is merged into the "main" branch, and then a release created from main, which builds again and pushes the build product `dist.tgz` to the release assets.

1. Create a branch for this set of changes

    During actual development, you'll probably already be working on a branch. In this tutorial, we haven't created the branch yet, but we will now, before the first commit.

    You may use a different technique (I tend to use the IDE git tools)

    ```shell
    git checkout -b UFI-35
    ```

2. Commit all changes

    ```bash
    git add .
    git commit -m "my great changes"
    ```

3. Push to GitHub

    ```shell
    git push origin UFI-35
    ```

## References

- [abc](abc)

## Next Step

[Step 11. Add to kbase-ui](./10-add-to-kbase)

\---