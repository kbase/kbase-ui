export function log(message: string, source?: string): void {
    const timestamp = Intl.DateTimeFormat("en-US").format(Date.now());
    let prefix = `[${timestamp}]`;
    if (source) {
        prefix += ` [${source}]`;
    }
    console.log(`${prefix} ${message}`);
}

export interface PluginConfig {
    name: string;
    globalName: string;
    version: string;
    source: {
        github: {
            account: string;
        };
    };
}

export interface PluginsConfig {
    plugins: Array<PluginConfig>;
}

export class Runner {
    directory: string;
    constructor(directory: string) {
        this.directory = directory;
    }

    async run(cmd: string, args: Array<string>, throwOnError: boolean = true) {
        const commandOptions: Deno.CommandOptions = {
            stderr: "piped",
            stdout: "piped",
            args,
            cwd: this.directory
        };
        // commandOptions.cwd = this.directory;
        // console.log('[run] CWD is ' + this.directory)
        // console.log('[run] cmd is ', cmd);
        const command = new Deno.Command(cmd, commandOptions);
        try {
            const { code, stdout, stderr } = await command.output();
            if (code !== 0 && throwOnError) {
                log("Run Failed!");
                log(String(code));
                // log(String(status.success));
                // log(String(status.signal));
                const errorText = new TextDecoder().decode(stderr);
                log(errorText);
                throw new Error('Run failed!');
            }
            return new TextDecoder().decode(stdout);
            // TODO: handle errors:
        } catch (ex) {
            console.error('[run] error', ex);
            throw new Error(`[run] Error running command ${cmd}: ${ex.message}`)
        }
    }
}

export type ISODateTimeString = string;

export interface GitInfo {
    hash: {
        full: string;
        abbreviated: string;
    };
    subject: string;
    notes: string;
    author: {
        name: string;
        date: ISODateTimeString;
    };
    committer: {
        name: string;
        date: ISODateTimeString;
    };
    originURL: string;
    account: string;
    repoName: string;
    branch: string;
    tag?: string;
    version?: string;
}

export class Git {
    directory: string;
    runner: Runner;
    constructor(directory: string) {
        this.directory = directory;
        this.runner = new Runner(directory);
    }
    async gitTag(): Promise<{ tag?: string; version?: string }> {
        const rawTag = await this.runner.run('git', [
            "describe",
            "--exact-match",
            "--tags",
        ], false);
        const tag = rawTag.trim();
        if (/^fatal/.test(tag)) {
            return { tag };
        } else {
            const m = /^v([\d]+)\.([\d]+)\.([\d]+)$/.exec(tag);
            if (m) {
                return { tag, version: m.slice(1).join(".") };
            } else {
                if (tag.length > 0) {
                    return { tag };
                }
                return {};
            }
        }
    }

    async clone(url: string, name: string, branch: string) {
        const args = [
            "clone",
            //   "--quiet",
            "--depth",
            "1",
            "--branch",
            branch,
            url,
            `${this.directory}/${name}`,
        ];
        return this.runner.run('git', args);
    }

    async getInfo(): Promise<GitInfo> {
        await this.runner.run('git', [
            "config",
            "--global",
            "--add",
            "safe.directory",
            "/app",
        ]);

        const showOutput = await this.runner.run('git', [
            "show",
            "--format=%H%n%h%n%an%n%at%n%cn%n%ct%n%d",
            "--name-status",
        ]);
        const [
            commitHash,
            commitAbbreviatedHash,
            authorName,
            authorDateEpoch,
            committerName,
            committerDateEpoch,
        ] = showOutput.split("\n").slice(0, 6);

        const subject = await this.runner.run('git', ["log", "-1", "--pretty=%s"]);
        const notes = await this.runner.run('git', ["log", "-1", "--pretty=%N"]);
        let originURL =
            (await this.runner.run('git', ["config", "--get", "remote.origin.url"]))
                .trim();

        if (originURL.endsWith(".git")) {
            originURL = originURL.slice(0, -4);
        }

        const url = new URL(originURL);
        const path = url.pathname;
        const [_ignore, account, repoName] = path.split("/");
        const branch =
            (await this.runner.run('git', ["rev-parse", "--abbrev-ref", "HEAD"]))
                .trim();
        const { tag, version } = await this.gitTag();

        return {
            hash: {
                full: commitHash,
                abbreviated: commitAbbreviatedHash,
            },
            subject,
            notes,
            author: {
                name: authorName,
                date: new Date(parseInt(authorDateEpoch) * 1000).toISOString(),
            },
            committer: {
                name: committerName,
                date: new Date(parseInt(committerDateEpoch) * 1000).toISOString(),
            },
            originURL,
            account,
            repoName,
            branch,
            tag,
            version,
        };
    }
}
