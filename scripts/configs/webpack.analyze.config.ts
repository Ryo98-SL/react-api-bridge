import path from "path";
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer";
import {merge} from "webpack-merge";
import {ANALYZE_PATH, ENTRY_PATH} from "../paths";
import {commonFactory, FactoryArgument} from "./webpack.common.config";

const analyzeFactory = (arg: FactoryArgument) => {
    const commonConfig = commonFactory(arg);

    return merge(commonConfig, {
        mode: arg.env === 'production' ? 'production' : 'development',
        target: ['web', 'es2020'],
        devtool: false,
        entry: ENTRY_PATH,
        output: {
            path: ANALYZE_PATH,
            filename: 'react-api-bridge.bundle.js',
            clean: true,
            library: {
                name: 'ReactApiBridge',
                type: 'umd',
            },
            globalObject: 'globalThis',
        },
        externals: {
            react: 'react',
            'react-dom': 'react-dom',
            'react/jsx-runtime': 'react/jsx-runtime',
            'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
        },
        optimization: {
            minimize: arg.env === 'production',
        },
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
                reportFilename: path.join(ANALYZE_PATH, 'report.html'),
                generateStatsFile: true,
                statsFilename: path.join(ANALYZE_PATH, 'stats.json'),
                defaultSizes: 'gzip',
            }),
        ],
    });
};

export default analyzeFactory;
