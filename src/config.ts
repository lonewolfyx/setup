import type { IConfig } from './types'
import path from 'node:path'
import { hasPackageManager } from './utils'

export async function resolveConfig(cwd: string): Promise<IConfig> {
    const hasPnpm = await hasPackageManager('pnpm')

    return {
        cwd,
        packageJsonPath: path.join(cwd, 'package.json'),
        packageManager: hasPnpm ? 'pnpm' : 'npm',
    }
}
