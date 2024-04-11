# Deploy to Vercel Action

## @mountainash fork use

Until this fork is merged into the main repo, you can use the following to get the latest changes:

```yml
uses: mountainash/fork-deploy-to-vercel-action@develop
OR
uses: mountainash/fork-deploy-to-vercel-action@65a8b653a66a8ad5b0abd59d47589aef4c111806
```

## @mountainash fork changes

- [x] FEATURE ✨ Added `--archive=tgz` arg to Vercel deploy when using `PREBUILT` option to allow built deployments over 1500 files
- [x] Added [defaults](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions?learn=create_actions&learnProduct=actions#inputsinput_iddefault)
- [x] Added GitHub Actions workflow to test the action
- [x] `GITHUB_REPOSITORY` is no longer a required input (it can be deduced using the `GITHUB_TOKEN`)
- [x] Allow Vercel domain aliases to be set on PRs
- [x] Using `@actions/exec` instead of spawn = require('child_process') for better OS portability
- [x] Fix: EditorConfig conflicted with Eslint rules
- [x] Using npx to run Vercel CLI to avoid version missmatches (as seen in #374, #367, #226)
- [x] FEATURE ✨ Add a Workflow Summary to each run
- [x] Exporting `VERCEL_PREVIEW_URL` and `VERCEL_DEPLOYMENT_UNIQUE_URL` for use in other job steps
- [x] Using @actions/core to correctly get boolean and multilined inputs
- [x] Removed default "deploy" label from PRs
- [x] More emojis in logs 📝
- [x] Better accessability formatting for comment table
- [ ] FEATURE ✨ Build within action (not just PREBUILT)
- [x] FEATURE ✨ Transfer runtime secrets/envars from GHAction to Vercel Settings

- See [CHANGELOG](./CHANGELOG.md) for many 📦 dependencies updates (inc. Node 20) and bug fixes

---

⚠️ This is a fork of "deploy-to-vercel-action" is under heavy development - use with care.

If you'd like to try it, please use the `develop` branch or the latest SHA, eg:

```yml
uses: mountainash/fork-deploy-to-vercel-action@develop

## OR

uses: mountainash/fork-deploy-to-vercel-action@e9eb65d39e2d13257f5d5613e771ba2da8357dd9
```

---

<div align="center">

[![Node CI](https://github.com/mountainash/fork-deploy-to-vercel-action/workflows/Node%20CI/badge.svg)](https://github.com/mountainash/fork-deploy-to-vercel-action/actions?query=workflow%3A%22Node+CI%22) [![Release CI](https://github.com/mountainash/fork-deploy-to-vercel-action/workflows/Release%20CI/badge.svg)](https://github.com/mountainash/fork-deploy-to-vercel-action/actions?query=workflow%3A%22Release+CI%22) [![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/mountainash/fork-deploy-to-vercel-action/blob/master/LICENSE)

Deploy your project to Vercel using GitHub Actions. Supports PR previews and GitHub deployments.

![pr-comment-screenshot](https://user-images.githubusercontent.com/51766171/111844410-4aeec000-8903-11eb-9e2d-f84c8c89b039.png)

</div>

## 👋 Introduction

[deploy-to-vercel-action](https://github.com/mountainash/fork-deploy-to-vercel-action) uses GitHub Actions to deploy your project/site to [Vercel](https://vercel.com). It offers more customization than Vercel's GitHub integration in terms of when to deploy your site. Using GitHub Actions [Events](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) you can choose to deploy every commit, only on new releases or even on a cron schedule. The Action can also deploy every PR and comment on it with a custom preview URL. It uses the Vercel CLI and can automatically create a Deployment on GitHub as well.

## 🚀 Features

- Use GitHub Actions events to control when to deploy to Vercel
- Automatically deploy every pull request
- Comment on pull requests with a preview link
- Create a deployment on GitHub
- Assign custom dynamic domains to each deployment or pr
- Can deploy Dependabot PRs and optionally even PRs made from forks

## 📚 Usage

Before you can start using the Action, you have to setup a few Action inputs. Refer to the [configuration](#%EF%B8%8F-configuration) section below for more info.

Then create a `.yml` file in your `.github/workflows` folder (you can find more info about the structure in the [GitHub Docs](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions)) and add the following:

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  push:
    branches: [master]
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Versioning

To always use the latest version of the Action add the `latest` tag to the action name like this:

```yml
uses: mountainash/fork-deploy-to-vercel-action@latest
```

If you want to make sure that your Workflow doesn't suddenly break when a new major version is released, use the `v1` tag instead (recommended usage):

```yml
uses: mountainash/fork-deploy-to-vercel-action@develop
```

With the `v1` tag you will always get the latest non-breaking version which will include potential bug fixes in the future. If you use a specific version, make sure to regularly check if a new version is available, or enable Dependabot.

## ⚙️ Action Inputs

Here are all the inputs [deploy-to-vercel-action](https://github.com/mountainash/fork-deploy-to-vercel-action) takes:

| Key | Value | Required | Default |
| ------------- | ------------- | ------------- | ------------- |
| `GITHUB_TOKEN` | GitHub Token to use when creating deployment and comment (more info [below](#tokens)) | **Yes** | N/A |
| `VERCEL_TOKEN` | Vercel Token to use with the Vercel CLI (more info [below](#tokens)) | **Yes** | N/A |
| `VERCEL_ORG_ID` | Id of your Vercel Organisation (more info [below](#vercel-project)) | **Yes** | N/A |
| `VERCEL_PROJECT_ID` | Id of your Vercel project (more info [below](#vercel-project)) | **Yes** | N/A |
| `GITHUB_DEPLOYMENT` | Create a deployment on GitHub | **No** | true |
| `GITHUB_DEPLOYMENT_ENV` | Custom environment for the GitHub deployment | **No** | `Production` or `Preview` |
| `PRODUCTION` | Create a production deployment on Vercel and GitHub | **No** | true (false for PR deployments) |
| `DELETE_EXISTING_COMMENT` | Delete existing PR comment when redeploying PR | **No** | true |
| `CREATE_COMMENT` | Create PR comment when deploying | **No** | true |
| `ATTACH_COMMIT_METADATA` | Attach metadata about the commit to the Vercel deployment | **No** | true |
| `TRIM_COMMIT_MESSAGE` | When passing meta data to Vercel deployment, trim the commit message to subject only | **No** | false |
| `DEPLOY_PR_FROM_FORK` | Allow PRs which originate from a fork to be deployed (more info [below](#deploying-a-pr-made-from-a-fork-or-dependabot)) | **No** | false |
| `PR_LABELS` | Labels which will be added to the pull request once deployed. Set it to false to turn off | **No** | `deployed` |
| `ALIAS_DOMAINS` | Alias domain(s) to assign to the deployment (more info [below](#custom-domains)) | **No** | N/A |
| `PR_PREVIEW_DOMAIN` | Custom preview domain for PRs (more info [below](#custom-domains)) | **No** | N/A |
| `VERCEL_SCOPE` | Execute commands from a different Vercel team or user | **No** | N/A |
| `BUILD_ENV` | Provide environment variables to the build step | **No** | N/A |
| `RUNTIME_ENV` | 🆕 Push environment variables to the Vercel deployment environment (more info [below](#runtime-envvars)) | **No** | N/A |
| `WORKING_DIRECTORY` | Working directory for the Vercel CLI | **No** | N/A |
| `FORCE` | Used to skip the build cache | **No** | false |
| `PREBUILT` | Deploy a prebuilt Vercel Project | **No** | false |

## 🛠️ Configuration

In order for the Action to interact with GitHub and Vercel on your behalf, you have to specify your GitHub and Vercel Access Tokens as well as your Vercel Organization and Project Id.

### Tokens

You can generate your GitHub Personal Access token [here](https://github.com/settings/tokens) and your Vercel Token [here](https://vercel.com/account/tokens) and then specify them as `GITHUB_TOKEN` and `VERCEL_TOKEN` in the Actions inputs.

> **Note:** It is recommended to set the tokens as [Repository Secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

### Vercel Project

Before you can start using this Action you have to link your project with [Vercel](https://vercel.com/download) locally.

Run the command `vercel` inside your projects root and follow the steps described by the [Vercel CLI](https://vercel.com/docs/cli).

Once set up, a new `.vercel` directory will be added to your directory. The `.vercel/project.json` file contains both the organization (`orgId`) and project (`projectId`) id of your project.

You can then specify them as `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in the Actions inputs.

> **Note:** It is recommended to set them as [Repository Secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

### Custom Domains

Instead of using the auto generated domain (`name-randomString.vercel.app`) for each deployment, you can specify custom domains. Use the `ALIAS_DOMAINS` input and separate each domain on a new line like this:

```yml
ALIAS_DOMAINS: |
  example.com
  example.vercel.app
```

#### Pro Teams
If your team is set up to `Pro`, remember to set the `VERCEL_SCOPE` to the slug of your team.

```yml
with:
  VERCEL_SCOPE: 'your-team-slug'
```

Otherwise, the action will fail trying to deploy custom domains with default account credentials. It will result in request for authorisation and action fail.
Even if you extend the scope of `VERCEL_TOKEN` to `All non-SAML Team`, without properly set up `VERCEL_SCOPE` the cli will use default account and fail.

> **Note:** You can use `*.vercel.app` or `*.now.sh` without configuration, but any other custom domain needs to be configured in the Vercel Dashboard first

You can also use any of the following variables anywhere in the domain:

- `{USER}` - the owner of the repository the action was executed in
- `{REPO}` - the name of the repository the action was executed in
- `{BRANCH}` - the branch in which the action was triggered
- `{SHA}` - the most recent commit's sha
- `{PR}` - the number of the pr the action was triggered from

Examples:

```yml
ALIAS_DOMAINS: |
  {BRANCH}.example.com
  {USER}-{REPO}-{SHA}.vercel.app
```

This is especially useful if you want to change the PR preview domain with the `PR_PREVIEW_DOMAIN` input:

```yml
PR_PREVIEW_DOMAIN: "{REPO}-{PR}.vercel.app"
```

> **Note:** You can only specify one custom domain for `PR_PREVIEW_DOMAIN`

### Runtime EnvVars

> **Note:** 🆕 This feature is still in development and may not work as expected!

You can set environment variables in the Vercel deployment environment using the `RUNTIME_ENV` array input. This is useful for environment variables that are needed by Severless & Edge functions, or other runtime variables.

**WARNING:** Variables are set on Vercel in plain text, so be careful with sensitive data.

**WARNING:** Existing variable values will be overwritten without warning.

**TIP:** (for Next.js) You can see what your project needs by by running `vercel build` and then searching the file contents of `.next/` directory for the `process.env` use.

```yml
RUNTIME_ENV: |
  CMS_API_KEY=${{ vars.CMS_API_KEY }}
  CMS_API_TOKEN=${{ secrets.CMS_API_KEY }}
  CMS_API_URL=https://api.example.com
```

Environment variables will be set to the Vercel Preview environment, unless `PRODUCTION` is set to `true`. `GITHUB_DEPLOYMENT_ENV` will also be respected if set.

### Deploying a PR made from a fork or Dependabot

By default this action will not deploy a PR if it originates from a fork (this is also the default behaviour of [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github?query=git#deployment-authorizations-for-forks)).

If you want to deploy a PR made from a fork, you have to set `DEPLOY_PR_FROM_FORK` to true and make sure to use the `pull_request_target` event instead of the `pull_request` event, as GitHub doesn't pass any secrets to workflows triggered by `pull_request` on forks (more info in GitHub's [docs](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull-request-events-for-forked-repositories)).

You also have to manually checkout the PR branch, as `pull_request_target` runs in the context of the base of the pull request, rather than in the merge commit.

Here's a complete workflow as an example:

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  push:
    branches: [master]
  pull_request_target:
    types: [opened, synchronize, reopened]
jobs:
  vercel:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - id: script
        uses: actions/github-script@v7
        with:
          script: |
            const isPr = [ 'pull_request', 'pull_request_target' ].includes(context.eventName)
            core.setOutput('ref', isPr ? context.payload.pull_request.head.ref : context.ref)
            core.setOutput('repo', isPr ? context.payload.pull_request.head.repo.full_name : context.repo.full_name)

      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ steps.script.outputs.ref }}
          repository: ${{ steps.script.outputs.repo }}

      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          DEPLOY_PR_FROM_FORK: true # This has some serious security risks you need be aware of
```

> **Note:** Since the first of March 2021 workflow runs which are triggered by a Dependabot PR will act as if they are made from a fork and have the same limitations described above (more info in [GitHub's Changelog](https://github.blog/changelog/2021-02-19-github-actions-workflows-triggered-by-dependabot-prs-will-run-with-read-only-permissions/)), except that DEPLOY_PR_FROM_FORK doesn't have to be set to true.

## 📖 Examples

Here are a few examples to help you get started!

### Basic Example

The workflow below will run on every push to master and every time a new PR is created or an existing PR changed. [deploy-to-vercel-action](https://github.com/mountainash/fork-deploy-to-vercel-action) will deploy the master branch to your Vercel production environment and comment on every PR with a preview link to the deployed PR.

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  push:
    branches: [master]
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Don't deploy to production

The workflow below will run on every push to the staging branch. The Action will then deploy it to the preview environment on Vercel.

**`.github/workflows/deploy.yml`**

```yml
name: Deploy staging CI
on:
  push:
    branches: [ staging ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          PRODUCTION: false # Don't deploy to production environment
```

### Deploy on release

The workflow below will only run after a new release is created on GitHub.

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  release:
    types: [created]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Assign alias domains

If you want, [deploy-to-vercel-action](https://github.com/mountainash/fork-deploy-to-vercel-action) can assign multiple domains to each deployment and also change the PR preview domain:

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  push:
    branches: [master]
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          ALIAS_DOMAINS: |
            example.com
            {BRANCH}.example.com
          PR_PREVIEW_DOMAIN: "{REPO}-{PR}.now.sh"
```

### Wait for other CI jobs

The workflow below will wait until your other CI jobs are completed until it will deploy your project to Vercel.

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  push:
    branches: [master]
jobs:
  build:
    # Your build job (can be anything you want)
    # ...
  lint:
    # Your lint job (can be anything you want)
    # ...
  deploy:
    needs: [build, lint] # wait for other jobs
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Deploy without creating pull request comment

The workflow below will not automatically create a PR comment. This is useful for example when your PR can trigger multiple deployments (think monorepo for example) and you want to take control over PR comment creation by yourself. You can use output produced by this action to build comment by yourself.

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  push:
    branches: [master]
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Vercel Action
        id: vercel-deploy
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          CREATE_COMMENT: false
      - uses: phulsechinmay/rewritable-pr-comment@v0.3.0
        if: ${{ steps.vercel-deploy.outputs.DEPLOYMENT_CREATED }}
        with:
          message: |
            This pull request has been deployed to Vercel.

            <table>
              <tr>
                <th>👀 Preview:</th>
                <td><a href='${{ steps.vercel-deploy.outputs.PREVIEW_URL }}'>${{ steps.vercel-deploy.outputs.PREVIEW_URL }}</a></td>
              </tr>
              <tr>
                <th>📝 Deployment Details:</th>
                <td><a href='${ steps.vercel-deploy.outputs.DEPLOYMENT_INSPECTOR_URL }'>${ steps.vercel-deploy.outputs.DEPLOYMENT_INSPECTOR_URL }</a></td>
              </tr>
            </table>

            [View Workflow Logs](${ LOG_URL })
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          COMMENT_IDENTIFIER: 'vercel-deploy'
```

### Deploy on schedule

The workflow below will run at the given interval and deploy your project to Vercel.

> Note: You can use any other action to change your project or run your own script before deploying those changes to Vercel

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  schedule:
    - cron:  '0 8 * * 1' # will run every Monday at 8 am
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # maybe do something else first
      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Deploy Dependabot PRs

As described in the [Deploying a PR made from a fork or Dependabot](#deploying-a-pr-made-from-a-fork-or-dependabot) section, Pull Requests created by Dependabot behave as if they where created from a fork and thus the Workflow triggered by the `pull_request` event doesn't have access to any secrets.

To overcome this limitation you can use the `pull_request_target` event and checkout the PR branch manually

> Note: By default this action doesn't deploy any forks so you can use `pull_request_target` without any security concerns

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  push:
    branches: [master]
  pull_request_target:
    types: [opened, synchronize, reopened]
jobs:
  vercel:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - id: script
        uses: actions/github-script@v7
        with:
          script: |
            const isPr = [ 'pull_request', 'pull_request_target' ].includes(context.eventName)
            core.setOutput('ref', isPr ? context.payload.pull_request.head.ref : context.ref)
            core.setOutput('repo', isPr ? context.payload.pull_request.head.repo.full_name : context.repo.full_name)

      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ steps.script.outputs.ref }}
          repository: ${{ steps.script.outputs.repo }}

      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Pass environment variables to the build

You can define the build environment variables when using the action:

**`.github/workflows/deploy.yml`**

```yml
name: Deploy CI
on:
  push:
    branches: [master]
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Vercel Action
        uses: mountainash/fork-deploy-to-vercel-action@develop
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          BUILD_ENV: |
            FOO="bar"
            SOME_TOKEN="${{ secrets.SOME_TOKEN }}"
```

If you have an idea for another use case, [create a discussion](https://github.com/BetaHuhn/deploy-to-vercel-action/discussions/new?category=show-and-tell) and maybe I will add it here!

## 💻 Development

Issues and PRs are very welcome!

The actual source code of this Action is in the `src` folder.

- run `yarn lint` or `npm run lint` to run eslint.
- run `yarn start` or `npm run start` to run the Action locally.
- run `yarn build` or `npm run build` to produce a production version of [deploy-to-vercel-action](https://github.com/mountainash/fork-deploy-to-vercel-action) in the `dist` folder.

Pass in inputs as environment variables with the prefix `INPUT_` (e.g. `INPUT_GITHUB_TOKEN`) & `RUNNING_LOCAL=true`.

<!-- Minimal Example: `RUNNING_LOCAL=true INPUT_GITHUB_TOKEN=$INPUT_GITHUB_TOKEN INPUT_VERCEL_TOKEN=$INPUT_VERCEL_TOKEN INPUT_VERCEL_ORG_ID=$INPUT_VERCEL_ORG_ID INPUT_VERCEL_PROJECT_ID=$INPUT_VERCEL_PROJECT_ID GITHUB_REPOSITORY="mountainash/fork-deploy-to-vercel-action" INPUT_PREBUILT="false" INPUT_PRODUCTION="false" INPUT_GITHUB_DEPLOYMENT="false" INPUT_CREATE_COMMENT="false" INPUT_DELETE_EXISTING_COMMENT="false" INPUT_ATTACH_COMMIT_METADATA="false" INPUT_DEPLOY_PR_FROM_FORK="false" INPUT_TRIM_COMMIT_MESSAGE="false" INPUT_FORCE="false" npm run start` -->

## ❔ About

This project was developed by me ([@betahuhn](https://github.com/BetaHuhn)) and upgraded and extended by [@mountainash](https://github.com/mountainash) in my free time. If you want to support me: [![Donate via PayPal](https://img.shields.io/badge/paypal-donate-009cde.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=394RTSBEEEFEE) [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F81S2RK)

If you want to support @mountainash [![Sponsor via GitHub](https://img.shields.io/badge/sponsor-via%20github-94a1f2.svg)](https://github.com/sponsors/mountainash)

**[deploy-to-vercel-action](https://github.com/mountainash/fork-deploy-to-vercel-action) is in no way affiliated with Vercel.**

## 📄 License

Copyright 2021 Maximilian Schiller

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
