import {getToken} from "../auth/token";

export class ApiError extends Error {
    constructor(message, {status, data} = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

export class AuthError extends ApiError {
    constructor(message, {status, data} = {}) {
        super(message, {status, data});
        this.name = "AuthError";
    }
}

function contentType(headers) {
    return (headers.get("content-type") || "").toLowerCase();
}

async function safeReadBody(response) {
    const ct = contentType(response.headers);
    if (ct.includes("application/json")) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    try {
        return await response.text();
    } catch {
        return null;
    }
}

export async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && options.body != null) {
        headers.set("Content-Type", "application/json");
    }

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {...options, headers});

    if (response.ok) {
        const ct = contentType(response.headers);
        if (ct.includes("application/json")) return response.json();
        return response.text();
    }

    const data = await safeReadBody(response);
    const message =
        (data && typeof data === "object" && "message" in data && String(data.message)) ||
        (typeof data === "string" && data) ||
        `Request failed (status ${response.status})`;

    if (response.status === 401 || response.status === 403) {
        throw new AuthError(message, {status: response.status, data});
    }

    throw new ApiError(message, {status: response.status, data});
}

