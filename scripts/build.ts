import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import webpack from "webpack";
import '@ungap/with-resolvers';
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {pathToFileURL} from "node:url";
import {ANALYZE_PATH, DIST_PATH, ROOT_PATH, SRC_PATH, TS_CONFIG_PATH} from "./paths";
import esbuild from 'esbuild';
import path from "path";

import {glob} from "glob";
import fs from "fs-extra";
import escapeStringRegexp from 'escape-string-regexp';
import analyzeFactory from "./configs/webpack.analyze.config";

type EsBuildOptions = Parameters<typeof esbuild.build>[0];

type BuildOptions = {
    env: string;
    watch?: boolean;
    analyze?: boolean;
};

const execFileAsync = promisify(execFile);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const runTypeBuild = async (outDir: string) => {
    await execFileAsync(npmCommand, ["run", "build:types", "--", "--outDir", outDir], {
        cwd: ROOT_PATH,
        maxBuffer: 1024 * 1024 * 10,
    });
};

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

export const runBuild = async ({env, analyze = false}: BuildOptions) => {
    const ESOutDir = DIST_PATH + '/es';
    const CJsOutDir = DIST_PATH + '/lib';

    await Promise.all([
        runTypeBuild(CJsOutDir),
        runTypeBuild(ESOutDir),
    ]);

    const start = performance.now();

    const globPattern = path.normalize(SRC_PATH).replaceAll(path.sep, '/') + '/**/*.{ts,tsx}';

    const [esEntries, typeFiles] = (await glob(globPattern))
        .reduce<[string[], string[]]>((groups, path) => {
            const isTypeFile = path.endsWith('.d.ts');
            groups[isTypeFile ? 1 : 0].push(path)

            return groups
        }, [ [], [] ]);

    await Promise.all([CJsOutDir, ESOutDir].flatMap((dir) => (
        typeFiles.map((typeFilePath) => {
            const destPath = typeFilePath.replace(new RegExp(`^${escapeStringRegexp(SRC_PATH)}`), dir).replaceAll('/', path.sep);

            return fs.copy(
                typeFilePath,
                destPath
            );
        })
    )));

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

    console.log('has built')
};

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectRun) {
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

    (async function (){
        const {watch, env, analyze} = await args;

        try {
            await runBuild({env, watch, analyze});
        } catch (e) {
            console.error('build error:', e);
            process.exitCode = 1;
        }
    })()
}
