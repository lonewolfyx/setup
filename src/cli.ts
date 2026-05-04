import { access } from 'node:fs/promises'
import path from 'node:path'
import { confirm, intro, isCancel, outro, spinner } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { description, name, version } from '../package.json'
import { addGitHooksConfig } from './task/addGitHooksConfig'
import { clearDirectory } from './task/clearDirectory'
import { configPackageJson } from './task/configPackageJson'
import { createEslintConfig } from './task/createEslintConfig'
import { createGitHooks } from './task/createGitHooks'
import { createPackageJson } from './task/createPackageJson'
import { createTsConfig } from './task/createTsConfig'
import { installDevDeps } from './task/installDevDeps'
import { hasPackageManager } from './task/utils'

const command = defineCommand({
    meta: {
        name,
        version,
        description,
    },
    setup() {
        intro('项目初始化')
    },
    cleanup() {
        outro('Done. 项目初始化完成')
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

        const progress = spinner()

        if (packageJsonExists) {
            const shouldOverwrite = await confirm({
                message: '检测到当前目录已存在项目，是否覆盖创建新项目？（将清空当前目录下所有文件）',
            })

            if (isCancel(shouldOverwrite) || !shouldOverwrite) {
                outro('已取消操作')
                return
            }

            // 清空目录内容
            progress.start('正在清空目录...')
            await clearDirectory(cwd)
            progress.stop('目录已清空')
        }

        // 创建 package.json 文件
        progress.start('正在检测包管理器...')

        const hasPnpm = await hasPackageManager('pnpm')
        progress.message('项目初始化...')

        await createPackageJson(cwd)

        progress.stop('package.json 创建完成')

        // 添加 "type": "module" 配置
        progress.start('正在配置 package.json...')

        await configPackageJson(cwd, packageJsonPath)

        progress.stop('package.json 配置完成')

        // 安装开发依赖
        progress.start('正在安装开发依赖...')

        await installDevDeps(cwd)

        progress.stop('开发依赖安装完成')

        // 创建 scripts/verify-commit.js 文件
        progress.start('正在创建 git hooks 配置文件...')

        await createGitHooks(cwd)

        progress.stop('git hooks 配置文件创建完成')

        // 创建 tsconfig.json 文件
        progress.start('正在创建 tsconfig.json...')

        await createTsConfig(cwd)

        progress.stop('tsconfig.json 创建完成')

        // 添加 git hooks 配置到 package.json
        progress.start('正在添加 git hooks 配置...')

        await addGitHooksConfig(cwd, packageJsonPath)

        progress.stop('git hooks 配置添加完成')

        // 创建 eslint.config.ts 文件
        progress.start('正在创建 ESLint 配置文件...')

        await createEslintConfig(cwd)

        progress.stop('ESLint 配置文件创建完成')
    },
})

createMain(command)({})
