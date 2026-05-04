import { access } from 'node:fs/promises'
import path from 'node:path'
import { confirm, intro, isCancel, outro } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { description, name, version } from '../package.json'

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

            // TODO: 清空目录内容
        }

        outro('操作完成')
    },
})

createMain(command)({})
