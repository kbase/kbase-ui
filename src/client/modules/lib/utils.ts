import { AMDRequire } from "./types";

// TODO: a hack to override the node require definition built into TS
// TODO: there may be a compiler option to allow using AMD require?
declare var require: AMDRequire;

function isSimpleObject(obj: any) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return Object.getPrototypeOf(obj) === Object.getPrototypeOf({});
}

export function mergeObjects(listOfObjects: Array<any>) {
  function merge(obj1: any, obj2: any, keyStack: Array<string>) {
    Object.keys(obj2).forEach(function (key) {
      const obj1Value = obj1[key];
      const obj2Value = obj2[key];
      const obj1Type = typeof obj1Value;
      const obj2Type = typeof obj2Value;
      if (obj1Type === "undefined" || obj1Value === null) {
        // undefined or null properties are always overwritable
        obj1[key] = obj2[key];
      } else if (isSimpleObject(obj1Value) && isSimpleObject(obj2Value)) {
        // thread through objects.
        keyStack.push(key);
        merge(obj1Value, obj2Value, keyStack);
        keyStack.pop();
      } else if (obj1Type === obj2Type) {
        // same typed values may be overwritten, but with a warning.
        obj1[key] = obj2[key];
      } else {
        console.error(
          "Unmergable at " + keyStack.join(".") + ":" + key,
          obj1Type,
          obj1Value,
          obj2Type,
          obj2Value,
        );
        throw new Error("Unmergable at " + keyStack.join(".") + ":" + key);
      }
    });
  }

  const base = JSON.parse(JSON.stringify(listOfObjects[0]));
  for (let i = 1; i < listOfObjects.length; i += 1) {
    merge(base, listOfObjects[i], []);
  }
  return base;
}

export function prequire(dependencies: Array<string>) {
  return new Promise((resolve, reject) => {
    try {
      require(dependencies, (result) => {
        resolve(result);
      }, (error) => {
        reject(error);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

export function domSafeText(rawContent: string): string {
  const donorNode = document.createElement("div");
  donorNode.innerText = rawContent;
  // xss safe
  return donorNode.innerHTML;
}
