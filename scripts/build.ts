
import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import webpack from "webpack";
import '@ungap/with-resolvers';
import {exec} from "child_process";
import {ANALYZE_PATH, DIST_PATH, SRC_PATH, TS_CONFIG_PATH} from "./paths";
import esbuild from 'esbuild';
import path from "path";

import {glob} from "glob";
import fs from "fs-extra";
import escapeStringRegexp from 'escape-string-regexp';
import analyzeFactory from "./configs/webpack.analyze.config";

const args = yargs(hideBin(process.argv))
    .option('env', {
        describe: 'node_env value',
        type: 'string',
        demandOption: true,
        alias: 'e',
    })
    .option('watch', {
        describe: 'watch the origin files',
        type: 'boolean',
        default: false,
        alias: 'w',
    })
    .option('analyze', {
        describe: 'turn on the bundle analyzer',
        type: 'boolean',
        default: false,
    })
    .strict()
    .help()
    .parse();


type EsBuildOptions = Parameters<typeof esbuild.build>[0];

const runBundleAnalyzer = async (env: string) => {
    const compiler = webpack(analyzeFactory({env}));

    await new Promise<void>((resolve, reject) => {
        compiler.run((err, stats) => {
            compiler.close((closeErr) => {
                if (err || closeErr) {
                    reject(err ?? closeErr);
                    return;
                }

                if (stats?.hasErrors()) {
                    reject(new Error(stats.toString({colors: true})));
                    return;
                }

                resolve();
            });
        });
    });

    console.log(`✔ bundle analyzer report: ${path.join(ANALYZE_PATH, 'report.html')}`);
    console.log(`✔ bundle analyzer stats: ${path.join(ANALYZE_PATH, 'stats.json')}`);
};

(async function (){
    const {watch, env, analyze} = await args;
    const ESOutDir = DIST_PATH + '/es';
    const CJsOutDir = DIST_PATH + '/lib';

    try {
        exec(`npm run build:types -- --outDir ${CJsOutDir}`);
        exec(`npm run build:types -- --outDir ${ESOutDir}`);

        const start = performance.now();

        const globPattern = path.normalize(SRC_PATH).replaceAll(path.sep, '/') + '/**/*.{ts,tsx}';

        const [esEntries, typeFiles] = (await glob(globPattern))
            .reduce<[string[], string[]]>((groups, path) => {
                const isTypeFile = path.endsWith('.d.ts');
                groups[isTypeFile ? 1 : 0].push(path)

                return groups
            }, [ [], [] ]);


        for (const dir of [CJsOutDir, ESOutDir]) {
            typeFiles.forEach(typeFilePath => {
                const destPath = typeFilePath.replace(new RegExp(`^${escapeStringRegexp(SRC_PATH)}`), dir).replaceAll('/', path.sep);

                fs.copy(
                    typeFilePath,
                    destPath
                )
            });
        }





        const commonConfigs: EsBuildOptions = {
            entryPoints: esEntries,
            bundle: false,
            tsconfig: TS_CONFIG_PATH,
            jsx: "transform",
            define: {
                'production': env
            },

        };

        const cjsConfig: EsBuildOptions = {
            ...commonConfigs,
            outdir: CJsOutDir,
            format: 'cjs',
        };

        const esmConfig: EsBuildOptions = {
            ...commonConfigs,
            outdir: ESOutDir,
            format: 'esm',
        };

        const processes = [
            cjsConfig,
            esmConfig
        ].map((config) => esbuild.build(config));

        await Promise.all(processes);

        console.log(`✔ esbuild built: ${performance.now() - start}ms`)

        if (analyze) {
            await runBundleAnalyzer(env);
        }

    } catch (e) {
        console.log('🤡 esbuild error:', e);
    }

    console.log('has built')



})()
