const scopes = [ 'user-library-modify', 'user-library-read', 'playlist-read-collaborative', 'playlist-read-private', 'user-modify-playback-state' ];
const url = 'https://accounts.spotify.com/authorize';
const clientId = '2f6dd05e9cf04a878303c1d4b6a82666';

function authenticate(redirect, confirm) {
    //const redirect = `https://spotitools.doriannaujokat.de/`;
    const _url = new URL(url);
    _url.searchParams.set('response_type','token');
    _url.searchParams.set('client_id',clientId);
    _url.searchParams.set('scope', scopes.join(' '));
    _url.searchParams.set('redirect_uri', `${window.location.protocol}//${window.location.host}/`);
    _url.searchParams.set('show_dialog', (confirm??false).toString());
    localStorage.setItem('redirect_uri',redirect??window.location.toString());
    window.location.assign(_url);
}

async function reauthenticate(confirm) {
    const _url = new URL(url);
    _url.searchParams.set('response_type','token');
    _url.searchParams.set('client_id',clientId);
    _url.searchParams.set('scope', scopes.join(' '));
    _url.searchParams.set('redirect_uri', `${window.location.protocol}//${window.location.host}/`);
    _url.searchParams.set('show_dialog', (confirm??false).toString());
    localStorage.setItem('redirect_uri','/');
    const popup = window.open(_url, 'spotitools_reauthpopup', 'popup=1');
    if (!popup) window.open(_url, '_blank');
}



export { authenticate, reauthenticate };