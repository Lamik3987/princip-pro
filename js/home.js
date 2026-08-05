import * as THREE from 'three';

(() => {
    'use strict';

    const solutions = {
        electrolysis: {
            number: '01',
            title: 'Электролизные установки',
            lead: 'Автоматизированное получение низкоконцентрированного гипохлорита натрия из поваренной соли непосредственно на объекте.',
            description: 'Подготовленный солевой раствор проходит через электролизёр. Под действием постоянного тока образуется эффективный дезинфицирующий раствор, который автоматически дозируется по показаниям приборов контроля.',
            image: 'images/equipment/index_electrolysis.png',
            specs: [['Производительность', 'по заданию проекта'], ['Концентрация продукта', 'до 8 г/л'], ['Режим работы', 'автоматический'], ['Исполнение', 'модульное / контейнерное']]
        },
        automation: {
            number: '02',
            title: 'АСУ ТП и автоматика',
            lead: 'Полный контроль технологического процесса: от локального шкафа управления до диспетчеризации всего комплекса.',
            description: 'Контроллер собирает данные с датчиков, выполняет заложенные алгоритмы и управляет исполнительными механизмами. Оператор получает мнемосхемы, архив событий, аварий и ключевых параметров.',
            image: 'images/equipment/index_asutp.jpg',
            specs: [['Контроллеры', 'Siemens / ОВЕН / Schneider'], ['Интерфейсы', 'Modbus, Ethernet, RS‑485'], ['Диспетчеризация', 'SCADA / Web HMI'], ['Документация', 'полный комплект ЭД']]
        },
        water: {
            number: '03',
            title: 'Системы водоподготовки',
            lead: 'Комплексные технологические линии для промышленной, питьевой и технической воды с заданными показателями качества.',
            description: 'Состав ступеней определяется анализом исходной воды: механическая и сорбционная фильтрация, обезжелезивание, умягчение, мембранное разделение и финишное обеззараживание.',
            image: 'images/equipment/index_watertreatment.png',
            specs: [['Производительность', 'индивидуальный расчёт'], ['Степень автоматизации', 'до 100%'], ['Технологии', 'фильтрация / RO / UF'], ['Компоновка', 'рамная / блочно‑модульная']]
        }
    };

    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = matchMedia('(max-width: 767px)').matches;
    const header = document.querySelector('[data-header]');
    const menuButton = document.querySelector('.menu-button');
    const nav = document.querySelector('.site-nav');

    const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 30);
    updateHeader();
    addEventListener('scroll', updateHeader, { passive: true });

    menuButton.addEventListener('click', () => {
        const opening = menuButton.getAttribute('aria-expanded') !== 'true';
        menuButton.setAttribute('aria-expanded', String(opening));
        menuButton.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
        nav.classList.toggle('is-open', opening);
        document.body.classList.toggle('modal-open', opening);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.classList.remove('modal-open');
    }));

    const modal = document.querySelector('[data-modal]');
    const panel = modal.querySelector('.modal-panel');
    let lastFocused = null;

    function openModal(key) {
        const data = solutions[key];
        if (!data) return;
        lastFocused = document.activeElement;
        modal.querySelector('[data-modal-number]').textContent = data.number;
        modal.querySelector('[data-modal-title]').textContent = data.title;
        modal.querySelector('[data-modal-lead]').textContent = data.lead;
        modal.querySelector('[data-modal-description]').textContent = data.description;
        const image = modal.querySelector('[data-modal-image]');
        image.src = data.image;
        image.alt = data.title;
        modal.querySelector('[data-modal-specs]').innerHTML = data.specs.map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`).join('');
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        requestAnimationFrame(() => panel.focus());
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('[data-solution]').forEach(card => card.addEventListener('click', () => openModal(card.dataset.solution)));
    modal.querySelectorAll('[data-close-modal]').forEach(element => element.addEventListener('click', closeModal));
    addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
        if (event.key === 'Tab' && modal.classList.contains('is-open')) {
            const focusable = [...modal.querySelectorAll('button, a[href]')];
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });

    const canvas = document.getElementById('water-canvas');
    let renderer;
    let scene;
    let camera;
    let waterMesh;
    let skyMesh;
    const clock = new THREE.Clock();
    const cameraPath = { progress: 0 };
    const pointer = { x: 0, y: 0 };
    const scrollState = {
        energy: 0,
        velocity: 0,
        sampledY: scrollY
    };

    try {
        initWaterScene();
        animateWater();
    } catch (error) {
        console.error('Three.js water initialization failed:', error);
        canvas.classList.add('water-fallback');
    }

    function initWaterScene() {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: !isMobile,
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 1.7));
        renderer.setSize(innerWidth, innerHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x063348, 0.0042);

        camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 1600);
        camera.position.set(1.5, isMobile ? 7.2 : 7.8, 17);

        const sunDirection = new THREE.Vector3(0.34, 0.34, -0.88).normalize();
        const skyGeometry = new THREE.SphereGeometry(700, 32, 20);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uSunDirection: { value: sunDirection },
                uTopColor: { value: new THREE.Color(0x083a52) },
                uHorizonColor: { value: new THREE.Color(0x359bb2) },
                uBottomColor: { value: new THREE.Color(0x05283a) }
            },
            vertexShader: `
                varying vec3 vWorldDirection;
                void main() {
                    vec4 world = modelMatrix * vec4(position, 1.0);
                    vWorldDirection = normalize(world.xyz - cameraPosition);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uSunDirection;
                uniform vec3 uTopColor;
                uniform vec3 uHorizonColor;
                uniform vec3 uBottomColor;
                varying vec3 vWorldDirection;
                void main() {
                    vec3 ray = normalize(vWorldDirection);
                    float h = ray.y;
                    vec3 color = mix(uBottomColor, uHorizonColor, smoothstep(-0.15, 0.08, h));
                    color = mix(color, uTopColor, smoothstep(0.02, 0.72, h));
                    float sun = max(dot(ray, uSunDirection), 0.0);
                    color += vec3(0.72, 0.9, 0.93) * pow(sun, 36.0) * 0.32;
                    color += vec3(0.6, 0.82, 0.86) * pow(sun, 7.0) * 0.09;
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide,
            depthWrite: false
        });
        skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(skyMesh);

        const segments = isMobile ? 150 : 260;
        const waterGeometry = new THREE.PlaneGeometry(1100, 1100, segments, segments);
        waterGeometry.rotateX(-Math.PI / 2);

        const waterMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uScrollEnergy: { value: 0 },
                uImpulseCenter: { value: 0 },
                uSunDirection: { value: sunDirection },
                uDeepColor: { value: new THREE.Color(0x06344c) },
                uSurfaceColor: { value: new THREE.Color(0x1683a1) },
                uHorizonColor: { value: new THREE.Color(0x43a9bf) },
                uFoamColor: { value: new THREE.Color(0xd4f3f3) }
            },
            vertexShader: `
                #define TAU 6.28318530718

                uniform float uTime;
                uniform float uScrollEnergy;
                uniform float uImpulseCenter;

                varying vec3 vWorldPosition;
                varying vec3 vGeometricNormal;
                varying float vElevation;
                varying float vSlope;

                float hash21(vec2 p) {
                    p = fract(p * vec2(123.34, 456.21));
                    p += dot(p, p + 45.32);
                    return fract(p.x * p.y);
                }

                float valueNoise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    float a = hash21(i);
                    float b = hash21(i + vec2(1.0, 0.0));
                    float c = hash21(i + vec2(0.0, 1.0));
                    float d = hash21(i + vec2(1.0, 1.0));
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }

                float fbm(vec2 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    mat2 rotation = mat2(0.82, -0.57, 0.57, 0.82);
                    for (int i = 0; i < 3; i++) {
                        value += valueNoise(p) * amplitude;
                        p = rotation * p * 2.03 + vec2(7.1, 3.7);
                        amplitude *= 0.5;
                    }
                    return value;
                }

                float directionalWave(vec2 p, vec2 direction, float wavelength, float amplitude, float speed, float phase, float time) {
                    vec2 d = normalize(direction);
                    return sin(dot(p, d) * TAU / wavelength + time * speed + phase) * amplitude;
                }

                float waterHeight(vec2 worldXZ, float time) {
                    vec2 slowDrift = vec2(time * 0.12, -time * 0.075);
                    float warpA = fbm(worldXZ * 0.007 + slowDrift);
                    float warpB = fbm(worldXZ * 0.006 - slowDrift.yx + vec2(18.2, -11.7));
                    vec2 warped = worldXZ + (vec2(warpA, warpB) - 0.5) * 15.0;

                    float calm = 0.0;
                    calm += directionalWave(warped, vec2(1.0, 0.24), 78.0, 0.34, 0.29, 0.73, time);
                    calm += directionalWave(warped, vec2(-0.62, 0.91), 53.0, 0.23, -0.34, 2.41, time);
                    calm += directionalWave(warped, vec2(0.37, -0.96), 37.0, 0.16, 0.43, 4.87, time);
                    calm += directionalWave(warped, vec2(-0.93, -0.31), 27.0, 0.11, -0.52, 1.36, time);
                    calm += directionalWave(warped, vec2(0.76, 0.68), 19.0, 0.065, 0.64, 5.52, time);

                    float organicA = fbm(worldXZ * 0.031 + vec2(time * 0.055, -time * 0.037));
                    float organicB = fbm(worldXZ * 0.067 + vec2(-time * 0.072, time * 0.048) + 31.4);
                    calm += (organicA - 0.5) * 0.58 + (organicB - 0.5) * 0.22;

                    float energy = clamp(uScrollEnergy, 0.0, 1.0);
                    float along = worldXZ.y - uImpulseCenter;
                    float envelope = exp(-along * along / 230.0) * exp(-abs(worldXZ.x) * 0.006);
                    float bentFront = along * 0.31 + sin(worldXZ.x * 0.115 + time * 0.32) * 1.25;
                    float crossedFront = (along * 0.76 + worldXZ.x * 0.64) * 0.23;
                    float pulseA = sin(bentFront - time * (1.12 + energy * 0.34));
                    float pulseB = sin(crossedFront + time * 0.82 + 1.7);
                    float wake = (pulseA * 0.68 + pulseB * 0.32) * envelope * energy * 0.52;

                    float turbulence = (fbm(worldXZ * 0.105 + vec2(time * 0.12, -time * 0.09)) - 0.5);
                    float activeRipple = turbulence * envelope * energy * 0.18;

                    return calm * (1.0 + energy * 0.14) + wake + activeRipple;
                }

                void main() {
                    vec3 baseWorld = (modelMatrix * vec4(position, 1.0)).xyz;
                    float height = waterHeight(baseWorld.xz, uTime);
                    vec3 displaced = position;
                    displaced.y += height;

                    float epsilon = 1.25;
                    float left = waterHeight(baseWorld.xz - vec2(epsilon, 0.0), uTime);
                    float right = waterHeight(baseWorld.xz + vec2(epsilon, 0.0), uTime);
                    float down = waterHeight(baseWorld.xz - vec2(0.0, epsilon), uTime);
                    float up = waterHeight(baseWorld.xz + vec2(0.0, epsilon), uTime);
                    vec3 normal = normalize(vec3(left - right, 2.0 * epsilon, down - up));

                    vec4 world = modelMatrix * vec4(displaced, 1.0);
                    vWorldPosition = world.xyz;
                    vGeometricNormal = normal;
                    vElevation = height;
                    vSlope = 1.0 - normal.y;
                    gl_Position = projectionMatrix * viewMatrix * world;
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform float uScrollEnergy;
                uniform vec3 uSunDirection;
                uniform vec3 uDeepColor;
                uniform vec3 uSurfaceColor;
                uniform vec3 uHorizonColor;
                uniform vec3 uFoamColor;

                varying vec3 vWorldPosition;
                varying vec3 vGeometricNormal;
                varying float vElevation;
                varying float vSlope;

                vec3 skyReflection(vec3 ray) {
                    float h = clamp(ray.y * 0.5 + 0.5, 0.0, 1.0);
                    vec3 sky = mix(vec3(0.035, 0.12, 0.16), vec3(0.12, 0.39, 0.46), smoothstep(0.26, 0.62, h));
                    sky = mix(sky, vec3(0.025, 0.13, 0.19), smoothstep(0.62, 1.0, h));
                    float sun = max(dot(ray, uSunDirection), 0.0);
                    sky += vec3(0.62, 0.82, 0.84) * pow(sun, 100.0) * 0.22;
                    sky += vec3(0.35, 0.6, 0.65) * pow(sun, 18.0) * 0.04;
                    return sky;
                }

                float detailHash(vec2 p) {
                    p = fract(p * vec2(123.34, 456.21));
                    p += dot(p, p + 45.32);
                    return fract(p.x * p.y);
                }

                float detailNoise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    float a = detailHash(i);
                    float b = detailHash(i + vec2(1.0, 0.0));
                    float c = detailHash(i + vec2(0.0, 1.0));
                    float d = detailHash(i + vec2(1.0, 1.0));
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }

                float detailHeight(vec2 p, float time) {
                    mat2 turn = mat2(0.78, -0.63, 0.63, 0.78);
                    float a = detailNoise(p * 0.23 + vec2(time * 0.075, -time * 0.052));
                    float b = detailNoise(turn * p * 0.47 + vec2(-time * 0.11, time * 0.064) + 17.3);
                    float c = detailNoise(p * 0.91 + vec2(time * 0.15, time * 0.09) - 8.7);
                    return a * 0.55 + b * 0.31 + c * 0.14;
                }

                vec2 rippleGradient(vec2 p, float time) {
                    float epsilon = 0.42;
                    float left = detailHeight(p - vec2(epsilon, 0.0), time);
                    float right = detailHeight(p + vec2(epsilon, 0.0), time);
                    float down = detailHeight(p - vec2(0.0, epsilon), time);
                    float up = detailHeight(p + vec2(0.0, epsilon), time);
                    return vec2(right - left, up - down) * 0.36;
                }

                float schlickFresnel(float cosTheta) {
                    float f0 = 0.02;
                    return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
                }

                void main() {
                    float energy = clamp(uScrollEnergy, 0.0, 1.0);
                    float distanceToCamera = distance(vWorldPosition, cameraPosition);
                    vec2 micro = rippleGradient(vWorldPosition.xz, uTime);
                    float distanceFade = mix(1.0, 0.28, smoothstep(48.0, 190.0, distanceToCamera));
                    micro *= distanceFade * (1.0 + energy * 0.75);
                    vec3 normal = normalize(vGeometricNormal + vec3(-micro.x, 0.0, -micro.y));
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    float nDotV = max(dot(normal, viewDirection), 0.0);
                    float fresnel = schlickFresnel(nDotV);

                    vec3 reflectionRay = reflect(-viewDirection, normal);
                    vec3 reflection = skyReflection(reflectionRay);

                    float heightMix = smoothstep(-0.55, 0.7, vElevation);
                    vec3 waterColor = mix(uDeepColor, uSurfaceColor, heightMix * 0.68);
                    float backLight = pow(max(dot(normal, uSunDirection), 0.0), 1.5);
                    waterColor += uSurfaceColor * backLight * 0.11;

                    vec3 reflectedSun = reflect(-uSunDirection, normal);
                    float sunAlignment = max(dot(reflectedSun, viewDirection), 0.0);
                    float broadGlint = pow(sunAlignment, 90.0) * 0.025;
                    float sharpGlint = 0.0;

                    vec3 color = mix(waterColor, reflection, clamp(fresnel * 0.84 + 0.2, 0.0, 0.88));
                    color += vec3(0.73, 0.9, 0.9) * (broadGlint + sharpGlint);

                    float crest = smoothstep(0.48, 0.86, vElevation) * smoothstep(0.025, 0.16, vSlope);
                    float foam = crest * smoothstep(0.28, 0.75, energy) * (0.18 + energy * 0.32);
                    color = mix(color, uFoamColor, foam);

                    float haze = 1.0 - exp(-distanceToCamera * 0.0038);
                    color = mix(color, uHorizonColor * 0.48, haze * 0.36);
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.FrontSide
        });

        waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
        scene.add(waterMesh);

        if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
            gsap.registerPlugin(ScrollTrigger);
            gsap.to(cameraPath, {
                progress: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: 'main',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.25
                }
            });
            gsap.from('.hero-copy > *', {
                y: 34,
                opacity: 0,
                duration: 1.2,
                stagger: 0.12,
                ease: 'power3.out',
                delay: 0.2
            });
            document.querySelectorAll('.flow-statement, .section-heading, .direction-card, .engineering-copy').forEach(element => {
                gsap.from(element, {
                    y: 48,
                    opacity: 0,
                    duration: 0.95,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: element, start: 'top 87%', once: true }
                });
            });
        }

        addEventListener('pointermove', event => {
            pointer.x = (event.clientX / innerWidth - 0.5) * 0.34;
            pointer.y = (event.clientY / innerHeight - 0.5) * 0.2;
        }, { passive: true });

        addEventListener('resize', resizeWaterScene);
    }

    function resizeWaterScene() {
        if (!renderer || !camera) return;
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 1.7));
        renderer.setSize(innerWidth, innerHeight);
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    function animateWater() {
        requestAnimationFrame(animateWater);
        if (!renderer || !scene || !camera || !waterMesh) return;

        const delta = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;
        const frameScroll = scrollY - scrollState.sampledY;
        scrollState.sampledY = scrollY;
        const instantVelocity = frameScroll / Math.max(delta, 1 / 120);
        const velocityResponse = 1 - Math.exp(-delta * 7.5);
        scrollState.velocity += (instantVelocity - scrollState.velocity) * velocityResponse;
        if (Math.abs(frameScroll) < 0.05) scrollState.velocity *= Math.exp(-delta * 5.2);

        const targetEnergy = prefersReducedMotion
            ? 0
            : THREE.MathUtils.smoothstep(Math.abs(scrollState.velocity), 35, 920);
        const energyRate = targetEnergy > scrollState.energy ? 4.6 : 2.8;
        scrollState.energy += (targetEnergy - scrollState.energy) * (1 - Math.exp(-delta * energyRate));

        const material = waterMesh.material;
        material.uniforms.uTime.value = prefersReducedMotion ? elapsed * 0.12 : elapsed;
        material.uniforms.uScrollEnergy.value = prefersReducedMotion ? 0 : scrollState.energy;

        const progress = cameraPath.progress;
        const targetX = Math.sin(progress * Math.PI * 0.82) * 4.2 + pointer.x * 2.2;
        const targetY = THREE.MathUtils.lerp(isMobile ? 7.2 : 7.8, isMobile ? 8.2 : 9.1, progress) - pointer.y;
        const targetZ = THREE.MathUtils.lerp(17, -118, progress);
        const cameraResponse = 1 - Math.exp(-delta * 2.3);
        camera.position.x += (targetX - camera.position.x) * cameraResponse;
        camera.position.y += (targetY - camera.position.y) * cameraResponse;
        camera.position.z += (targetZ - camera.position.z) * cameraResponse;

        const lookX = Math.sin((progress + 0.08) * Math.PI * 0.82) * 3.7;
        const lookY = -0.18;
        const lookZ = camera.position.z - THREE.MathUtils.lerp(20, 16, progress);
        camera.lookAt(lookX, lookY, lookZ);

        waterMesh.position.x = camera.position.x;
        waterMesh.position.z = camera.position.z - 125;
        material.uniforms.uImpulseCenter.value = camera.position.z - 16;
        skyMesh.position.copy(camera.position);
        renderer.render(scene, camera);
    }
})();
