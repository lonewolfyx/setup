import { x } from 'tinyexec'
import { hasPackageManager } from './utils'

/**
 * 安装开发依赖
 * @param cwd 当前工作目录
 */
export async function installDevDeps(cwd: string): Promise<void> {
    const devDeps = [
        'eslint',
        '@antfu/eslint-config',
        'typescript',
        '@lonewolfyx/tsconfig',
        '@types/node',
        'lint-staged',
        'simple-git-hooks',
        'picocolors',
        'tsx',
        'tsdown',
    ]

    const hasPnpm = await hasPackageManager('pnpm')
    const addCmd = hasPnpm ? 'pnpm' : 'npm'
    const addArgs = hasPnpm
        ? ['add', '-D', ...devDeps]
        : ['install', '-D', ...devDeps]

    await x(addCmd, addArgs, { nodeOptions: { cwd } })
}
