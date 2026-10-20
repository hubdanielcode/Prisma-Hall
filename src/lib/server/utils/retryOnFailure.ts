import "server-only";

/* - Repete uma operação que falhou (ex: uma transaction do banco com erro passageiro). Depois da última tentativa, devolve o erro de quem falhou - */

const retryOnFailure = async <T>(operation: () => Promise<T>, attempts = 3, delayInMilliseconds = 200): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayInMilliseconds * attempt));
      }
    }
  }

  throw lastError;
};

export { retryOnFailure };
