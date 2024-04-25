import json
import sys

from .common import git_info


def save_info(info, dest):
    with open(dest, "w", encoding="utf-8") as fout:
        json.dump(info, fout, indent=4)


def main():
    dest = sys.argv[1]
    info = git_info()
    save_info(info, dest)
    sys.exit(0)


main()
