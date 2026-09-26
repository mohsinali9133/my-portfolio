const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

window.addEventListener("load", () => {
  setTimeout(() => $("#loader")?.classList.add("done"), 450);
});

/* ---------------- 3D background ---------------- */
const canvas = $("#space");
let scene, camera, renderer, particleField, shapes = [];
let pointer = { x: 0, y: 0 };
let target = { x: 0, y: 0 };

function initThree() {
  if (!canvas || !window.THREE) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const count = innerWidth < 700 ? 900 : 1500;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i*3] = (Math.random() - .5) * 25;
    positions[i*3+1] = (Math.random() - .5) * 16;
    positions[i*3+2] = (Math.random() - .5) * 22;
    sizes[i] = Math.random() * 1.5 + .3;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0x9da7ff,
    size: .028,
    transparent: true,
    opacity: .7,
    depthWrite: false
  });

  particleField = new THREE.Points(geo, mat);
  scene.add(particleField);

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x6e7cff,
    wireframe: true,
    transparent: true,
    opacity: .16
  });

  const objects = [
    [new THREE.IcosahedronGeometry(1.35, 1), -5.4, 2.8, -2],
    [new THREE.TorusKnotGeometry(1.0, .22, 90, 12), 5.4, -2.2, -3],
    [new THREE.OctahedronGeometry(.9, 1), 4.3, 3.1, -1],
    [new THREE.TorusGeometry(1.1, .06, 10, 70), -4.8, -3.0, -5]
  ];

  objects.forEach(([geometry, x, y, z], i) => {
    const mesh = new THREE.Mesh(geometry, wireMat.clone());
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    mesh.userData.speed = .001 + i * .0007;
    scene.add(mesh);
    shapes.push(mesh);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    target.x += (pointer.x - target.x) * .025;
    target.y += (pointer.y - target.y) * .025;

    particleField.rotation.y = t * .008 + target.x * .08;
    particleField.rotation.x = target.y * .03;

    shapes.forEach((obj, i) => {
      obj.rotation.x += obj.userData.speed;
      obj.rotation.y += obj.userData.speed * 1.4;
      obj.position.y += Math.sin(t * .35 + i) * .00035;
    });

    camera.position.x += (target.x * .18 - camera.position.x) * .025;
    camera.position.y += (-target.y * .12 - camera.position.y) * .025;
    camera.lookAt(0, 0, -1);

    renderer.render(scene, camera);
  }
  animate();
}

initThree();

addEventListener("resize", () => {
  if (!camera || !renderer) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / innerWidth - .5) * 2;
  pointer.y = (e.clientY / innerHeight - .5) * 2;

  const glow = $(".cursor-glow");
  if (glow) {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }
});

/* ---------------- Mobile menu ---------------- */
const menuBtn = $(".menu-btn");
const navLinks = $(".nav-links");

menuBtn?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  document.body.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
});
$$(".nav-links a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuBtn?.setAttribute("aria-expanded", "false");
}));

/* ---------------- Scroll reveal ---------------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

$$(".reveal").forEach(el => observer.observe(el));

/* ---------------- Active nav ---------------- */
const sections = $$("main section[id]");
const navAnchors = $$(".nav-links a");

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach(s => sectionObserver.observe(s));

/* ---------------- Subtle 3D tilt ---------------- */
$$(".tilt-card").forEach(card => {
  card.addEventListener("pointermove", (e) => {
    if (innerWidth < 800) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(1000px) rotateX(${y * -4}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

/* ---------------- Magnetic buttons ---------------- */
$$(".magnetic").forEach(el => {
  el.addEventListener("pointermove", (e) => {
    if (innerWidth < 800) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2);
    const y = e.clientY - (r.top + r.height/2);
    el.style.transform = `translate(${x * .08}px, ${y * .08}px)`;
  });
  el.addEventListener("pointerleave", () => el.style.transform = "");
});

/* ---------------- Smooth anchor fallback ---------------- */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
