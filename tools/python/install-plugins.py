import glob
import gzip
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
from typing import List

import requests
import yaml


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


def save_info(info, dest):
    with open(dest, "w", encoding="utf-8") as fout:
        json.dump(info, fout, indent=4)


def load_config(path):
    with open(path, "r", encoding="utf-8") as config_in:
        return yaml.safe_load(config_in)


def dig(obj, key, default_value=None):
    path = key.split(".")

    def into(obj, path):
        if len(path) == 0:
            return obj

        [key, *rest] = path
        if re.match(r"[0-9]+", key) is not None:
            index = int(key)
            if len(obj) > index:
                return into(obj[index], rest)
            else:
                return default_value
        elif key in obj:
            return into(obj[key], rest)
        else:
            return default_value

    return into(obj, path)


def fetch_plugins_dist(config, dest):
    current_directory = os.getcwd()
    os.chdir(dest)

    for plugin in config["plugins"]:
        if dig(plugin, "source.github.release"):
            continue

        branch = f"v{plugin['version']}"
        name = plugin["name"]
        account = dig(plugin, "source.github.account")

        print(f'Fetching plugin "{name}" from branch {branch}...', end="", flush=True)

        run_command(
            [
                "git",
                "clone",
                "-b",
                branch,
                f"https://github.com/{account}/kbase-ui-plugin-{name}",
                name,
            ]
        )

        print("   ...done!")

    os.chdir(current_directory)


def fetch_plugins_release_dist(config, dest, gh_token):
    for plugin in config["plugins"]:
        if not dig(plugin, "source.github.release"):
            continue

        tag = f"v{plugin['version']}"
        name = plugin["name"]
        account = dig(plugin, "source.github.account")

        print(f'Fetching plugin release "{name}" from tag {tag}...', end="", flush=True)

        release_url = f"https://api.github.com/repos/{account}/kbase-ui-plugin-{name}/releases/tags/{tag}"

        response = requests.get(
            release_url,
            headers={
                "accept": "application/vnd.github+json",
                "authorization": f"Bearer {gh_token}",
            },
        )

        result = response.json()

        assets = dig(result, "assets")

        asset_url = None
        for asset in assets:
            if asset["name"] == "dist.tgz":
                asset_url = asset["url"]
                break

        plugin_dir = f"{dest}/{name}"
        pathlib.Path(plugin_dir).mkdir(exist_ok=True)

        response = requests.get(
            asset_url, headers={"accept": "application/octet-stream"}, stream=True
        )

        with open(f"{plugin_dir}/dist.tgz", "wb") as dist_out:
            shutil.copyfileobj(response.raw, dist_out)

        print("done!")


def unpack_plugins(source, dest):
    for plugin_dir in glob.glob(f"{source}/*"):
        filename = f"{plugin_dir}/dist.tgz"
        plugin_name = pathlib.Path(plugin_dir).name

        with open(filename, "rb") as dist_in:
            gzip_file = gzip.GzipFile(fileobj=dist_in)
            tf = tarfile.TarFile(fileobj=gzip_file)
            plugin_path = f"{dest}/{plugin_name}"
            tf.extractall(plugin_path)

            # old style archives are of the full path "dist/plugin",
            # which we want to undo.
            if pathlib.Path(f"{plugin_path}/dist").is_dir():
                shutil.move(plugin_path, f"{plugin_path}.temp")
                shutil.move(f"{plugin_path}.temp/dist/plugin", plugin_path)
                shutil.rmtree(f"{plugin_path}.temp")


def main():
    print("Installing plugins...")

    config_path = sys.argv[1]
    dest = sys.argv[2]
    gh_token = sys.argv[3]

    # TODO: Make sure destination directory does not exist yet.

    with tempfile.TemporaryDirectory() as temp_dir_name:

        config = load_config(config_path)

        pathlib.Path(dest).mkdir(exist_ok=True)

        fetch_plugins_dist(config, temp_dir_name)

        fetch_plugins_release_dist(config, temp_dir_name, gh_token)

        unpack_plugins(temp_dir_name, dest)

        sys.exit(0)

    print("Done installing plugins!")


main()
