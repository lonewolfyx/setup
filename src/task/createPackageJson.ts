import type { IConfig } from '../types'
import { x } from 'tinyexec'

export async function createPackageJson(config: IConfig): Promise<void> {
    const { cwd, packageManager } = config

    await x(packageManager, packageManager === 'pnpm' ? ['init'] : ['init', '-y'], { nodeOptions: { cwd } })
}
