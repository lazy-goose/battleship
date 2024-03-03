import CopyPlugin from 'copy-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import NodemonPlugin from 'nodemon-webpack-plugin'
import { Configuration } from 'webpack'

export default {
    entry: './src/index.ts',
    output: {
        filename: 'server.bundle.js',
        clean: true,
    },
    mode: 'production',
    target: 'node',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts'],
    },
    plugins: [
        new NodemonPlugin({
            nodeArgs: ['--enable-source-maps'],
        }),
        new ESLintPlugin({
            failOnWarning: true,
            extensions: ['ts'],
        }),
        new CopyPlugin({
            patterns: [{ from: 'static' }],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
        ],
    },
    externals: {
        ws: `require('ws')`,
    },
} satisfies Configuration
