// Base API client simulation with mock delay and consistent error handling

const SIMULATED_DELAY_MS = 250;

export async function simulateLatency(ms = SIMULATED_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createApiResponse(data, message = "Success") {
  return {
    status: 200,
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createApiError(message = "Something went wrong", status = 400) {
  return {
    status,
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
}
