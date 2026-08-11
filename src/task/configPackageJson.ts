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
        'pre-commit': 'npx lint-staged',
        'commit-msg': 'npx verify-git-commit',
    }
    packageJson['lint-staged'] = {
        '*': 'eslint --fix',
    }

    packageJson.publishConfig = {
        registry: 'https://registry.npmjs.org',
        access: 'public',
    }

    await writePackageJSON(packageJsonPath, packageJson)
}
