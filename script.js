// script.js - Fixed Stable Version (No OrbitControls)

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
camera.position.z = 6;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true
});

renderer.setSize(holder.clientWidth, holder.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
holder.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambient);

const light = new THREE.DirectionalLight(0xffffff, 1.4);
light.position.set(5, 6, 8);
scene.add(light);

// Default cover texture
function makeDefaultTexture() {
  const c = document.createElement("canvas");
  c.width = 1000;
  c.height = 1600;

  const ctx = c.getContext("2d");
  ctx.fillStyle = "#b4572c";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px Arial";
  ctx.fillText("Your Book", 90, 1180);

  ctx.font = "50px Arial";
  ctx.fillText("Author Name", 90, 1280);

  return new THREE.CanvasTexture(c);
}

let coverTexture = makeDefaultTexture();
let book;

// Build book
function createBook(depth = 0.55) {
  if (book) scene.remove(book);

  const geo = new THREE.BoxGeometry(2.4, 3.6, depth);

  const mats = [
    new THREE.MeshStandardMaterial({ color: 0x8f3f1d }),
    new THREE.MeshStandardMaterial({ color: 0x8f3f1d }),
    new THREE.MeshStandardMaterial({ color: 0xf4eee5 }),
    new THREE.MeshStandardMaterial({ color: 0xf4eee5 }),
    new THREE.MeshStandardMaterial({ map: coverTexture }),
    new THREE.MeshStandardMaterial({ color: 0x9d4722 })
  ];

  book = new THREE.Mesh(geo, mats);
  book.rotation.y = -0.6;
  scene.add(book);
}

createBook();

// Upload Cover
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

// Background
bgSelect.addEventListener("change", () => {
  stageWrap.classList.remove("dark", "blue");

  if (bgSelect.value === "dark") stageWrap.classList.add("dark");
  if (bgSelect.value === "blue") stageWrap.classList.add("blue");
});

// Depth
depthRange.addEventListener("input", () => {
  createBook(parseFloat(depthRange.value));
});

// Tilt
tiltRange.addEventListener("input", () => {
  if (book) book.rotation.x = tiltRange.value * 0.02;
});

// Mouse drag rotate
let dragging = false;
let prevX = 0;

renderer.domElement.addEventListener("mousedown", e => {
  dragging = true;
  prevX = e.clientX;
});

window.addEventListener("mouseup", () => {
  dragging = false;
});

window.addEventListener("mousemove", e => {
  if (!dragging || !book) return;

  const dx = e.clientX - prevX;
  prevX = e.clientX;

  book.rotation.y += dx * 0.01;
});

// Scroll zoom
renderer.domElement.addEventListener("wheel", e => {
  e.preventDefault();

  camera.position.z += e.deltaY * 0.003;

  if (camera.position.z < 3) camera.position.z = 3;
  if (camera.position.z > 10) camera.position.z = 10;
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

// Animate
function animate() {
  requestAnimationFrame(animate);

  if (spinSelect.value === "on" && book) {
    book.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

animate();
