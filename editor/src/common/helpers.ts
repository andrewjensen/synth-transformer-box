export function range(min: number, max: number): number[] {
  const results = [];
  for (let i = min; i < max; i++) {
    results.push(i);
  }
  return results;
}

export function chunkEvery<T>(arr: T[], chunkSize: number): T[][] {
  const results = [];

  for (let i = 0; i < arr.length; i++) {
    const last = results[results.length - 1];
    if (!last || last.length === chunkSize) {
      results.push([arr[i]]);
    } else {
      last.push(arr[i]);
    }
  }

  return results;
}

export function max(a: number, b: number): number {
  return a > b ? a : b;
}
