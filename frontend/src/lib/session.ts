// Anonymous session management using localStorage
// No auth needed — each browser gets a unique sessionId

const SESSION_KEY = "tunis_traffic_session_id";

const generateUUID = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const getSessionId = (): string => {
    if (typeof window === "undefined") return "";

    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
};
