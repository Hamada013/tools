/* A short play break between the games of the automatic route.
 * One random scene the child can touch (stars shine, bubbles pop, flowers spin, a school of fish
 * scatters) around a plain circle with turning rings. Tapping the circle starts the next game;
 * the tap also lets the browser play sound on this page. Drawn shapes only, no emoji.
 *   VocInterlude.show(then, { scene })   shows the break, calls then() after the circle is tapped
 *   VocInterlude.ringButton(label)       the circle with rings, for other "tap to go on" screens */
((root) => {
    'use strict';
    const SCENES = ['stars', 'bubbles', 'flowers', 'fish'];
    const LAST = 'voc-interlude-last';
    const random = (min, max) => min + Math.random() * (max - min);
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const still = () => root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const STAR = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3l5 11 12 1.4-9 8.2 2.6 12L20 29.5 9.4 35.6 12 23.6 3 15.4 15 14z" fill="currentColor" stroke="#e0a800" stroke-width="1.5" stroke-linejoin="round"/><circle cx="16" cy="18" r="1.6" fill="#7a5a00"/><circle cx="24" cy="18" r="1.6" fill="#7a5a00"/><path d="M17 22.5q3 2.4 6 0" fill="none" stroke="#7a5a00" stroke-width="1.3" stroke-linecap="round"/></svg>';
    const BUBBLE = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="currentColor" fill-opacity=".28" stroke="currentColor" stroke-width="1.6"/><path d="M10 15a11 11 0 0 1 8-7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="27" cy="12" r="2" fill="#fff"/></svg>';
    const FLOWER = '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="currentColor" stroke="#0000001f" stroke-width="1">' + [0, 72, 144, 216, 288].map(a => `<ellipse cx="20" cy="9.5" rx="6" ry="8.5" transform="rotate(${a} 20 20)"/>`).join('') + '</g><circle cx="20" cy="20" r="6" fill="#ffd34d" stroke="#e0a800" stroke-width="1.2"/></svg>';
    const FISH = '<svg viewBox="0 0 48 30" aria-hidden="true"><path d="M8 15 1 6v18z" fill="currentColor" stroke="#0000002a" stroke-width="1"/><ellipse cx="25" cy="15" rx="17" ry="11" fill="currentColor" stroke="#0000002a" stroke-width="1"/><path d="M24 5q4 4 0 9" fill="none" stroke="#ffffff99" stroke-width="2" stroke-linecap="round"/><circle cx="34" cy="12.5" r="3.2" fill="#fff"/><circle cx="35" cy="12.5" r="1.7" fill="#26323a"/><path d="M37 18.5q2 1.5 4 0" fill="none" stroke="#26323a" stroke-width="1.2" stroke-linecap="round"/></svg>';
    const COLORS = {
        stars: ['#ffd84d', '#ffe57a', '#ffcf33'],
        bubbles: ['#38bdf8', '#7dd3fc', '#a5b4fc', '#5eead4'],
        flowers: ['#f9a8d4', '#fda4af', '#c4b5fd', '#fdba74', '#93c5fd'],
        fish: ['#fb923c', '#f472b6', '#38bdf8', '#facc15', '#4ade80']
    };

    function ringButton(label = 'نكمل') {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'ring-go'; button.setAttribute('aria-label', label); button.title = label;
        button.innerHTML = '<span class="ring-go-ring r1" aria-hidden="true"></span><span class="ring-go-ring r2" aria-hidden="true"></span><span class="ring-go-ring r3" aria-hidden="true"></span><span class="ring-go-ring r4" aria-hidden="true"></span><span class="ring-go-core" aria-hidden="true"></span>';
        return button;
    }

    function item(svg, color, className) {
        const node = document.createElement('span');
        node.className = `interlude-item ${className}`; node.style.color = color; node.innerHTML = svg; node.setAttribute('aria-hidden', 'true');
        return node;
    }
    // Keep things away from the circle in the middle so it stays easy to find.
    function spot() {
        for (let tries = 0; tries < 20; tries++) {
            const x = random(4, 92), y = random(6, 90);
            if (Math.hypot(x - 50, (y - 50) * 1.2) > 22) return { x, y };
        }
        return { x: random(4, 20), y: random(6, 90) };
    }
    const place = (node, { x, y }) => { node.style.left = `${x}%`; node.style.top = `${y}%`; };

    const build = {
        stars(field) {
            for (let i = 0; i < 14; i++) {
                const star = item(STAR, pick(COLORS.stars), 'interlude-star'); place(star, spot());
                star.style.setProperty('--size', `${random(34, 64)}px`); star.style.animationDelay = `${random(-4, 0)}s`; star.style.animationDuration = `${random(3, 5.5)}s`;
                field.append(star);
            }
            return (target, x, y) => {
                const star = target.closest('.interlude-star'); if (!star) return;
                star.classList.remove('shine'); void star.offsetWidth; star.classList.add('shine');
                sparkle(field, x, y, '#ffd84d');
            };
        },
        bubbles(field) {
            const spawn = (delay = random(-9, 0)) => {
                const bubble = item(BUBBLE, pick(COLORS.bubbles), 'interlude-bubble');
                bubble.style.left = `${spot().x}%`; bubble.style.setProperty('--size', `${random(40, 84)}px`); bubble.style.setProperty('--rest', `${spot().y}%`);
                bubble.style.animationDuration = `${random(7, 11)}s`; bubble.style.animationDelay = `${delay}s`;
                field.append(bubble); return bubble;
            };
            for (let i = 0; i < 12; i++) spawn();
            return (target) => {
                const bubble = target.closest('.interlude-bubble'); if (!bubble || bubble.classList.contains('pop')) return;
                const box = bubble.getBoundingClientRect(), fieldBox = field.getBoundingClientRect();
                const burst = document.createElement('span'); burst.className = 'interlude-burst'; burst.style.color = bubble.style.color; burst.setAttribute('aria-hidden', 'true');
                burst.style.left = `${box.left - fieldBox.left + box.width / 2}px`; burst.style.top = `${box.top - fieldBox.top + box.height / 2}px`; burst.style.setProperty('--size', `${box.width}px`);
                field.append(burst); setTimeout(() => burst.remove(), 600);
                bubble.remove(); setTimeout(() => field.isConnected && spawn(0), 700);
            };
        },
        flowers(field) {
            for (let i = 0; i < 12; i++) {
                const flower = item(FLOWER, pick(COLORS.flowers), 'interlude-flower'); place(flower, spot());
                flower.style.setProperty('--size', `${random(44, 76)}px`); flower.style.animationDelay = `${random(-4, 0)}s`;
                field.append(flower);
            }
            return (target, x, y) => {
                const flower = target.closest('.interlude-flower'); if (!flower) return;
                flower.classList.remove('spin'); void flower.offsetWidth; flower.classList.add('spin');
                sparkle(field, x, y, flower.style.color);
            };
        },
        fish(field) {
            const school = document.createElement('div'); school.className = 'interlude-school'; school.setAttribute('aria-hidden', 'true');
            school.style.top = `${pick([14, 22, 64, 72])}%`;
            const fishes = [];
            for (let row = 0; row < 3; row++) for (let col = 0; col < 4 - (row % 2); col++) {
                const fish = item(FISH, pick(COLORS.fish), 'interlude-fish');
                fish.style.left = `${col * 78 + (row % 2) * 39}px`; fish.style.top = `${row * 54}px`; fish.style.animationDelay = `${random(-1.5, 0)}s`;
                school.append(fish); fishes.push(fish);
            }
            field.append(school);
            // A few lone fish elsewhere, so there is always something to touch.
            for (let i = 0; i < 4; i++) {
                const lone = document.createElement('div'); lone.className = 'interlude-school lone'; lone.setAttribute('aria-hidden', 'true');
                lone.style.top = `${pick([8, 34, 44, 84])}%`; lone.style.animationDuration = `${random(16, 24)}s`; lone.style.animationDelay = `${random(-20, 0)}s`;
                const fish = item(FISH, pick(COLORS.fish), 'interlude-fish'); lone.append(fish); fishes.push(fish); field.append(lone);
            }
            let timer;
            return (target, x, y) => {
                const near = fishes.filter(fish => { const b = fish.getBoundingClientRect(); return Math.hypot(b.left + b.width / 2 - x, b.top + b.height / 2 - y) < 220; });
                if (!near.length) return;
                for (const fish of near) {
                    const b = fish.getBoundingClientRect(), dx = b.left + b.width / 2 - x, dy = b.top + b.height / 2 - y, d = Math.hypot(dx, dy) || 1;
                    fish.style.setProperty('--sx', `${(dx / d) * random(90, 160)}px`); fish.style.setProperty('--sy', `${(dy / d) * random(70, 130)}px`);
                    fish.classList.add('scatter');
                }
                clearTimeout(timer); timer = setTimeout(() => near.forEach(fish => fish.classList.remove('scatter')), 1300);
            };
        }
    };

    function sparkle(field, x, y, color) {
        if (still()) return;
        const box = field.getBoundingClientRect();
        for (let i = 0; i < 7; i++) {
            const dot = document.createElement('span'); dot.className = 'interlude-sparkle'; dot.setAttribute('aria-hidden', 'true');
            const angle = (i / 7) * Math.PI * 2;
            dot.style.left = `${x - box.left}px`; dot.style.top = `${y - box.top}px`; dot.style.background = color;
            dot.style.setProperty('--dx', `${Math.cos(angle) * 46}px`); dot.style.setProperty('--dy', `${Math.sin(angle) * 46}px`);
            field.append(dot); setTimeout(() => dot.remove(), 700);
        }
    }

    function chooseScene(scene) {
        if (SCENES.includes(scene)) return scene;
        let last = null; try { last = root.sessionStorage.getItem(LAST); } catch {}
        const next = pick(SCENES.filter(name => name !== last));
        try { root.sessionStorage.setItem(LAST, next); } catch {}
        return next;
    }

    function show(then, options = {}) {
        const scene = chooseScene(options.scene);
        const layer = document.createElement('div');
        layer.className = 'interlude'; layer.dataset.scene = scene; layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-modal', 'true'); layer.setAttribute('aria-label', options.label || 'استراحة قصيرة');
        const field = document.createElement('div'); field.className = 'interlude-field';
        const react = build[scene](field);
        const go = ringButton(options.label || 'نكمل');
        layer.append(field, go);
        field.addEventListener('pointerdown', event => react(event.target, event.clientX, event.clientY));
        let done = false;
        go.addEventListener('click', () => { if (done) return; done = true; layer.classList.add('leaving'); setTimeout(() => layer.remove(), still() ? 0 : 220); then?.(); });
        document.body.append(layer); go.focus({ preventScroll: true });
        return layer;
    }

    root.VocInterlude = { show, ringButton, SCENES };
})(globalThis);
