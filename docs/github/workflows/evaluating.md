# testing on a fork

This document describes a techniques for verifying that GHA workflows work as designed. The core of this technique is to use a fork of `kbase/kbase-ui` to interact with GitHub in a manner which triggers the workflows to run.

If there are any mistakes in these steps (or GH makes changes to the interface), or you simply want to improve formatting or add images, please feel free to update this doc.

## Set up fork

1. Fork repo `https://github.com/kbase/kbase-ui`.
2. Create a Personal Access Token (PAT)
   1. Under your user menu (upper right corner of the page)
      1. Select **Settings** from the dropdown menu
      2. Select **Developer settings** from the vertical menu on the left; it is at the bottom.
      3. Select **Personal access tokens** from the vertical menu on the left.
      4. Click the **Generate new token** located to the right of "Personal access tokens".
   2. You may be asked to log in again, or confirm your password.
   3. Under **Note** give it a description
   4. For **Expiration**, you can leave as default 30 days
   5. For scopes, select **write:packages**, which will also select other scopes by default
   6. Click the **Generate token** at the bottom of the page
   7. The new token will be displayed, with a small button displayed to the right of it
    ![copy button](./images/copy-token.png)
   8. Click the copy button to copy the token to the clipboard
3. Next we add "secrets" for the actions to utilize
   1. You may find it reassuring to open a new browser window to the repo, just so you don't lose the copied token
   2. Click the repo settings button (looks like a gear)
    ![repo settings button](./images/repo-settings.png)
   3. In the vertical menu on the left, select **Secrets**
   4. Select **Actions** from the menu that drops down
   5. Create the token secret:
      1. Click the **New repository secret** button
      2. For **Name:** enter `GHCR_TOKEN`
      3. For **Value:** paste the token copied above
   6. Create the username secret:
      1. Click the **New repository secret** button
      2. For **Name:** enter enter `GHCR_USERNAME`
      3. For **Value:** enter your username (the account that owns the fork)


## Pull Request workflow (to develop branch)

For a PR to develop, we expect tests to run, without building an image.

1. Create a branch locally and then push it up to your fork.

2. switch to the branch in the GitHub ui for your fork

3. Click the **Contribute** dropdown, then click the **Open Pull Request** button.
    
    ![disabled button](./images/enabled-button.png)

   1. If the branch also exists in the origin repo, you may need to push a small commit to the branch in the fork; this will jiggle the GitHub web ui to allow you to create a Pull Request.
   
   ![disabled button](./images/disabled-button.png)

4. The **base repository** will default to the upstream kbase repo

    ![base repository kbase](./images/base-repository-kbase.png)

5. Switch the base repository to the fork

    ![base repository fork](./images/base-repository-fork.png)

6. Finally, switch the branch to develop

    ![base repository develop](./images/base-repository-develop.png)

7. Create the test PR by clicking the **Create pull request** button

8. Visit the Actions tab

9. You should find that there is one action running, which will be labeled with the PR title

10. If you click on the workflow, you'll be taken to the workflow details page. There you should see that there is one job running, labeled "test/run-tests":

    ![pr workflow running job](./images/job-running.png)

11. Note that only the testing workflow is running.

12. When the workflow is finished successfully, the job status indicator will turn green:

    ![pr workflow completed job](./images/job-finished.png)


## Merge PR workflow (to develop branch)

After merging a PR into develop, we expect tests to run and for an image to be built and pushed. 

1. From the forked repo home page, select the **Pull requests** tab

2. Click the title of the PR

3. Click the **Merge pull request** button

4. Click the **Confirm merge** button

5. Click the **Actions** tab

6. You should see the workflow running

7. If you click on the workflow, you'll be taken to the workflow details page. There you should see that there are two jobs "tests/run-tests" and "build-push/build-push-image". Initially the test job is running:

    ![pr close and merge tests running](./images/workflow-test-job-running.png)

    After a few minutes, the build-push job will run:

    ![pr close and merge build-push running](./images/workflow-build-push-job-running.png)

    Finally, both jobs will be completed:

    ![pr close and merge finished](./images/workflow-jobs-finished.png)

8. It takes about 7 minutes to run the tests and the build

9. When the action is finished, you should find the image stored in GHCR:
   1. Go to the forked repo home page
   2. On the right-hand side click **Packages**
   3. Under the **Visibility:** dropdown, select **Private**
      1. Since this is a fork, the packages are considered "private"
      2. You should see "kbase-ui" listed under the packages
   4. Under **Recent tagged image versions** you should see that the most recent image is tagged `develop`


## Pull Request workflow (from `develop` to `main` (or legacy `master`) branch) 

For a PR from develop to `main` (or legacy `master`), we expect tests to run, without building an image.

1. switch to the **develop** branch in the GitHub ui for your fork

2. Click the **Contribute** dropdown, then click the **Open Pull Request** button.
    
    ![disabled button](./images/enabled-button.png)

5. The **base repository** will default to the upstream kbase repo

    ![base repository kbase](./images/base-repository-kbase.png)

6. Switch the base repository to the fork

    ![base repository fork](./images/base-repository-fork.png)

