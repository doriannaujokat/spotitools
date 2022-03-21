/**
 * @param {string} apiToken
 * @return {Spotify}
 * @constructor
 * @this {Spotify}
 */
function Spotify(apiToken) {
    if (!new.target) return new Spotify(...arguments);

    this.apiToken = apiToken;
}

Spotify.BaseURL = "https://api.spotify.com/v1";

class SpotifyApiError extends Error {
    SPOTIFY_ERROR;
    HTTP_CODE;

    constructor(spErr, httpCode, message) {
        super(message);
        this.SPOTIFY_ERROR = spErr;
        this.HTTP_CODE = httpCode;
    }

}

/**
 * @param {string} endpoint
 * @param {"GET"|"POST"|"PUT"|"DELETE"} method
 * @param {?Object} [body]
 * @return {Promise<unknown>}
 * @this {Spotify}
 * @throws {SpotifyApiError}
 */
async function ApiFetch(endpoint, method, body) {
    return new Promise((resolve, reject) => {
        const req = new Request(`${Spotify.BaseURL}${endpoint}`, {method: method, headers: {Authorization: `Bearer ${this.apiToken}`, 'Content-Type': 'applications/json'}});
        if (body) req.body = JSON.stringify(body);
        fetch(req).then(async function (resp) {
            if (resp.status === 401) {
                reject(new SpotifyApiError('INVALID_TOKEN', 401,'Invalid API Token')); // TODO
                return;
            }
            if (resp.status === 200) {
                const jresp = await resp.json();
                resolve(jresp);
                return;
            }
        }).catch(async function (error) {
            reject(error);
        });
    });
}
Spotify.prototype.ApiFetch = ApiFetch;

export { Spotify as Spotify };