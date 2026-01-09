export async function withRetry(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.warn(`Retry ${i + 1}/${maxRetries} after error:`, error.message);
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
}
