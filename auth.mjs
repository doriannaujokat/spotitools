function authenticate(redirect) {
    //const redirect = `https://spotitools.doriannaujokat.de/`;
    const scopes = [ 'user-library-modify', 'user-library-read', 'playlist-read-collaborative', 'playlist-read-private' ];
    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.set('response_type','token');
    url.searchParams.set('client_id','2f6dd05e9cf04a878303c1d4b6a82666');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('redirect_uri', `${window.location.protocol}//${window.location.host}/`);
    url.searchParams.set('show_dialog', 'false');
    localStorage.setItem('redirect_uri',redirect??window.location.toString());
    window.location.assign(url.toString());
}



export { authenticate };