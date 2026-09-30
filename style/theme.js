/* Light / dark theme switcher.
   - Light is the default (the original look).
   - The choice is saved in localStorage under the key "theme".
   - This file is loaded in the <head> so the saved theme is applied
     before the page is drawn (no white flash). */
(function () {
    var KEY = 'theme';
    var root = document.documentElement;
    var timer;

    function saved() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    function apply(mode) {
        root.classList.toggle('dark', mode === 'dark');
        root.setAttribute('data-theme', mode);
    }

    apply(saved() === 'dark' ? 'dark' : 'light');

    document.addEventListener('DOMContentLoaded', function () {
        var buttons = document.querySelectorAll('.theme-toggle');
        var meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);

        function sync() {
            var dark = root.classList.contains('dark');
            var label = dark ? 'Világos mód bekapcsolása' : 'Sötét mód bekapcsolása';
            buttons.forEach(function (b) {
                b.setAttribute('aria-pressed', dark ? 'true' : 'false');
                b.setAttribute('aria-label', label);
                b.setAttribute('title', label);
            });
            meta.content = dark ? '#0C0A07' : '#FBF9F5';
        }

        buttons.forEach(function (b) {
            b.addEventListener('click', function () {
                var next = root.classList.contains('dark') ? 'light' : 'dark';
                root.classList.add('theme-anim');      /* enables the smooth colour fade */
                apply(next);
                try { localStorage.setItem(KEY, next); } catch (e) { }
                sync();
                clearTimeout(timer);
                timer = setTimeout(function () { root.classList.remove('theme-anim'); }, 650);
            });
        });

        /* keep other open tabs in sync */
        window.addEventListener('storage', function (e) {
            if (e.key === KEY) { apply(e.newValue === 'dark' ? 'dark' : 'light'); sync(); }
        });

        sync();
    });
})();
