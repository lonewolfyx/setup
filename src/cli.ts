import { access } from 'node:fs/promises'
import { confirm, intro, isCancel, outro } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import {
    clearDirectory,
    configPackageJson,
    createEslintConfig,
    createGithubWorkflows,
    createPackageJson,
    createTsConfig,
    installDevDeps,
} from '@/task'
import { createGitignore } from '@/task/createGitignore.ts'
import { description, name, version } from '../package.json'
import { resolveConfig } from './config'
import { schedule } from './schedule.ts'

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
        const config = await resolveConfig(cwd)

        // 检测 package.json 是否存在
        const packageJsonExists = await access(config.packageJsonPath)
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

            await clearDirectory(config.cwd)
        }

        await schedule()
            .step('正在创建 .gitignore 文件', () => createGitignore(config), '.gitignore 创建完成')
            .step('正在创建 package.json...', () => createPackageJson(config), 'package.json 创建完成')
            .step('正在安装开发依赖...', () => installDevDeps(config), '开发依赖安装完成')
            .step('正在创建 tsconfig.json...', () => createTsConfig(config), 'tsconfig.json 创建完成')
            // .step('正在创建 git verify commit 配置文件...', () => createGitVerifyCommit(config), 'git verify commit 配置文件创建完成')
            .step('正在创建 ESLint 配置文件...', () => createEslintConfig(config), 'ESLint 配置文件创建完成')
            .step('正在配置 package.json...', () => configPackageJson(config), 'package.json 配置完成')
            .step('正在创建 GitHub Workflows...', () => createGithubWorkflows(config), 'GitHub Workflows 创建完成')
            .done()
    },
})

createMain(command)({})
