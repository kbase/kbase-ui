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

  async run(cmd: Array<string>) {
    const processOptions: Deno.RunOptions = {
      cmd,
      stderr: "piped",
      stdout: "piped",
    };
    processOptions.cwd = this.directory;
    const process = Deno.run(processOptions);
    const decoder = new TextDecoder();
    const [status, output, errorOutput] = await Promise.all([
      process.status(),
      process.output(),
      process.stderrOutput(),
    ]);
    // TODO: handle errors:

    // log("Status?");
    // log(String(status.code));
    // log(String(status.success));
    // log(String(status.signal));

    // log("Error?");
    // log(decoder.decode(errorOutput));

    // log("Result?");
    // log(decoder.decode(output));

    return decoder.decode(output);
    // return {
    //   status,
    //   output: decoder.decode(output),
    //   error: decoder.decode(errorOutput)
    // }
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
    const rawTag = await this.runner.run([
      "git",
      "describe",
      "--exact-match",
      "--tags",
    ]);
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

  async clone(url: string, name: string, branch = "master") {
    const cmd = [
      "git",
      "clone",
      "--quiet",
      "--depth",
      "1",
      "--branch",
      branch,
      url,
      `${this.directory}/${name}`,
    ];
    return this.runner.run(cmd);
  }

  async getInfo(): Promise<GitInfo> {
    log("make mounted directory 'safe' for git", "common.ts:GitInfo.getInfo()");
    await this.runner.run([
      "git",
      "config",
      "--global",
      "--add",
      "safe.directory",
      "/app",
    ]);

    log("getting hash, author, committer...", "common.ts:GitInfo.getInfo()");
    const showOutput = await this.runner.run([
      "git",
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

    log("Getting subject", "common.ts:GitInfo.getInfo()");
    const subject = await this.runner.run(["git", "log", "-1", "--pretty=%s"]);

    log("Getting notes", "common.ts:GitInfo.getInfo()");
    const notes = await this.runner.run(["git", "log", "-1", "--pretty=%N"]);

    log("Getting origin url", "common.ts:GitInfo.getInfo()");
    let originURL =
      (await this.runner.run(["git", "config", "--get", "remote.origin.url"]))
        .trim();

    if (originURL.endsWith(".git")) {
      originURL = originURL.slice(0, -4);
    }

    const url = new URL(originURL);
    const path = url.pathname;
    const [_ignore, account, repoName] = path.split("/");

    log("Getting branch", "common.ts:GitInfo.getInfo()");
    const branch =
      (await this.runner.run(["git", "rev-parse", "--abbrev-ref", "HEAD"]))
        .trim();

    log("Getting tag", "common.ts:GitInfo.getInfo()");
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
