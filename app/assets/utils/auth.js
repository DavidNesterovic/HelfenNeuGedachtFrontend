const TOKEN_KEY = 'helfenNeuGedacht_token';
const USER_KEY = 'helfenNeuGedacht_user';

export const parseJwt = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
};

export const saveToken = (token) => {
    if (process.client) {
        localStorage.setItem(TOKEN_KEY, token);
        const userInfo = parseJwt(token);
        if (userInfo) {
            localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
        }
    }
};

export const getToken = () => {
    if (process.client) {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
};

export const isAuthenticated = () => {
    if (!process.client) return false;
    
    const token = getToken();
    if (!token) return false;

    const tokenData = parseJwt(token);
    if (!tokenData || !tokenData.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return tokenData.exp > now;
};

export const logout = () => {
    if (process.client) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        // Nuxt-Weg für Redirect
        navigateTo('/login'); 
    }
};

export const getAuthHeader = () => {
    const token = getToken();
    return token ? `Bearer ${token}` : '';
};

export const getUserInfo = () => {
    if (process.client) {
        const userJson = localStorage.getItem(USER_KEY);
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch (e) {
                return null;
            }
        }
    }
    // Fallback
    const token = getToken();
    return token ? parseJwt(token) : null;
};

export const requireAuth = () => {
    if (process.client && !isAuthenticated()) {
        navigateTo('/login');
    }
};

export const authenticatedFetch = async (url, options = {}) => {
    const token = getAuthHeader();

    if (!options.headers) {
        options.headers = {};
    }

    options.headers['Authorization'] = token;

    if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }

    try {
        // Nuxt bietet $fetch, wir können aber bei nativem fetch bleiben
        const response = await fetch(url, options);

        if (response.status === 401) {
            logout();
            return null;
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};