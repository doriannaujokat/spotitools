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


Spotify.prototype.updateToken = function updateToken(apiToken) {
    this.apiToken = apiToken;
    return this;
}

Spotify.BaseURL = "https://api.spotify.com/v1";
Spotify.global = new Spotify(null);

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
 * @param {?{[method]: "GET"|"POST"|"PUT"|"DELETE", [body]: Object, [rejectOnRateLimit]: boolean, [rejectOnInvalidToken]: boolean, [invalidTokenCallback]: function}} [options]
 * @return {Promise<unknown>}
 * @this {Spotify}
 * @throws {SpotifyApiError}
 */
async function ApiFetch(endpoint, options) {
    const req = new Request(`${Spotify.BaseURL}${endpoint}`, {method: options?.method??"GET", headers: {Authorization: `Bearer ${this.apiToken}`, 'Content-Type': 'application/json'}, body: options?.body ? JSON.stringify(options.body) : undefined});
    for (let retry = 0; retry < 10; retry++) {
        const resp = await fetch(req);
        if (resp.status === 401) {
            options?.invalidTokenCallback?.();
            if (options?.rejectOnInvalidToken ?? true) throw new SpotifyApiError('INVALID_TOKEN', 401,'Invalid API Token');
            // TODO Await token update
        }
        if (resp.status === 429) {
            if (options?.rejectOnRateLimit) throw new SpotifyApiError('RATE_LIMIT', 429,'The rate limit has been reached');
            await new Promise(resolve => setTimeout(resolve, parseInt(resp.headers.get('Retry-After')??'10')*1000));
            continue;
        }
        if (resp.status === 200) {
            const jresp = await resp.json();
            return jresp;
        }
        return undefined;
    }
    throw new SpotifyApiError('RETRY_LIMIT_EXCEEDED', 0,'Could not get a response within 10 tries');
}
Spotify.prototype.ApiFetch = ApiFetch;

/**
 * @param {string} endpoint
 * @param {function} [progressCb]
 * @param {?{[method]: "GET"|"POST"|"PUT"|"DELETE", [limit]: number, [delay]: number, [rejectOnInvalidToken]: boolean, [invalidTokenCallback]: function}} [options]
 * @return {Promise<any[]>}
 */
async function ApiFetchAll(endpoint, progressCb, options){
    const results = [];
    let req = new Request(`${Spotify.BaseURL}${endpoint}${options?.limit?`?limit=${options.limit}`:``}`, {method: options?.method??"GET", headers: {Authorization: `Bearer ${this.apiToken}`, 'Content-Type': 'application/json'}});
    while (true) {
        const resp = await fetch(req);
        if (resp.status === 401) {
            options?.invalidTokenCallback?.();
            if (options?.rejectOnInvalidToken ?? true) throw new SpotifyApiError('INVALID_TOKEN', 401,'Invalid API Token');
            // TODO Await token update
        }
        if (resp.status === 429) {
            await new Promise(resolve => setTimeout(resolve, parseInt(resp.headers.get('Retry-After')??'10')*1000));
            continue;
        }
        if (resp.status === 200) {
            const jresp = await resp.json();
            for (let item of jresp.items) {
                results.push(item);
            }
            progressCb?.(jresp);
            if (jresp.next === undefined || jresp.next === null) break;
            req = new Request(jresp.next, {method: options?.method??"GET", headers: {Authorization: `Bearer ${this.apiToken}`, 'Content-Type': 'application/json'}});
            if (options.delay) await new Promise(resolve => setTimeout(resolve, options.delay));
            continue;
        }
        throw new SpotifyApiError('INVALID_RESPONSE', 0,'Received an invalid response');
    }
    return results;
}
Spotify.prototype.ApiFetchAll = ApiFetchAll;

export { Spotify as Spotify };