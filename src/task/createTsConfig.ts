import path from 'node:path'
import { writeTSConfig } from 'pkg-types'

/**
 * 创建 tsconfig.json 文件
 * @param cwd 当前工作目录
 */
export async function createTsConfig(cwd: string): Promise<void> {
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
}