7. Finally, switch the branch to develop

    ![base repository main](./images/base-repository-main.png)

8. Create the test PR by clicking the **Create pull request** button

9. Visit the Actions tab

10. You should find that there is one action running, which will be labeled with the PR title

11. If you click on the workflow, you'll be taken to the workflow details page. There you should see that there is one job running, labeled "test/run-tests":

    ![pr workflow running job](./images/job-running.png)

12. Note that only the testing workflow is running.

13. When the workflow is finished successfully, the job status indicator will turn green:

    ![pr workflow completed job](./images/job-finished.png)


## Merge PR (to `main` (or legacy `master`) branch) workflow

After merging a PR from `develop` to `main` (or legacy `master`), we expect tests to run and for an image to be built and pushed. 

1. From the forked repo home page, select the **Pull requests** tab

2. Click the title of the PR

3. Click the **Merge pull request** button

4. Click the **Confirm merge** button

5. Click the **Actions** tab

6. You should see the workflow running

7. If you click on the workflow, you'll be taken to the workflow details page. There you should see that there are two jobs "tests/run-tests" and "build-push/build-push-image". Initially the test job is running:

    ![pr close and merge tests running](./images/workflow-test-job-running.png)

    After a few minutes, the build-push job will run:

    ![pr close and merge build-push running](./images/workflow-build-push-job-running.png)

    Finally, both jobs will be completed:

    ![pr close and merge finished](./images/workflow-jobs-finished.png)

8. It takes about 7 minutes to run the tests and the build

9. When the action is finished, you should find the image stored in GHCR:
   1. Go to the forked repo home page
   2. On the right-hand side click **Packages**
   3. Under the **Visibility:** dropdown, select **Private**
      1. Since this is a fork, the packages are considered "private"
      2. You should see "kbase-ui" listed under the packages
   4. Under **Recent tagged image versions** you should see that the most recent image is tagged `pr#`, where `#` is the pull request number.

## Release workflow

1. From the forked repo home page, select the **master** branch

2. On the right-hand side of the page click **Releases**

3. From the Releases page click the button **Draft a new release**

4. Click the dropdown **Choose a tag**

5. In the **Find or create a new tag** input area enter "v1.2.3" or some other example release tag, and press the **Enter/Return** key (or click the **+ Create new tag:** button)

6. In the **Release title** input area enter anything, e.g. "Release version 1.2.3"; content is arbitrary.

7. Click the green **Publish release** button

8. Check the Actions tab, there should be a workflow run labeled "Release version 1.2.3" (or whatever you titled it)

9. If you click on the workflow, you'll be taken to the workflow details page. There you should see that there are two jobs "tests/run-tests" and "build-push/build-push-image". Initially the test job is running:

    ![pr close and merge tests running](./images/workflow-test-job-running.png)

    After a few minutes, the build-push job will run:

    ![pr close and merge build-push running](./images/workflow-build-push-job-running.png)

    Finally, both jobs will be completed:

    ![pr close and merge finished](./images/workflow-jobs-finished.png)

10. When the action is finished, you should find the image stored in GHCR:
    1. Go to the fork repo home page
    2. On the right-hand side click "Packages"
    3. Under the Visibility: dropdown, select Private
       1. Since this is a fork, the packages are considered "private"
       2. You should see "kbase-ui" listed under the packages
    4. Under "recent tagged image versions" you should see the most recent image is tagged `v1.2.3` (or whateve you tagged the release)

## Manual workflow run

1. In your local repo, create a branch and push it to the fork
   1. The branch can be named anything, in this example it is "feature-SAM-238"
   2. You can of course use existing branches `develop` or `main` (or legacy `master`)
   
2. Visit the forked repo

3. Visit the **Actions** tab

4. Select the workflow named **Manual - Test, Build & Push Image**

5. To the right you should see a blue box with a "Run workflow" dropdown:
    ![Workflow Dispatch panel](./images/workflow-dispatch.png)

6. In the **Branch:** dropdown, select the branch you created and pushed:
    ![Branch dropdown](./images/branch-dropdown.png)

7. Click the **Run workflow** button

8. You should find that there is one action running, whose name is the branch name

    ![manual action running](./images/manual-action-running.png)

10. If you click on the workflow, you'll be taken to the workflow details page. There you should see that there are two jobs "tests/run-tests" and "build-push/build-push-image". Initially the test job is running:

     ![pr close and merge tests running](./images/workflow-test-job-running.png)

     After a few minutes, the build-push job will run:

     ![pr close and merge build-push running](./images/workflow-build-push-job-running.png)

     Finally, both jobs will be completed:

     ![pr close and merge finished](./images/workflow-jobs-finished.png)
   
11. When the action is finished, you should find the image stored in GHCR:
    1. Go to the fork repo home page
    2. On the right-hand side click **Packages**
    3. Under the **Visibility:** dropdown, select **Private**
       1. Since this is a fork, the packages are considered "private"
       2. You should see "kbase-ui" listed under the packages
    4. Under **Recent tagged image versions** you should see a tag that is the same as the branch name


