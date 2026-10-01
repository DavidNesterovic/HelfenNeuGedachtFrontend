// Zentrale API-Konfiguration für das HelfenNeuGedacht Frontend (Docker-Umgebung))
const API_CONFIG = {
    HUB_URL: 'http://localhost:5062/hubs',
    BASE_URL: 'http://localhost:5062/api',
    ENDPOINTS: {
        EVENTS: '/events',
        SHIFTS: '/shifts',
        ORGANIZATION: '/organization',
        AUTH: '/authenticate'
    },

    // Helper-Funktion um vollständige URLs zu erstellen
    getUrl(endpoint) {
        return this.BASE_URL + this.ENDPOINTS[endpoint];
    }
};
