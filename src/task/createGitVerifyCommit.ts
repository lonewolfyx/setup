import type { IConfig } from '../types'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export async function createGitVerifyCommit(config: IConfig): Promise<void> {
    const scriptsDir = path.join(config.cwd, 'scripts')
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
        + '    = /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\\(.+\\))?(!)?: .{1,50}/\n'
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
        + '        )}\\n`\n'
        + '        + `    ${pico.green(\n'
        + '            `feat(api)!: remove legacy token endpoint`,\n'
        + '        )}\\n\\n${\n'
        + '            pico.red(`  See .github/commit-convention.md for more details.\\n`)}`,\n'
        + '    )\n'
        + '    process.exit(1)\n'
        + '}\n'

    await writeFile(verifyCommitPath, verifyCommitContent)
}
