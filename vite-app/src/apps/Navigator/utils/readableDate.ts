export function readableDate(d: string | number): string {
  return new Date(d).toLocaleDateString();
}
