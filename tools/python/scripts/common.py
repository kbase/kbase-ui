import os
import subprocess
import sys
from datetime import datetime, timezone
from typing import List
from urllib.parse import urlparse


def print_lines(prefix: str, lines: List[str]):
    for index, line in enumerate(lines):
        print(f"{prefix} {index}: {line}")


def run_command(command, ignore_error=False):
    try:
        process = subprocess.run(command, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as cpe:
        if ignore_error:
            return str(cpe), False
        print("Error running git command:")
        print(f"Command: {cpe.cmd}")
        if cpe.stderr is not None:
            print_lines("stderr", cpe.stderr.split("\n"))
        print(str(cpe))
        sys.exit(1)

    return process.stdout, True


def utc_in_iso8601(timestamp):
    return (
        datetime.fromtimestamp(timestamp, tz=timezone.utc)
        .replace(microsecond=0)
        .isoformat()
    )


def git_info(git_repo_directory):
    current_directory = os.getcwd()
    if git_repo_directory:
        os.chdir(git_repo_directory)

    config1, config2 = run_command(
        ["git", "config", "--global", "--add", "safe.directory", "/app"]
    )

    output, _ = run_command(
        ["git", "show", "--format=%H%n%h%n%an%n%at%n%cn%n%ct%n%d", "--name-status"]
    )

    [
        commit_hash,
        commit_hash_abbreviated,
        author_name,
        author_date,
        committer_name,
        committer_date,
        *_,
    ] = output.split("\n")

    subject, _ = run_command(["git", "log", "-1", "--pretty=%s"])

    notes, _ = run_command(["git", "log", "-1", "--pretty=%N"])

    origin_url, _ = run_command(["git", "config", "--get", "remote.origin.url"])

    [_, account, repo_name] = urlparse(origin_url).path.split("/")

    branch, _ = run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"])

    if git_repo_directory:
        os.chdir(current_directory)

    return {
        "hash": {
            "full": commit_hash,
            "abbreviated": commit_hash_abbreviated,
        },
        "subject": subject.strip(),
        "notes": notes.strip(),
        "author": {
            "name": author_name,
            "date": utc_in_iso8601(int(author_date)),
        },
        "committer": {
            "name": committer_name,
            "date": utc_in_iso8601(int(committer_date)),
        },
        "originURL": origin_url.strip(),
        "account": account,
        "repoName": repo_name,
        "branch": branch.strip(),
    }
