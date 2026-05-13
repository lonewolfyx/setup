import type { IConfig } from '../types'
import { readPackageJSON, writePackageJSON } from 'pkg-types'

export async function addGitHooksConfig(config: IConfig): Promise<void> {
    const { cwd, packageJsonPath } = config
    const newPackageJson = await readPackageJSON(cwd)
    newPackageJson.simpleGitHooks = {
        'pre-commit': 'npx nano-staged',
        'commit-msg': 'node scripts/verify-commit.js',
    }
    newPackageJson['nano-staged'] = {
        '*': 'eslint --fix',
    }

    await writePackageJSON(packageJsonPath, newPackageJson)
}
