import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { retryOnFailure } from "@/lib/server/utils/retryOnFailure";

/* - Funções e dados auxiliares - */

// Operação que falha nas primeiras tentativas (com o erro "error 1", "error 2"...) e depois devolve o valor

const buildFlakyOperation = (failures: number, value = "result") => {
  const operation = vi.fn();

  for (let failure = 1; failure <= failures; failure += 1) {
    operation.mockRejectedValueOnce(new Error(`error ${failure}`));
  }

  return operation.mockResolvedValue(value);
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando o sucesso - */

test("should return the value and call the operation once when it succeeds on the first attempt", async () => {
  const operation = buildFlakyOperation(0);

  const result = await retryOnFailure(operation);

  expect(result).toBe("result");
  expect(operation).toHaveBeenCalledTimes(1);
});

test("should not wait when the first attempt succeeds", async () => {
  await retryOnFailure(buildFlakyOperation(0));

  expect(vi.getTimerCount()).toBe(0);
});

test.each([
  ["one failure", 1],
  ["two failures", 2],
])("should return the value of the first attempt that succeeds after %s", async (_description, failures) => {
  const operation = buildFlakyOperation(failures);

  const promise = retryOnFailure(operation);
  await vi.runAllTimersAsync();

  expect(await promise).toBe("result");
  expect(operation).toHaveBeenCalledTimes(failures + 1);
});

/* - Testando o número de tentativas - */

test("should try 3 times by default and throw the last error", async () => {
  const operation = buildFlakyOperation(3);

  const assertion = expect(retryOnFailure(operation)).rejects.toThrow("error 3");
  await vi.runAllTimersAsync();
  await assertion;

  expect(operation).toHaveBeenCalledTimes(3);
});

test.each([[1], [2], [5]])("should try exactly %s time(s) when the operation always fails", async (attempts) => {
  const operation = vi.fn().mockRejectedValue(new Error("db error"));

  const assertion = expect(retryOnFailure(operation, attempts)).rejects.toThrow("db error");
  await vi.runAllTimersAsync();
  await assertion;

  expect(operation).toHaveBeenCalledTimes(attempts);
});

test("should throw the error as it came, even when it is not an Error", async () => {
  const operation = vi.fn().mockRejectedValue("plain failure");

  const assertion = expect(retryOnFailure(operation, 2)).rejects.toBe("plain failure");
  await vi.runAllTimersAsync();
  await assertion;
});

test("should not call the operation again after it succeeds", async () => {
  const operation = buildFlakyOperation(1);

  const promise = retryOnFailure(operation, 5);
  await vi.runAllTimersAsync();
  await promise;

  expect(operation).toHaveBeenCalledTimes(2);
});

/* - Testando a espera entre as tentativas - */

test("should wait 200ms after the first failure and 400ms after the second by default", async () => {
  const operation = buildFlakyOperation(2);

  const promise = retryOnFailure(operation);
  await vi.advanceTimersByTimeAsync(0);
  expect(operation).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(199);
  expect(operation).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(1);
  expect(operation).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(399);
  expect(operation).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(1);
  expect(operation).toHaveBeenCalledTimes(3);

  await promise;
});

test("should multiply the custom delay by the number of the attempt that failed", async () => {
  const operation = buildFlakyOperation(2);

  const promise = retryOnFailure(operation, 3, 1000);
  await vi.advanceTimersByTimeAsync(999);
  expect(operation).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(1);
  expect(operation).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(1999);
  expect(operation).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(1);
  expect(operation).toHaveBeenCalledTimes(3);

  await promise;
});

test("should not wait after the last attempt fails", async () => {
  const operation = vi.fn().mockRejectedValue(new Error("db error"));

  const assertion = expect(retryOnFailure(operation, 2, 500)).rejects.toThrow("db error");
  await vi.advanceTimersByTimeAsync(500);
  await assertion;

  expect(operation).toHaveBeenCalledTimes(2);
  expect(vi.getTimerCount()).toBe(0);
});

test("should throw right away without waiting when there is only one attempt", async () => {
  const operation = vi.fn().mockRejectedValue(new Error("db error"));

  await expect(retryOnFailure(operation, 1)).rejects.toThrow("db error");

  expect(vi.getTimerCount()).toBe(0);
});
