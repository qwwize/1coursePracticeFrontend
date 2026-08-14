// Эти значения заполняются только после получения утверждённого API-контракта.
export const API_CONFIG = {
  baseUrl: '',
  operations: {
    register: { path: '', method: '' },
    login: { path: '', method: '' },
    createLink: { path: '', method: '' },
    links: { path: '', method: '' },
    deleteLink: { path: '', method: '' },
    linkStatistics: { path: '', method: '' },
  },
};

export class ApiError extends Error {
  constructor(message, status = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, signal } = options;
  const url = buildApiUrl(path);
  const requestOptions = { method, signal, headers: {} };

  if (body !== undefined) {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(url, requestOptions);
  } catch {
    throw new ApiError('Не удалось соединиться с сервером');
  }

  const responseData = await readResponse(response);

  if (!response.ok) {
    const message = responseData?.message || `Сервер вернул ошибку ${response.status}`;
    throw new ApiError(message, response.status, responseData);
  }

  return responseData;
}

export function registerUser(userData) {
  return requestOperation('register', userData);
}

export function loginUser(credentials) {
  return requestOperation('login', credentials);
}

export function createShortLink(originalUrl) {
  return requestOperation('createLink', { originalUrl });
}

export function getLinks() {
  return requestOperation('links');
}

export function deleteLink(id) {
  return requestOperation('deleteLink', { id });
}

export function getLinkStatistics(id) {
  return requestOperation('linkStatistics', { id });
}

function requestOperation(name, body) {
  const operation = API_CONFIG.operations[name];

  if (!operation?.path || !operation.method) {
    throw new ApiError(`Операция ${name} ещё не настроена`);
  }

  return apiRequest(operation.path, { method: operation.method, body });
}

function buildApiUrl(path) {
  if (!API_CONFIG.baseUrl) {
    throw new ApiError('Базовый адрес API ещё не настроен');
  }

  if (!path) {
    throw new ApiError('Маршрут API ещё не настроен');
  }

  return `${API_CONFIG.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function readResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new ApiError('Сервер вернул некорректный ответ', response.status);
  }
}
