import { writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * 创建 ESLint 配置文件
 * @param cwd 当前工作目录
 */
export async function createEslintConfig(cwd: string): Promise<void> {
    const eslintConfigContent = `import type { Linter } from 'eslint'
import antfu from '@antfu/eslint-config'

const config = antfu({
    type: 'lib',
    stylistic: {
        indent: 4,
        quotes: 'single',
    },
    rules: {
        'no-console': 'off',
        'node/prefer-global/process': 'off',
        'antfu/top-level-function': 'off',
        'regexp/no-unused-capturing-group': 'off',
    },
    yaml: {
        overrides: {
            'yaml/indent': ['error', 2],
        },
    },
}) as Linter.Config

export default config`

    const eslintConfigPath = path.join(cwd, 'eslint.config.ts')
    await writeFile(eslintConfigPath, eslintConfigContent)
}
