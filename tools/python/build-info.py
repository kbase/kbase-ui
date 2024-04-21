import json
import sys
from datetime import datetime, timezone


def main():
    dest = sys.argv[1]
    build_info = {
        "builtAt": f"{datetime.now(tz=timezone.utc).replace(microsecond=0).isoformat()}"
    }
    with open(dest, "w", encoding="utf-8") as out:
        json.dump(build_info, out, indent=4)


if __name__ == "__main__":
    main()
    main()
