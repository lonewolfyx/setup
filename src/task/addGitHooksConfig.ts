import type { IConfig } from '../types'
import { readPackageJSON, writePackageJSON } from 'pkg-types'

export async function addGitHooksConfig(config: IConfig): Promise<void> {
    const { cwd, packageJsonPath } = config
    const newPackageJson = await readPackageJSON(cwd)
    newPackageJson.simpleGitHooks = {
        'pre-commit': 'npx lint-staged',
        'commit-msg': 'node scripts/verify-commit.js',
    }
    newPackageJson.lintStaged = {
        '*': 'eslint --fix',
    }

    await writePackageJSON(packageJsonPath, newPackageJson)
}
