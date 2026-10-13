    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- mobile nav ---------- */
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));

    /* ---------- reveal ---------- */
    const revealTargets = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealTargets.forEach((el) => io.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add('in'));
    }

    /* ---------- drag the cube ---------- */
    const cube = document.getElementById('cube');
    if (cube) {
      let rx = -16, ry = 0, dragging = false, lx = 0, ly = 0;
      cube.addEventListener('pointerdown', (e) => {
        dragging = true; lx = e.clientX; ly = e.clientY;
        cube.classList.add('manual');
        cube.setPointerCapture(e.pointerId);
      });
      cube.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        ry += (e.clientX - lx) * 0.45;
        rx -= (e.clientY - ly) * 0.45;
        lx = e.clientX; ly = e.clientY;
        cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      const stop = () => {
        if (!dragging) return;
        dragging = false;
        cube.style.animation = 'spin 20s linear infinite';
        cube.style.animationDelay = '0s';
      };
      cube.addEventListener('pointerup', stop);
      cube.addEventListener('pointercancel', stop);
    }

    /* ---------- 3D tilt on cards ---------- */
    if (!reduce && window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('.tilt').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            `perspective(1000px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-4px)`;
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
      });
    }

    /* ---------- WebGL backdrop ---------- */
    (function backdrop() {
      const canvas = document.getElementById('bg');
      if (!window.THREE || !canvas) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch (err) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
      camera.position.z = 16;

      const group = new THREE.Group();
      scene.add(group);

      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(6.4, 1)),
        new THREE.LineBasicMaterial({ color: 0xE0653A, transparent: true, opacity: 0.3 })
      );
      group.add(wire);

      const inner = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.1, 0)),
        new THREE.LineBasicMaterial({ color: 0x7FD1C1, transparent: true, opacity: 0.35 })
      );
      group.add(inner);

      const COUNT = window.innerWidth < 760 ? 240 : 620;
      const positions = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 66;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 44;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 44;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
        color: 0xEDE9E0, size: 0.08, transparent: true, opacity: 0.5, sizeAttenuation: true
      }));
      scene.add(dust);

      let tx = 0, ty = 0, mx = 0, my = 0;
      window.addEventListener('pointermove', (e) => {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
      });

      function resize() {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      window.addEventListener('resize', resize);
      resize();

      const clock = new THREE.Clock();



      const email = "dineshsaini1722856@gmail.com";

      const key = 0x42;

      const encoded =
        key.toString(16).padStart(2, "0") +
        [...email]
          .map(char =>
            (char.charCodeAt(0) ^ key)
              .toString(16)
              .padStart(2, "0")
          )
          .join("");

      console.log("/cdn-cgi/l/email-protection#" + encoded);


      function draw() {
        const t = clock.getElapsedTime();
        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;
        group.rotation.y = t * 0.13 + mx * 0.9;
        group.rotation.x = t * 0.07 + my * 0.55;
        inner.rotation.y = -t * 0.4;
        inner.rotation.z = t * 0.22;
        dust.rotation.y = -t * 0.025 + mx * 0.35;
        dust.rotation.x = my * 0.22;
        renderer.render(scene, camera);
      }

      if (reduce) { draw(); } else {
        (function loop() { draw(); requestAnimationFrame(loop); })();
      }
    })();

    document.getElementById('year').textContent = new Date().getFullYear();
