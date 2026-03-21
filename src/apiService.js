const AZURE_BASE_URL = "https://backend-bank-b7aafdexb0cagphn.southeastasia-01.azurewebsites.net";
const LOCAL_BASE_URL = "http://localhost:8080";

const isObject = (value) => value !== null && typeof value === "object";

const normalizeData = (data, defaultValue) => {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(data) ? data : [];
  }

  if (isObject(defaultValue) && !Array.isArray(defaultValue)) {
    return isObject(data) && !Array.isArray(data) ? data : {};
  }

  return data ?? defaultValue;
};

const parseResponseData = async (response, defaultValue) => {
  const text = await response.text();
  if (!text) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(text);
    return normalizeData(parsed, defaultValue);
  } catch (error) {
    return defaultValue;
  }
};

const getRequestOptions = (method, body) => {
  const options = {
    method,
  };

  if (body !== undefined && body !== null) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  return options;
};

const shouldFallback = (error) => {
  return error?.name === "TypeError" || error?.isRetryable === true;
};

const getErrorMessage = (status, fallbackAttempted) => {
  if (fallbackAttempted) {
    return "Backend not reachable";
  }

  if (status >= 500) {
    return "Server unavailable, trying local server...";
  }

  return "Request failed";
};

const executeRequest = async (baseUrl, endpoint, method, body, defaultValue) => {
  const response = await fetch(`${baseUrl}${endpoint}`, getRequestOptions(method, body));

  if (!response.ok) {
    if (response.status >= 500) {
      const retryableError = new Error(`Server error: ${response.status}`);
      retryableError.isRetryable = true;
      throw retryableError;
    }

    const errorData = await parseResponseData(response, {});
    return {
      data: defaultValue,
      error: errorData?.message || `Request failed with status ${response.status}`,
      notice: null,
    };
  }

  const data = await parseResponseData(response, defaultValue);
  return { data, error: null, notice: null };
};

const requestWithFallback = async ({ endpoint, method = "GET", body, defaultValue }) => {
  try {
    return await executeRequest(AZURE_BASE_URL, endpoint, method, body, defaultValue);
  } catch (azureError) {
    if (!shouldFallback(azureError)) {
      return {
        data: defaultValue,
        error: "Request failed",
        notice: null,
      };
    }

    console.warn("Azure request failed, switching to local server:", azureError.message);
    console.info("Server unavailable, trying local server...");

    try {
      const localResponse = await executeRequest(LOCAL_BASE_URL, endpoint, method, body, defaultValue);

      return {
        ...localResponse,
        notice: "Server unavailable, trying local server...",
      };
    } catch (localError) {
      console.error("Local fallback request failed:", localError.message);

      return {
        data: defaultValue,
        error: getErrorMessage(500, true),
        notice: "Server unavailable, trying local server...",
      };
    }
  }
};

const apiService = {
  getUsers() {
    return requestWithFallback({ endpoint: "/api/users", method: "GET", defaultValue: [] });
  },

  createUser(userPayload) {
    return requestWithFallback({ endpoint: "/api/users", method: "POST", body: userPayload, defaultValue: {} });
  },

  updateUser(userId, userPayload) {
    return requestWithFallback({ endpoint: `/api/users/${userId}`, method: "PUT", body: userPayload, defaultValue: {} });
  },

  deleteUser(userId) {
    return requestWithFallback({ endpoint: `/api/users/${userId}`, method: "DELETE", defaultValue: {} });
  },

  getAccountsByUser(userId) {
    return requestWithFallback({ endpoint: `/api/accounts/user/${userId}`, method: "GET", defaultValue: [] });
  },

  createAccountForUser(userId, accountPayload) {
    return requestWithFallback({
      endpoint: `/api/accounts/user/${userId}`,
      method: "POST",
      body: accountPayload,
      defaultValue: {},
    });
  },

  getTransactionsByAccount(accountId) {
    return requestWithFallback({ endpoint: `/api/accounts/${accountId}/transactions`, method: "GET", defaultValue: [] });
  },

  deposit(accountId, amount) {
    return requestWithFallback({
      endpoint: `/api/accounts/${accountId}/deposit?amount=${amount}`,
      method: "POST",
      defaultValue: {},
    });
  },

  withdraw(accountId, amount) {
    return requestWithFallback({
      endpoint: `/api/accounts/${accountId}/withdraw?amount=${amount}`,
      method: "POST",
      defaultValue: {},
    });
  },
};

export default apiService;
