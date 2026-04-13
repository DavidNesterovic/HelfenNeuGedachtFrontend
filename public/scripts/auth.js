// JWT Token Management für HelfenNeuGedacht Frontend

const TOKEN_KEY = 'helfenNeuGedacht_token';
const USER_KEY = 'helfenNeuGedacht_user';


function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);

    // Dekodiere Token um Benutzerinformationen zu extrahieren
    const userInfo = parseJwt(token);
    if (userInfo) {
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    }
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}


function isAuthenticated() {
    const token = getToken();
    if (!token) {
        return false;
    }

    // Prüfe ob Token abgelaufen ist
    const tokenData = parseJwt(token);
    if (!tokenData || !tokenData.exp) {
        return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return tokenData.exp > now;
}


function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
}


function getAuthHeader() {
    const token = getToken();
    return token ? `Bearer ${token}` : '';
}


function getUserInfo() {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (e) {
            return null;
        }
    }

//Fallback
    const token = getToken();
    return token ? parseJwt(token) : null;
}



function parseJwt(token) {
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
}


function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}


async function authenticatedFetch(url, options = {}) {
    const token = getAuthHeader();

    if (!options.headers) {
        options.headers = {};
    }

    options.headers['Authorization'] = token;

    if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, options);


        if (response.status === 401) {
            logout();
            return;
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveToken,
        getToken,
        isAuthenticated,
        logout,
        getAuthHeader,
        getUserInfo,
        requireAuth,
        authenticatedFetch
    };
}
