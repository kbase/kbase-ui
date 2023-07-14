// Utility for sorting an array of data using a custom accessor function

export function sortBy(arr: Array<any>, fn: (param: any) => any) {
  return arr.sort((a, b) => {
    const fa = fn(a);
    const fb = fn(b);
    if (fa < fb) return -1;
    if (fa > fb) return 1;
    return 0;
  });
}
