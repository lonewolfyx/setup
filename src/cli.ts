import { access, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { confirm, intro, isCancel, outro, spinner } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { x } from 'tinyexec'
import { description, name, version } from '../package.json'

/**
 * 检测包管理器是否存在
 * @param command 包管理器命令名称
 */
async function hasPackageManager(command: string): Promise<boolean> {
    try {
        await x(command, ['--version'], { throwOnError: true })
        return true
    }
    catch {
        return false
    }
}

/**
 * 清空目录内容，保留 .git 目录
 * @param dirPath 目录路径
 */
async function clearDirectory(dirPath: string): Promise<void> {
    const entries = await readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
        // 保留 .git 目录
        if (entry.name === '.git') {
            continue
        }

        const fullPath = path.join(dirPath, entry.name)

        if (entry.isDirectory()) {
            await rm(fullPath, { recursive: true, force: true })
        }
        else {
            await rm(fullPath, { force: true })
        }
    }
}

const command = defineCommand({
    meta: {
        name,
        version,
        description,
    },
    setup() {
        console.log('Setup')
    },
    cleanup() {
        console.log('Cleanup')
    },
    args: {
        cwd: {
            type: 'string',
            description: 'Current working directory',
            alias: 'c',
            default: process.cwd(),
        },
    },
    async run({ args }) {
        const cwd = args.cwd as string
        const packageJsonPath = path.join(cwd, 'package.json')

        // 检测 package.json 是否存在
        const packageJsonExists = await access(packageJsonPath)
            .then(() => true)
            .catch(() => false)

        intro('项目初始化')

        if (packageJsonExists) {
            const shouldOverwrite = await confirm({
                message: '检测到当前目录已存在项目，是否覆盖创建新项目？（将清空当前目录下所有文件）',
            })

            if (isCancel(shouldOverwrite) || !shouldOverwrite) {
                outro('已取消操作')
                return
            }

            // 清空目录内容
            const loading = spinner()
            loading.start('正在清空目录...')
            await clearDirectory(cwd)
            loading.stop('目录已清空')
        }

        // 创建 package.json 文件
        const initLoading = spinner()
        initLoading.start('正在检测包管理器...')

        const hasPnpm = await hasPackageManager('pnpm')
        initLoading.message('项目初始化...')

        await x(hasPnpm ? 'pnpm' : 'npm', hasPnpm ? ['init'] : ['init', '-y'], { nodeOptions: { cwd } })

        initLoading.stop('package.json 创建完成')
    },
})

createMain(command)({})
