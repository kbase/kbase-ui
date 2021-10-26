export function wait(duration: number): Promise<void> {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, duration);
  });
}
