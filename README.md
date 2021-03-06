<div align="center">
  
# Deploy to Vercel Action

[![Node CI](https://github.com/BetaHuhn/deploy-to-vercel-action/workflows/Node%20CI/badge.svg)](https://github.com/BetaHuhn/deploy-to-vercel-action/actions?query=workflow%3A%22Node+CI%22) [![Release CI](https://github.com/BetaHuhn/deploy-to-vercel-action/workflows/Release%20CI/badge.svg)](https://github.com/BetaHuhn/deploy-to-vercel-action/actions?query=workflow%3A%22Release+CI%22) [![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/BetaHuhn/deploy-to-vercel-action/blob/master/LICENSE) ![David](https://img.shields.io/david/betahuhn/deploy-to-vercel-action)

Deploy your project to Vercel using GitHub Actions. Supports PR previews and GitHub deployments.

</div>

## 👋 Introduction

[deploy-to-vercel-action](https://github.com/BetaHuhn/deploy-to-vercel-action) uses GitHub Actions to deploy your project/site to [Vercel](https://vercel.com). It offers more customization than Vercel's GitHub integration in terms of when to deploy your site. Using GitHub Actions [Events](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) you can choose to deploy every commit, only on new releases or even on a cron schedule. The Action can also deploy every PR and comment on it with a custom preview url. It uses the Vercel CLI and can automatically create a Deployment on GitHub as well.

## 🚀 Features

- Use GitHub Actions Events to control when to deploy to Vercel
- Automatically deploy every Pull Request
- Comment on Pull Requests with a preview link
- Create a deployment on GitHub
- Assign custom dynamic domains to each deployment or Pull Request

## 📚 Usage

Before you can start using the Action, you have to setup a few Action inputs. Refer to the [configuration](#%EF%B8%8F-configuration) section below for more info.

Then create a `.yml` file in your `.github/workflows` folder (you can find more info about the structure in the [GitHub Docs](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions)) and add the following:

**.github/workflows/deploy.yml**

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
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy to Vercel Action
        uses: BetaHuhn/deploy-to-vercel-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Versioning

To always use the latest version of the Action add the `latest` tag to the action name like this:

```yml
uses: BetaHuhn/deploy-to-vercel-action@latest
```

If you want to make sure that your Workflow doesn't suddenly break when a new major version is released, use the `v1` tag instead (recommended usage):

```yml
uses: BetaHuhn/deploy-to-vercel-action@v1
```

With the `v1` tag you will always get the latest non-breaking version which will include potential bug fixes in the future. If you use a specific version, make sure to regularly check if a new version is available, or enable Dependabot.

## ⚙️ Action Inputs

Here are all the inputs [deploy-to-vercel-action](https://github.com/BetaHuhn/deploy-to-vercel-action) takes:

| Key | Value | Required | Default |
| ------------- | ------------- | ------------- | ------------- |
| `GITHUB_TOKEN` | GitHub Token to use when creating deployment and comment (more info [below](#tokens)) | **Yes** | N/A |
| `VERCEL_TOKEN` | Vercel Token to use with the Vercel CLI (more info [below](#tokens)) | **Yes** | N/A |
| `VERCEL_ORG_ID` | Id of your Vercel Organisation (more info [below](#vercel-project)) | **Yes** | N/A |
| `VERCEL_PROJECT_ID` | Id of your Vercel project (more info [below](#vercel-project)) | **Yes** | N/A |
| `GITHUB_DEPLOYMENT` | Create a deployment on GitHub | **No** | true |
| `PRODUCTION` | Create a production deployment (has no impact on PR deployments) | **No** | true |
| `DELETE_EXISTING_COMMENT` | Delete existing PR comment when redeploying PR | **No** | true |
| `PR_LABELS` | Labels which will be added to the pull request once deployed. Set it to false to turn off | **No** | deployed |
| `ALIAS_DOMAINS` | Alias domain(s) to assign to the deployment (more info [below](#custom-domains)) | **No** | N/A |
| `PR_PREVIEW_DOMAIN` | Custom preview domain for PRs (more info [below](#custom-domains)) | **No** | N/A |
| `VERCEL_SCOPE` | Execute commands from a different Vercel team or user | **No** | N/A |

## 🛠️ Configuration

In order for the Action to interact with GitHub and Vercel on your behalf, you have to specify your GitHub and Vercel Access Tokens as well as your Vercel Organisation and Project Id.

### Tokens

You can generate your GitHub Personal Access token [here](https://github.com/settings/tokens) and your Vercel Token [here](https://vercel.com/account/tokens) and then specify them as `GITHUB_TOKEN` and `VERCEL_TOKEN` in the Actions inputs.

> **Note:** It is recommneded to set the tokens as [Repository Secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

### Vercel Project

Before you can start using this Action you have to link your project with [Vercel](https://vercel.com/download) locally.

Run the command `vercel` inside your projects root and follow the steps described by the [Vercel CLI](https://vercel.com/docs/cli).

Once set up, a new `.vercel` directory will be added to your directory. The `.vercel/project.json` file contains both the organization (`orgId`) and project (`projectId`) id of your project.

You can then specify them as `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in the Actions inputs.

> **Note:** It is recommneded to set them as [Repository Secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

### Custom Domains

Instead of using the auto generated domain (`name-randomString.vercel.app`) for each deployment, you can specify custom domains. Use the `ALIAS_DOMAINS` input and seperate each domain on a new line like this:

```yml
ALIAS_DOMAINS: |
  example.com
  example.now.sh
```

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
  {USER}-{REPO}-{SHA}.now.sh
```

This is especially useful if you want to change the PR preview domain with the `PR_PREVIEW_DOMAIN` input:

```yml
PR_PREVIEW_DOMAIN: "{REPO}-{PR}.now.sh"
```

> **Note:** You can only specify one custom domain for `PR_PREVIEW_DOMAIN` 

## 📖 Examples

Here are a few examples to help you get started!

### Basic Example

The workflow below will run on every push to master and everytime a new PR is created or an existing PR changed. [deploy-to-vercel-action](https://github.com/BetaHuhn/deploy-to-vercel-action) will deploy the master branch to your Vercel production environment and comment on every PR with a preview link to the deployed PR.

**.github/workflows/deploy.yml**

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
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy to Vercel Action
        uses: BetaHuhn/deploy-to-vercel-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Don't deploy to production

The workflow below will run on every push to the staging branch. The Action will then deploy it to the preview environment on Vercel.

**.github/workflows/deploy.yml**

```yml
name: Deploy staging CI
on:
  push:
    branches: [ staging ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy to Vercel Action
        uses: BetaHuhn/deploy-to-vercel-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          PRODUCTION: false # Don't deploy to production environment
```

### Deploy on release

The workflow below will only run after a new release is created on GitHub.

**.github/workflows/deploy.yml**

```yml
name: Deploy CI
on:
  release:
    types: [created]
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy to Vercel Action
        uses: BetaHuhn/deploy-to-vercel-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Assign alias domains

If you want, [deploy-to-vercel-action](https://github.com/BetaHuhn/deploy-to-vercel-action) can assign multiple domains to each deployment and also change the PR preview domain:

**.github/workflows/deploy.yml**

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
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy to Vercel Action
        uses: BetaHuhn/deploy-to-vercel-action@v1
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

**.github/workflows/deploy.yml**

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
        uses: actions/checkout@v2
      - name: Deploy to Vercel Action
        uses: BetaHuhn/deploy-to-vercel-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Deploy on schedule

The workflow below will run at the given interval and deploy your project to Vercel.

> Note: You can use any other action to change your project or run your own script before deploying those changes to Vercel

**.github/workflows/deploy.yml**

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
        uses: actions/checkout@v2
      # maybe do something else first
      - name: Deploy to Vercel Action
        uses: BetaHuhn/deploy-to-vercel-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

If you have an idea for another usecase, [create a discussion](https://github.com/BetaHuhn/deploy-to-vercel-action/discussions/new?category=show-and-tell) and maybe I will add it here!

## 💻 Development

Issues and PRs are very welcome!

The actual source code of this Action is in the `src` folder.

- run `yarn lint` or `npm run lint` to run eslint.
- run `yarn start` or `npm run start` to run the Action locally.
- run `yarn build` or `npm run build` to produce a production version of [deploy-to-vercel-action](https://github.com/BetaHuhn/deploy-to-vercel-action) in the `dist` folder.

## ❔ About

This project was developed by me ([@betahuhn](https://github.com/BetaHuhn)) in my free time. If you want to support me:

[![Donate via PayPal](https://img.shields.io/badge/paypal-donate-009cde.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=394RTSBEEEFEE)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F81S2RK)

**[deploy-to-vercel-action](https://github.com/BetaHuhn/deploy-to-vercel-action) is in no way affiliated with Vercel.**

## 📄 License

Copyright 2021 Maximilian Schiller

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
