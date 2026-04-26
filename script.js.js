// script.js - PRO Three.js Version

const holder = document.getElementById("canvas-holder");
const coverUpload = document.getElementById("coverUpload");
const bgSelect = document.getElementById("bgSelect");
const spinSelect = document.getElementById("spinSelect");
const depthRange = document.getElementById("depthRange");
const tiltRange = document.getElementById("tiltRange");
const exportBtn = document.getElementById("exportBtn");
const stageWrap = document.getElementById("stageWrap");

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  holder.clientWidth / holder.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 6);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true
});
renderer.setSize(holder.clientWidth, holder.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
holder.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 10;

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 1.4);
dir.position.set(5, 8, 6);
dir.castShadow = true;
scene.add(dir);

// Ground shadow plane
const planeGeo = new THREE.PlaneGeometry(20, 20);
const planeMat = new THREE.ShadowMaterial({ opacity: 0.18 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -2.2;
plane.receiveShadow = true;
scene.add(plane);

// Default cover canvas texture
function makeDefaultTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1600;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#b4572c";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 82px Arial";
  ctx.fillText("Your Book", 80, 1180);

  ctx.font = "52px Arial";
  ctx.fillText("Author Name", 80, 1280);

  return new THREE.CanvasTexture(c);
}

let coverTexture = makeDefaultTexture();

// Book
let book;

function createBook(depth = 0.55) {
  if (book) scene.remove(book);

  const geo = new THREE.BoxGeometry(2.4, 3.6, depth);

  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x8f3f1d }), // right
    new THREE.MeshStandardMaterial({ color: 0x8f3f1d }), // left
    new THREE.MeshStandardMaterial({ color: 0xf5f0e7 }), // top
    new THREE.MeshStandardMaterial({ color: 0xf5f0e7 }), // bottom
    new THREE.MeshStandardMaterial({ map: coverTexture }), // front
    new THREE.MeshStandardMaterial({ color: 0x9f4a23 }) // back
  ];

  book = new THREE.Mesh(geo, materials);
  book.castShadow = true;
  book.receiveShadow = true;
  book.rotation.y = -0.55;
  scene.add(book);
}

createBook();

// Upload cover image
coverUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const loader = new THREE.TextureLoader();
    loader.load(e.target.result, tex => {
      coverTexture = tex;
      createBook(parseFloat(depthRange.value));
    });
  };

  reader.readAsDataURL(file);
});

// Background select
bgSelect.addEventListener("change", () => {
  stageWrap.classList.remove("dark", "blue");

  if (bgSelect.value === "dark") stageWrap.classList.add("dark");
  if (bgSelect.value === "blue") stageWrap.classList.add("blue");
});

// Depth control
depthRange.addEventListener("input", () => {
  createBook(parseFloat(depthRange.value));
});

// Tilt control
tiltRange.addEventListener("input", () => {
  if (book) book.rotation.x = tiltRange.value * 0.02;
});

// Export PNG
exportBtn.addEventListener("click", () => {
  renderer.render(scene, camera);
  const link = document.createElement("a");
  link.download = "3d-book-mockup.png";
  link.href = renderer.domElement.toDataURL("image/png");
  link.click();
});

// Resize
window.addEventListener("resize", () => {
  camera.aspect = holder.clientWidth / holder.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(holder.clientWidth, holder.clientHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (spinSelect.value === "on" && book) {
    book.rotation.y += 0.01;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();