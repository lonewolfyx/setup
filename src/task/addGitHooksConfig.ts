import { readPackageJSON, writePackageJSON } from 'pkg-types'

/**
 * 添加 git hooks 配置到 package.json
 * @param cwd 当前工作目录
 * @param packageJsonPath package.json 文件路径
 */
export async function addGitHooksConfig(cwd: string, packageJsonPath: string): Promise<void> {
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
