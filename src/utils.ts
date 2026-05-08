import { x } from 'tinyexec'

/**
 * 检测包管理器是否存在
 * @param command 包管理器命令名称
 */
export async function hasPackageManager(command: string): Promise<boolean> {
    try {
        await x(command, ['--version'], { throwOnError: true })
        return true
    }
    catch {
        return false
    }
}
