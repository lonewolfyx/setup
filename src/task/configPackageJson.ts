import { readPackageJSON, writePackageJSON } from 'pkg-types'

/**
 * 配置 package.json，添加 "type": "module"
 * @param cwd 当前工作目录
 * @param packageJsonPath package.json 文件路径
 */
export async function configPackageJson(cwd: string, packageJsonPath: string): Promise<void> {
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

    await writePackageJSON(packageJsonPath, packageJson)
}
