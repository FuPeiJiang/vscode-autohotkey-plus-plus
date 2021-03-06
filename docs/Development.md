# Development

This document covers the development process, from writing code to publishing a new version.

1. Write the code on the `dev` branch, or offshoots of that branch. Merge the changes to the `dev` branch as they become stable.
1. Once the `dev` branch has all the features for a new release, create a new release branch named `v-<major>.<minor>.<patch>` (e.g. `v-2.5.10`).
1. Push the changes, open a PR, review the changes, and merge to `master`.
    1. Confirm the package version has been updated
    1. Confirm the changelog has been updated
1. Pull the new master branch
1. Package the new release using `vsce package`.
1. Publish the release through [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage/publishers/mark-wiemer)

    1. Select the ellipsis `Actions` icon and select `Update`.
    1. Upload the `.vsix` release file packaged in a previous step.

    > The release is usually available within 5 minutes of uploading.
