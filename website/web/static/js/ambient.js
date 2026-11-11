/**
 * ambient.js — the admin-only "warm" theme (css/ambient.css, tokens in core.css).
 *
 * Not in the theme picker: an admin toggles it with three quick clicks on the
 * footer version (#footer-version, admins only, base.html). A "Back to normal"
 * button restores the previous theme. window.ambPlay('<scenario>') plays one
 * scenario right away.
 */
(function () {
    const html = document.documentElement
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const PREV_KEY = 'theme-before-warm'
    const SVG_NS = 'http://www.w3.org/2000/svg'

    const T = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob('eyJsYWJlbCI6ICJGbHlpbmcgU3BhZ2hldHRpIE1vbnN0ZXIiLCAicnVsZVRpdGxlIjogIknigJlkIFJlYWxseSBSYXRoZXIgWW91IERpZG7igJl0IiwgInF1aXBUaXRsZSI6ICJIaXMgTm9vZGxpbmVzcyBzYXlzIiwgInNpZ24iOiAiUuKAmWFtZW4uIiwgImZvb3RlciI6ICJUb3VjaGVkIGJ5IEhpcyBOb29kbHkgQXBwZW5kYWdlICZtaWRkb3Q7IDxiPlLigJlhbWVuPC9iPiIsICJvbiI6ICJZb3UgaGF2ZSBiZWVuIHRvdWNoZWQgYnkgSGlzIE5vb2RseSBBcHBlbmRhZ2UuIFLigJlhbWVuLiIsICJvZmYiOiAiVGhlIE1vbnN0ZXIgcmV0dXJucyB0byBIaXMgYmVlciB2b2xjYW5vLiBCYWNrIHRvIHdvcmsuIiwgInBva2VkIjogIlN0b3AgcG9raW5nIG1lLiBJ4oCZbSBhbCBkZW50ZSBlbm91Z2ggYXMgaXQgaXMuIiwgInJ1bGVzIjogWyJJJ2QgcmVhbGx5IHJhdGhlciB5b3UgZGlkbid0IHNoYXJlIFRMUDpSRUQgaW4gYSBwdWJsaWMgY2hhbm5lbC4iLCAiSSdkIHJlYWxseSByYXRoZXIgeW91IGRpZG4ndCBzaGlwIGFuIGluZGljYXRvciB3aXRob3V0IGl0cyBjb250ZXh0LiIsICJJJ2QgcmVhbGx5IHJhdGhlciB5b3UgZGlkbid0IHBhc3RlIHlvdXIgQVBJIGtleSBpbiBhIHRpY2tldC4iLCAiSSdkIHJlYWxseSByYXRoZXIgeW91IGRpZG4ndCBhdHRyaWJ1dGUgYW4gaW50cnVzaW9uIHRvIGEgbmF0aW9uIG9uIG9uZSBJUCBhZGRyZXNzLiIsICJJJ2QgcmVhbGx5IHJhdGhlciB5b3UgZGlkbid0IGNvbnZlcnQgYSBidW5kbGUgYW5kIG5ldmVyIGxvb2sgYXQgdGhlIHJlc3VsdC4iLCAiSSdkIHJlYWxseSByYXRoZXIgeW91IGRpZG4ndCBjYWxsIGl0IGFuIEFQVCBqdXN0IGJlY2F1c2UgaXQgd2FzIHNjYXJ5LiIsICJJJ2QgcmVhbGx5IHJhdGhlciB5b3UgZGlkbid0IHN0cmlwIHRoZSB0aW1lc3RhbXBzLiBGaXJzdCBzZWVuIG1hdHRlcnMuIiwgIkknZCByZWFsbHkgcmF0aGVyIHlvdSBkaWRuJ3QgdHVybiBvZmYgVExTIFwianVzdCBmb3IgdGhlIHRlc3RcIi4iXSwgInF1aXBzIjogWyJJIGJvaWxlZCB5b3VyIHRocmVhdCBmZWVkLiA5MCUgZmFsc2UgcG9zaXRpdmVzLCAxMCUgYWwgZGVudGUuIiwgIlNUSVggdG8gTUlTUCwgTUlTUCB0byBTVElY4oCmIEkganVzdCBnbyBmcm9tIHBvdCB0byBwbGF0ZS4iLCAiVExQOkNBUkJPTkFSQSDigJQgc2hhcmUgb25seSB3aXRoIHBlb3BsZSB3aG8gYnJpbmcgZGVzc2VydC4iLCAiSSBkb24ndCBkbyB0aHJlYXQgaHVudGluZy4gSSBkbyB0aHJlYXQgc2ltbWVyaW5nLiIsICJZb3VyIFlBUkEgcnVsZSBtYXRjaGVkIG15IG5vb2RsZXMuIEZhbHNlIHBvc2l0aXZlLCBJIHByb21pc2UuIiwgIkRvbid0IGFuZ2VyIG1lLiBJIGhhdmUgbW9yZSBhcHBlbmRhZ2VzIHRoYW4geW91IGhhdmUgYW5hbHlzdHMuIiwgIlBhdGNoIFR1ZXNkYXk/IFVwIHRoZXJlLCBldmVyeSBkYXkgaXMgUGFzdGEgVHVlc2RheS4iLCAiU29tZW9uZSBwaW5nZWQgbWUuIElDTVAgY291bnRzIGFzIHByYXllciwgcmlnaHQ/IiwgIkkgZmxldyBvdmVyIHlvdXIgbmV0d29yay4gTmljZSBzZWdtZW50YXRpb24uIFNoYW1lIGFib3V0IHRoZSBkZWZhdWx0IGNyZWRzLiIsICJEZXBsb3lpbmcgb24gYSBGcmlkYXk/IEJvbGQuIEknbGwgcHJheSB0byBNeXNlbGYgZm9yIHlvdS4iLCAiQ29ycmVsYXRpb24gaXMgbm90IGNhdXNhdGlvbi4gQnV0IHNhdWNlIGFuZCBtZWF0YmFsbHM/IEFsd2F5cyBjb3JyZWxhdGVkLiIsICJIZWF2ZW4gaGFzIGEgYmVlciB2b2xjYW5vLiBZb3VyIFNPQyBoYXMgYSBjb2ZmZWUgbWFjaGluZS4gQ2xvc2UgZW5vdWdoLiIsICJJJ3ZlIHNlZW4geW91ciBwYXNzd29yZCBwb2xpY3kuIEknbSBub3QgYW5ncnksIGp1c3QgZGlzYXBwb2ludGVkLiBBbmQgaHVuZ3J5LiIsICJaZXJvLWRheT8gSSd2ZSBiZWVuIGZseWluZyBmb3IgemVybyBkYXlzIGFuZCBJJ20gYWxyZWFkeSB0aXJlZC4iLCAiUGlyYXRlcyBmb3VnaHQgZ2xvYmFsIHdhcm1pbmcuIFdobyBmaWdodHMgeW91ciBzdGFsZSBJT0NzPyIsICJJJ20gbm90IGEgYnVnLCBJJ20gYSBmZWF0dXJlLiBBIGRlbGljaW91cyBvbmUuIiwgIktlZXAgY2FsbSBhbmQgY29ycmVsYXRlLiIsICJFdmVyeSBpbmNpZGVudCByZXBvcnQgaXMgYmV0dGVyIHdpdGggcGFybWVzYW4gb24gdG9wLiIsICJNeSBvbmx5IGluZGljYXRvciBvZiBjb21wcm9taXNlIGlzIG92ZXJjb29rZWQgcGFzdGEuIiwgIkxlYXN0IHByaXZpbGVnZSwgbWF4aW11bSBzYXVjZS4iXX0='), c => c.charCodeAt(0))))

    let flightTimer = null
    let mounted = false

    const wanted = () => html.classList.contains('warm-mode')

    // ── Flyer ───────────────────────────────────────────────────────

    const FLYER_SVG = `
<svg viewBox="0 0 200 130" xmlns="${SVG_NS}" role="img" aria-label="${T.label}">
  <g class="amb-arm amb-arm--l">
    <path class="amb-line" d="M70,70 C55,60 45,82 30,72 S12,60 4,70"/>
    <path class="amb-line amb-line--dark" d="M72,78 C58,88 44,74 30,90 S10,92 2,100"/>
  </g>
  <g class="amb-arm amb-arm--r">
    <path class="amb-line" d="M130,70 C145,60 155,82 170,72 S188,60 196,70"/>
    <path class="amb-line amb-line--dark" d="M128,78 C142,88 156,74 170,90 S190,92 198,100"/>
  </g>
  <g class="amb-arm amb-arm--d">
    <path class="amb-line" d="M92,88 C86,100 98,108 90,124"/>
    <path class="amb-line amb-line--dark" d="M108,88 C114,100 102,110 112,126"/>
    <path class="amb-line" d="M100,90 C104,102 96,112 101,128"/>
  </g>
  <g>
    <path class="amb-line" d="M68,72 C74,52 96,94 104,64 S128,56 132,74 C120,92 98,62 86,86 S66,90 68,72Z"/>
    <path class="amb-line amb-line--dark" d="M74,66 C90,80 104,50 118,70 S132,86 112,88 C98,90 92,70 78,84"/>
    <path class="amb-line" d="M80,60 C96,58 110,90 124,64"/>
  </g>
  <g class="amb-eye-g">
    <path class="amb-stalk" d="M92,58 C88,42 92,30 84,16"/>
    <circle class="amb-eye" cx="84" cy="12" r="8"/><circle class="amb-pupil" cx="86" cy="13" r="3.4"/>
  </g>
  <g class="amb-eye-g amb-eye-g--2">
    <path class="amb-stalk" d="M108,58 C112,42 108,30 116,16"/>
    <circle class="amb-eye" cx="116" cy="12" r="8"/><circle class="amb-pupil" cx="118" cy="13" r="3.4"/>
  </g>
</svg>`

    // Flight scenarios (css/warm.css .amb-flight[data-scenario=...])
    //   cross   — a calm crossing, bobbing along
    //   loop    — a loop-the-loop in the middle of the screen
    //   peek    — rises from the bottom edge, looks around, sinks back
    //   dive    — swoops down from a top corner to the other side
    //   spin    — crosses spinning
    //   rain    — crosses slowly, dropping things on the page
    //   touch   — comes to touch the logo
    const SCENARIOS = ['cross', 'loop', 'peek', 'dive', 'spin', 'rain', 'touch']
    const DURATIONS = { cross: 24, loop: 16, peek: 9, dive: 7, spin: 14, rain: 30, touch: 10 }
    let lastScenario = null

    function fly(forced) {
        if (!wanted() || reducedMotion || document.querySelector('.amb-flight')) return schedule()
        if (!forced && document.hidden) return schedule()
        const pool = SCENARIOS.filter(x => x !== lastScenario)
        const scenario = forced || pool[Math.floor(Math.random() * pool.length)]
        lastScenario = scenario
        const el = document.createElement('div')
        el.className = 'amb-flight' + (Math.random() < 0.5 && scenario !== 'touch' ? ' amb-flight--rtl' : '')
        el.dataset.scenario = scenario
        el.style.top = `${80 + Math.random() * Math.max(60, window.innerHeight * 0.35)}px`
        el.style.setProperty('--dur', `${DURATIONS[scenario]}s`)
        el.style.setProperty('--peek-x', `${10 + Math.random() * 70}vw`)
        el.innerHTML = `<div class="amb-flight__bob">${FLYER_SVG}</div>`
        el.querySelector('svg').addEventListener('click', e => speak(e.clientX, e.clientY))
        el.addEventListener('animationend', e => { if (e.target === el) el.remove() })
        document.body.appendChild(el)
        if (scenario === 'rain') rain(el)
        if (scenario === 'touch') setTimeout(touchLogo, DURATIONS.touch * 450)
        schedule()
    }

    // Drops falling from under the flyer while it crosses
    function rain(el) {
        let n = 0
        const drop = setInterval(() => {
            if (!el.isConnected || n++ > 14) return clearInterval(drop)
            const r = el.getBoundingClientRect()
            const d = document.createElementNS(SVG_NS, 'svg')
            d.setAttribute('class', 'amb-drop')
            d.setAttribute('viewBox', '0 0 14 40')
            d.setAttribute('aria-hidden', 'true')
            d.innerHTML = '<path class="amb-line" d="M7,0 C0,10 14,18 7,26 S2,36 7,40"/>'
            d.style.left = `${r.left + r.width * (0.3 + Math.random() * 0.4)}px`
            d.style.top = `${r.bottom - 10}px`
            d.addEventListener('animationend', () => d.remove())
            document.body.appendChild(d)
        }, 1500)
    }

    function touchLogo() {
        const logo = document.querySelector('.top-brand img')
        if (!logo || !wanted()) return
        logo.classList.add('amb-touched')
        setTimeout(() => logo.classList.remove('amb-touched'), 1600)
    }

    function schedule(first) {
        clearTimeout(flightTimer)
        if (!wanted()) return
        flightTimer = setTimeout(() => fly(), first ? 2500 : (40 + Math.random() * 40) * 1000)
    }

    let pokes = 0, pokeTimer = null
    const pick = list => list[Math.floor(Math.random() * list.length)]

    function speak(x, y) {
        clearTimeout(pokeTimer)
        pokeTimer = setTimeout(() => { pokes = 0 }, 4000)
        const rule = ++pokes < 5 && Math.random() < 0.35
        const msg = pokes >= 5 ? (pokes = 0, T.poked) : (rule ? pick(T.rules) : pick(T.quips))
        document.querySelectorAll('.amb-bubble').forEach(b => b.remove())
        const b = document.createElement('div')
        b.className = 'amb-bubble'
        b.setAttribute('role', 'status')
        const title = document.createElement('span')
        title.className = 'amb-bubble__title'
        title.textContent = 'I’d Really Rather You Didn’t'
        const text = document.createElement('span')
        text.textContent = msg
        const sign = document.createElement('span')
        sign.className = 'amb-bubble__sign'
        sign.textContent = 'R’amen.'
        b.append(title, text, sign)
        document.body.appendChild(b)
        const w = b.offsetWidth, h = b.offsetHeight
        b.style.left = `${Math.min(Math.max(16, x - w / 2), window.innerWidth - w - 16)}px`
        b.style.top = `${Math.min(y + 24, window.innerHeight - h - 16)}px`
        setTimeout(() => b.remove(), 7000)
    }

    // ── Static decorations ────────────────────────────────────────────

    function dangle() {
        const el = document.createElementNS(SVG_NS, 'svg')
        el.setAttribute('class', 'amb-dangle')
        el.setAttribute('viewBox', '0 0 26 54')
        el.setAttribute('aria-hidden', 'true')
        el.innerHTML = '<path class="amb-line" d="M13,0 C4,10 22,18 12,28 S6,44 14,50"/>' +
            '<circle class="amb-ball" cx="14" cy="50" r="3.5"/>'
        return el
    }

    function mount() {
        if (mounted) return
        mounted = true
        const brand = document.querySelector('.top-brand')
        if (brand) {
            if (getComputedStyle(brand).position === 'static') brand.style.position = 'relative'
            brand.appendChild(dangle())
        }
        const footer = document.querySelector('footer.custom-footer')
        if (footer) {
            const r = document.createElement('div')
            r.className = 'amb-footline'
            r.innerHTML = T.footer
            footer.appendChild(r)
        }
        const back = document.createElement('button')
        back.type = 'button'
        back.className = 'amb-back'
        back.innerHTML = '<i class="fas fa-rotate-left"></i> Back to normal'
        back.addEventListener('click', toggle)
        document.body.appendChild(back)
        schedule(true)
    }

    function unmount() {
        if (!mounted) return
        mounted = false
        clearTimeout(flightTimer)
        document.querySelectorAll('.amb-dangle, .amb-footline, .amb-flight, .amb-bubble, .amb-back, .amb-drop').forEach(n => n.remove())
    }

    const sync = () => (wanted() ? mount() : unmount())

    function toast(msg) {
        document.querySelectorAll('.amb-toast').forEach(t => t.remove())
        const t = document.createElement('div')
        t.className = 'amb-toast'
        t.textContent = msg
        document.body.appendChild(t)
        setTimeout(() => t.remove(), 3500)
    }

    // ── The secret switch: three clicks on the footer version ─────────

    function toggle() {
        if (typeof window.ctiApplyTheme !== 'function') return
        if (wanted()) {
            let prev = 'light'
            try { prev = localStorage.getItem(PREV_KEY) || 'light' } catch (e) { /* storage blocked */ }
            window.ctiApplyTheme(prev)
            toast(T.off)
        } else {
            const current = ['light', 'dark', 'dusk', 'ocean', 'christmas']
                .find(t => html.classList.contains(t + '-mode')) || 'light'
            try { localStorage.setItem(PREV_KEY, current) } catch (e) { /* storage blocked */ }
            window.ctiApplyTheme('warm')
            toast(T.on)
        }
    }

    function wireSwitch() {
        const btn = document.getElementById('footer-version')
        if (!btn) return
        let clicks = 0, timer = null
        btn.addEventListener('click', () => {
            clicks++
            clearTimeout(timer)
            if (clicks >= 3) { clicks = 0; toggle(); return }
            timer = setTimeout(() => { clicks = 0 }, 700)
        })
    }

    window.ambPlay = s => { document.querySelectorAll('.amb-flight').forEach(n => n.remove()); fly(SCENARIOS.includes(s) ? s : undefined) }

    function start() {
        wireSwitch()
        sync()
        html.addEventListener('themechange', sync)
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
    else start()
})()
