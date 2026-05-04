import { x } from 'tinyexec'
import { hasPackageManager } from './utils'

/**
 * 创建 package.json 文件
 * @param cwd 当前工作目录
 */
export async function createPackageJson(cwd: string): Promise<void> {
    const hasPnpm = await hasPackageManager('pnpm')

    await x(hasPnpm ? 'pnpm' : 'npm', hasPnpm ? ['init'] : ['init', '-y'], { nodeOptions: { cwd } })
}
