import type { IConfig } from '../types'
import { resolve } from 'node:path'
import { writeTSConfig } from 'pkg-types'

export async function createTsConfig(config: IConfig): Promise<void> {
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

    await writeTSConfig(resolve(config.cwd, 'tsconfig.json'), tsconfigConfig)
}
