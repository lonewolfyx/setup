import type { IConfig } from '../types'
import { readPackageJSON, writePackageJSON } from 'pkg-types'

export async function configPackageJson(config: IConfig): Promise<void> {
    const { cwd, packageJsonPath } = config
    const packageJson = await readPackageJSON(cwd)

    if (packageJson.main) {
        delete packageJson.main
    }

    packageJson.type = 'module'
    packageJson.scripts = {
        ...packageJson.scripts,
        'lint': 'eslint .',
        'lint:fix': 'eslint --fix',
        'prepare': 'simple-git-hooks',
    }

    packageJson['simple-git-hooks'] = {
        'pre-commit': 'npx nano-staged',
        'commit-msg': 'node scripts/verify-commit.js',
    }
    packageJson['nano-staged'] = {
        '*': 'eslint --fix',
    }

    await writePackageJSON(packageJsonPath, packageJson)
}
