import type { IConfig } from '../types'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const workflows: Array<{ filename: string, content: string }> = [
    {
        filename: 'autofix.yml',
        content: `name: autofix.ci

on:
  pull_request:
permissions:
  contents: write

jobs:
  autofix:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v7

      - name: Use Node.js lts/*
        uses: actions/setup-node@v6
        with:
          node-version: lts/*

      - name: Install pnpm
        uses: pnpm/action-setup@v6

      - name: Install
        run: pnpm i

      - name: Lint
        run: pnpm run lint:fix

      - uses: autofix-ci/action@635ffb0c9798bd160680f18fd73371e355b85f27
`,
    },
    {
        filename: 'ci.yml',
        content: `name: CI

on:
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - name: Install pnpm
        uses: pnpm/action-setup@v6

      - name: Set node
        uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: pnpm

      - name: Install
        run: pnpm i

      - name: Lint
        run: pnpm run lint
`,
    },
    {
        filename: 'pr-contributor-welcome.yml',
        content: `name: PullRequest Contributor Welcome

on:
  pull_request_target:
    types:
      - closed
#    paths:
#      - 'components/**'

permissions:
  contents: read

jobs:
  comment:
    permissions:
      issues: write # for actions-cool/maintain-one-comment to modify or create issue comments
      pull-requests: write # for actions-cool/maintain-one-comment to modify or create PR comments
    if: github.event.pull_request.merged == true && github.repository == 'lonewolfyx/xxxx'
    runs-on: ubuntu-latest
    steps:
      - name: get commit count
        id: get_commit_count
        run: |
          PR_AUTHOR=$(echo "\${{ github.event.pull_request.user.login }}")
          RESULT_DATA=$(curl -s "https://api.github.com/repos/\${{ github.repository }}/commits?author=\${PR_AUTHOR}&per_page=5")
          DATA_LENGTH=$(echo \$RESULT_DATA | jq 'if type == "array" then length else 0 end')
          echo "COUNT=\$DATA_LENGTH" >> \$GITHUB_OUTPUT
      - name: Comment on PR
        if: steps.get_commit_count.outputs.COUNT < 3
        uses: actions-cool/maintain-one-comment-backup@fbbc22ad1809c1bcf46f19b58397b6254773588c
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: |
            🎉 Thx for the PR @\${{ github.event.pull_request.user.login }}

            <!-- WELCOME_CONTRIBUTION -->
          body-include: <!-- WELCOME_CONTRIBUTION -->
`,
    },
    {
        filename: 'release.yml',
        content: `name: Release

permissions:
  contents: write

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v6
        with:
          node-version: lts/*

      - run: npx genereleaselog
        env:
          GITHUB_TOKEN: \${{secrets.GITHUB_TOKEN}}
`,
    },
]

export async function createGithubWorkflows(config: IConfig): Promise<void> {
    const workflowsDir = path.join(config.cwd, '.github', 'workflows')
    await mkdir(workflowsDir, { recursive: true })

    for (const { filename, content } of workflows) {
        const filePath = path.join(workflowsDir, filename)
        await writeFile(filePath, content)
    }
}
