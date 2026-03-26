export const measureExecutionTime = (fn, label) => {
  return (...args) => {
    const start = process.hrtime();
    const memoryBefore = process.memoryUsage().heapUsed;

    const result = fn(...args);

    const end = process.hrtime(start);
    const memoryAfter = process.memoryUsage().heapUsed;

    const timeTaken = end[0] * 1000 + end[1] / 1e6;
    const memoryUsed = memoryAfter - memoryBefore;

    console.log(`[${label}] Tiempo de ejecución: ${timeTaken} ms`);
    console.log(`[${label}] Memoria usada: ${memoryUsed} bytes`);

    return result;
  };
};
