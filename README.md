# deploy-to-vercel-action

**Under development**

## Usage

```yml
name: Deploy CI
on:
  release:
    types: [created]
  pull_request:
    types: [opened, synchronize, reopened]
  workflow_dispatch:
jobs:
  vercel:
    name: Deploy to vercel
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy to Vercel Action
        uses: BetaHuhn/deploy-to-vercel-action@master
        with:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```