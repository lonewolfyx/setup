import { access } from 'node:fs/promises'
import path from 'node:path'
import { confirm, intro, isCancel, outro } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { description, name, version } from '../package.json'
import { schedule } from './schedule.ts'
import { addGitHooksConfig } from './task/addGitHooksConfig'
import { clearDirectory } from './task/clearDirectory'
import { configPackageJson } from './task/configPackageJson'
import { createEslintConfig } from './task/createEslintConfig'
import { createGitHooks } from './task/createGitHooks'
import { createPackageJson } from './task/createPackageJson'
import { createTsConfig } from './task/createTsConfig'
import { installDevDeps } from './task/installDevDeps'

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

        if (packageJsonExists) {
            const shouldOverwrite = await confirm({
                message: '检测到当前目录已存在项目，是否覆盖创建新项目？（将清空当前目录下所有文件）',
            })

            if (isCancel(shouldOverwrite) || !shouldOverwrite) {
                outro('已取消操作')
                return
            }

            await clearDirectory(cwd)
        }

        await schedule()
            .step('正在创建 package.json...', () => createPackageJson(cwd), 'package.json 创建完成')
            .step('正在配置 package.json...', () => configPackageJson(cwd, packageJsonPath), 'package.json 配置完成')
            .step('正在安装开发依赖...', () => installDevDeps(cwd), '开发依赖安装完成')
            .step('正在创建 git hooks 配置文件...', () => createGitHooks(cwd), 'git hooks 配置文件创建完成')
            .step('正在创建 tsconfig.json...', () => createTsConfig(cwd), 'tsconfig.json 创建完成')
            .step('正在添加 git hooks 配置...', () => addGitHooksConfig(cwd, packageJsonPath), 'git hooks 配置添加完成')
            .step('正在创建 ESLint 配置文件...', () => createEslintConfig(cwd), 'ESLint 配置文件创建完成')
            .done()
    },
})

createMain(command)({})
