import type { IConfig } from '../types'
import { x } from 'tinyexec'

export async function installDevDeps(config: IConfig): Promise<void> {
    const { cwd, packageManager } = config
    const devDeps = [
        'eslint',
        '@antfu/eslint-config',
        'jiti',
        'typescript',
        '@lonewolfyx/tsconfig',
        '@types/node',
        'nano-staged',
        'simple-git-hooks',
        'picocolors',
        'tsx',
        'tsdown',
        'verify-git-commit',
    ]

    const addArgs = packageManager === 'pnpm'
        ? ['add', '-D', ...devDeps]
        : ['install', '-D', ...devDeps]

    await x(packageManager, addArgs, { nodeOptions: { cwd } })
}
