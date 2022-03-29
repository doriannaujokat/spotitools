(async () => {
    const { Spotify } = await import('/spotify.js');
    const { authenticate, reauthenticate } = await import('/auth.mjs');
    let spotify;

    const referrer = document.referrer !== '' ? new URL(document.referrer) : undefined;

    if (window.location.hash) {
        const par = new URLSearchParams(window.location.hash.substring(1));
        if (par.has('access_token')) {
            localStorage.setItem('token', par.get('access_token'));
            const redirect = localStorage.getItem('redirect_uri');
            localStorage.removeItem('redirect_uri');
            if (window.opener) window.close();
            else window.location.replace(redirect ?? '/');
            return;
        }
    } else if (window.location.search) {
        const par = new URLSearchParams(window.location.search);
        if (par.has('error')) {
            if (window.opener && referrer?.host === 'accounts.spotify.com') window.close();
        }
    }

    window.addEventListener('storage', (ev) => {
        if (ev.key === 'token') {
            spotify?.updateToken(ev.newValue);
            spotify?.ApiFetch('/me').then(async resp => {
                document.getElementById('account-image').src = resp.images[0]?.url;
                document.getElementById('account-name').innerText = resp.display_name;
            }).catch(error => {
                if(error.SPOTIFY_ERROR === 'INVALID_TOKEN') {
                    document.getElementById('account-image').src = "";
                    document.getElementById('account-name').innerText = "Not logged in";
                }
            });
        }
    });

    const prepareAccount = async () => {
        const token = localStorage.getItem('token');
        spotify = Spotify.global = new Spotify(token);
        spotify.ApiFetch('/me').then(async resp => {
            document.getElementById('account-image').src = resp.images[0]?.url;
            document.getElementById('account-name').innerText = resp.display_name;
        }).catch(error => {
            if(error.SPOTIFY_ERROR === 'INVALID_TOKEN') {
                authenticate();
            }
        });

        const accDom = document.getElementById('account');
        document.getElementById('account').addEventListener('click', () => {
            if (accDom.hasAttribute('popout')) {
                accDom.popout.close();
                return;
            }
            const popout = document.createElement('div');
            popout.classList.add('popout');
            accDom.parentElement.append(popout);
            accDom.setAttribute('popout','');
            accDom.popout = {close: () => {
                    accDom.removeAttribute('popout');
                    accDom.popout.dom.remove();
                    document.removeEventListener('click', accDom.popout.close);
                    delete accDom.popout;
                }, dom: popout};
            setTimeout(() => document.addEventListener('click', accDom.popout.close, {once: true, capture: false, passive: true}),50);

            const logout = document.createElement('button');
            logout.innerText = "Logout";
            logout.addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.replace('/login.html');
            });
            popout.append(logout);
        });
    };
    const prepareMenubar = async () => {
        const menubar = document.getElementById('app-menubar');
        const menubar_collapse = document.getElementById('app-menubar-collapse');
        const menubar_resize = document.getElementById('app-menubar-resize');
        if (localStorage.getItem('menubar-w')) menubar.style.width = `${localStorage.getItem('menubar-w')}px`;
        if ((localStorage.getItem('menubar-v')??'true') === 'false') {
            menubar.style.transition = "none";
            menubar_collapse.style.transition = "none";
            menubar.setAttribute('collapsed','');
            menubar_collapse.setAttribute('collapsed','');
            menubar.offsetWidth;
            menubar_collapse.offsetWidth;
            menubar.style.transition = null;
            menubar_collapse.style.transition = null;
        }
        menubar_collapse.addEventListener('click', () => {
            menubar.toggleAttribute('collapsed');
            menubar_collapse.toggleAttribute('collapsed');
            localStorage.setItem('menubar-v', (!menubar.hasAttribute('collapsed')).toString());
        });
        menubar_resize.addEventListener('mousedown', (e) => {
            e.preventDefault();
            /**
             * @param {MouseEvent} e
             */
            const mouseCallback = (e) => {
                menubar.style.width = `${e.x}px`; // TODO Check and optimize performance?
                localStorage.setItem('menubar-w',e.x.toString());
            };
            document.addEventListener('mouseup', (e) => {
                document.removeEventListener('mousemove', mouseCallback);
            }, {passive: true, capture: true, once: true});
            document.addEventListener('mousemove', mouseCallback, {passive: true, capture: false, once: false});
        }, {passive: false, capture: true, once: false});
    };

    const prepare = async () => {
        prepareAccount();
        prepareMenubar();
    };

    if (document.readyState !== "loading") {
        prepare();
    } else {
        document.addEventListener('DOMContentLoaded', prepare);
    }

})();