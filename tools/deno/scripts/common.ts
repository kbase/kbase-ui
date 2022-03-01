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

    return decoder.decode(output);
    // return {
    //   status,
    //   output: decoder.decode(output),
    //   error: decoder.decode(errorOutput)
    // }
  }
}

export class Git {
  directory: string;
  runner: Runner;
  constructor(directory: string) {
    this.directory = directory;
    this.runner = new Runner(directory);
  }
  async gitTag() {
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
        return { tag };
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

  async getInfo() {
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

    const subject = await this.runner.run(["git", " log", "-1", "--pretty=%s"]);

    const notes = await this.runner.run(["git", " log", "-1", "--pretty=%N"]);

    const originURL =
      (await this.runner.run(["git", "config", "--get", "remote.origin.url"]))
        .trim();

    const branch =
      (await this.runner.run(["git", "rev-parse", "--abbrev-ref", "HEAD"]))
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
      branch,
      tag,
      version,
    };
  }
}
