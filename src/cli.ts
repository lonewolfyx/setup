import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { confirm, intro, isCancel, outro, spinner } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { readPackageJSON, writePackageJSON, writeTSConfig } from 'pkg-types'
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

        // 添加 "type": "module" 配置
        const typeLoading = spinner()
        typeLoading.start('正在配置 package.json...')

        const packageJson = await readPackageJSON(cwd)
        packageJson.type = 'module'
        await writePackageJSON(packageJsonPath, packageJson)

        typeLoading.stop('package.json 配置完成')

        // 安装开发依赖
        const depsLoading = spinner()
        depsLoading.start('正在安装开发依赖...')

        const devDeps = [
            'eslint',
            '@antfu/eslint-config',
            'typescript',
            '@lonewolfyx/tsconfig',
            '@types/node',
            'lint-staged',
            'simple-git-hooks',
            'picocolors',
            'tsx',
            'tsdown',
        ]

        const addCmd = hasPnpm ? 'pnpm' : 'npm'
        const addArgs = hasPnpm
            ? ['add', '-D', ...devDeps]
            : ['install', '-D', ...devDeps]

        // await x(addCmd, addArgs, { nodeOptions: { cwd } })

        depsLoading.stop('开发依赖安装完成')

        // 创建 scripts/verify-commit.js 文件
        const scriptsLoading = spinner()
        scriptsLoading.start('正在创建 git hooks 配置文件...')

        const scriptsDir = path.join(cwd, 'scripts')
        await mkdir(scriptsDir, { recursive: true })

        const verifyCommitPath = path.join(scriptsDir, 'verify-commit.js')
        const verifyCommitContent = 'import { readFileSync } from \'node:fs\'\n'
            + 'import path from \'node:path\'\n'
            + '// @ts-check\n'
            + 'import pico from \'picocolors\'\n'
            + '\n'
            + 'const msgPath = path.resolve(\'.git/COMMIT_EDITMSG\')\n'
            + 'const msg = readFileSync(msgPath, \'utf-8\').trim()\n'
            + '\n'
            + 'const commitRE\n'
            + '    = /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\\(.+\\))?: .{1,50}/\n'
            + '\n'
            + 'if (!commitRE.test(msg)) {\n'
            + '    console.log()\n'
            + '    console.error(\n'
            // eslint-disable-next-line no-template-curly-in-string
            + '        `  ${pico.white(pico.bgRed(\' ERROR \'))} ${pico.red(\n'
            + '            `invalid commit message format.`,\n'
            + '        )}\\n\\n${\n'
            + '            pico.red(\n'
            + '                `  Proper commit message format is required for automated changelog generation. Examples:\\n\\n`,\n'
            + '            )\n'
            // eslint-disable-next-line no-template-curly-in-string
            + '        }    ${pico.green(`feat(compiler): add \'comments\' option`)}\\n`\n'
            + '        + `    ${pico.green(\n'
            + '            `fix(v-model): handle events on blur (close #28)`,\n'
            + '        )}\\n\\n${\n'
            + '            pico.red(`  See .github/commit-convention.md for more details.\\n`)}`,\n'
            + '    )\n'
            + '    process.exit(1)\n'
            + '}\n'

        await writeFile(verifyCommitPath, verifyCommitContent)

        scriptsLoading.stop('git hooks 配置文件创建完成')

        // 创建 tsconfig.json 文件
        const tsconfigLoading = spinner()
        tsconfigLoading.start('正在创建 tsconfig.json...')

        const tsconfigPath = path.join(cwd, 'tsconfig.json')

        const tsconfigConfig = {
            extends: '@lonewolfyx/tsconfig/tsconfig.lib.json',
            compilerOptions: {
                baseUrl: './',
                paths: {
                    '@/*': [
                        './src/*',
                    ],
                    '#/*': [
                        './src/types/*',
                        './types/*',
                    ],
                },
                resolveJsonModule: true,
                types: [
                    'node',
                ],
                noUnusedLocals: false,
                noUnusedParameters: false,
                declarationMap: false,
            },
        }

        await writeTSConfig(path.resolve(cwd, 'tsconfig.json'), tsconfigConfig)

        tsconfigLoading.stop('tsconfig.json 创建完成')

        // 添加 git hooks 配置到 package.json
        const gitHooksLoading = spinner()
        gitHooksLoading.start('正在添加 git hooks 配置...')

        const newPackageJson = await readPackageJSON(cwd)
        newPackageJson.simpleGitHooks = {
            'pre-commit': 'npx lint-staged',
            'commit-msg': 'node scripts/verify-commit.js',
        }
        newPackageJson.lintStaged = {
            '*': 'eslint --fix',
        }

        await writePackageJSON(packageJsonPath, newPackageJson)

        gitHooksLoading.stop('git hooks 配置添加完成')
    },
})

createMain(command)({})
