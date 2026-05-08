import type { IConfig } from '../types'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

export async function createEslintConfig(config: IConfig): Promise<void> {
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

    const eslintConfigPath = path.join(config.cwd, 'eslint.config.ts')
    await writeFile(eslintConfigPath, eslintConfigContent)
}
