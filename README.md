# preload-local-actions for GitHub Actions

# About

This action will preload selected repositories into your workspace at one time. As GitHub has not provided a way to
expose actions exclusively to a private organization, the workflow using the private actions must currently preload any
private action before using it.

# Usage

### Preloading Actions to Use

The example will load the contents of a private repo into your workspace. Since they cannot be preloaded by GitHub when
your workflow starts (due to being in private or internal repositories) you will need to manually load them into working
folders.

```yaml
name: preload-local-actions

on:
    push:
        branches:
            - main
            - master
    pull_request:
        types: [opened, synchronize, reopened]

jobs:
    example-job:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2 # Checks out your repository, which should be done first

            - name: preload-local-actions
              uses: AmericanAirlines/preload-local-actions@v1.0.5 # be sure to use the latest release
              with:
                  repository: |
                      ownerOrOrg/repo_for_action1@v1.3.5
                      ownerOrOrg/repo_for_action2@v1.0.9
                  token: ${{ secrets.MY_READONLY_PAT }} # must have permissions to read all repositories

            - name: additional steps will use the loaded actions as needed from their
```

Note that the action requires use of a secret (here `MY_READONLY_PAT`). For security purposes, it is important that you
only use a read-only access token because it has only repository read permissions for the private GitHub organization.
Since it is a Personal Access Token, it is important that it does not have any other permissions or scopes attached to
it.

Please use the latest release tag according to the repository. The `ref` option above is only an example (it is most
recent as of the last update to this document) and may not always be up to date.

### Using the Preloaded Actions

You will then use a step like this to run one of the two actions (as preloaded in the above example)

```yaml
      - name: step to do the action loaded from a private or internal repo
          uses: ./.github/actions/repo_for_action1  # the last part matches the name of the repo preloaded
          with:
            version: 'v1'  # these are the inputs for the action to use (just as any action)
```

In the preloading step above, the preload action loads two private or internal actions. You will need a step like the
one above for every use of either action.

## Inputs

| Name       |  Type  | Required                           | Description                                                                                                                       |
| ---------- | :----: | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| repository | String | true                               | Single string with org/repo@version OR multi-line yaml string with one such string per line (e.g. `ownerOrOrg/action_repo@1.0.0`) |
| token      | String | true                               | GitHub token with permission to read all specified repos                                                                          |
| path       | String | false (default: `.github/actions`) | Path to folder under which copies of all repositories will be loaded                                                              |

## Outputs

This action has no output.

## Use Cases

Here are some of the use cases on how to use this action.

### Use Case 1

Load a couple of actions to be used in the following steps. Specify multiple repos in a multi-line yaml string. Token
must be supplied that can read ALL the actions' repos.

The action loads each repo into a subfolder of the default location: `.github/actions`. That subfolder will be named
using the name of the repository itself.

```yaml
- name: preload-local-actions ## Executes preload-local-actions
  uses: ./.github/actions/preload-local-actions
  with:
      repository: |
          ownerOrOrg/repo_for_action1@v1.3.5
          ornderOrOrg/repo_for_action2@v1.0.9
      token: ${{ secrets.MY_READONLY_PAT }}
```

### Use Case 2

Load one action to be used in the following steps. Specify single repos in a standard yaml string. Token must be
supplied that can read the action's repo.

```yaml
- name: preload-local-actions ## Executes preload-local-actions
  uses: ./.github/actions/preload-local-actions
  with:
      repository: 'ownerOrOrg/repo_for_action1@v1.3.5'
      token: ${{ secrets.MY_READONLY_PAT }}
```

### Use Case 3

Load some actions to be used in the following steps specifying a specific folder to receive the loaded repo contents. As
usual, specify multiple repos in a multi-line yaml string. Token must be supplied that can read ALL the actions' repos.

The action loads each repo into a subfolder of the specified path. That subfolder will be named using the name of the
repository itself.

```yaml
- name: preload-local-actions ## Executes preload-local-actions
  uses: ./.github/actions/preload-local-actions
  with:
      repository: |
          ownerOrOrg/repo_for_action1@v1.3.5
          ownerOrOrg/repo_for_action2@v1.0.9
      token: ${{ secrets.MY_READONLY_PAT }}
      path: './.github/special_action_repos'
```

# Tests

`.github/workflows/test.yml` in this repo will run test cases to verify the health of this action.

`.github/workflows/build-test-lint.yml` in this repo will use yarn to install, lint, test and build the typescript.

# Local Development

## Dependencies

Before getting started, make sure to install [`Node`](https://nodejs.org/en/download/) and then install [`yarn`](https://classic.yarnpkg.com/en/docs/install).

Next, install the app's dependencies by running `yarn install`. To build the app, simply run `yarn build`.

# Contributing

Interested in contributing to the project?  Check out our [Contributing Guidelines](./.github/CONTRIBUTING.md).
