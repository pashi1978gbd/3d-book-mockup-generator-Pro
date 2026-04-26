// script.js - Spine Title Version

const holder = document.getElementById("canvas-holder");
const coverUpload = document.getElementById("coverUpload");
const bgSelect = document.getElementById("bgSelect");
const spinSelect = document.getElementById("spinSelect");
const depthRange = document.getElementById("depthRange");
const tiltRange = document.getElementById("tiltRange");
const exportBtn = document.getElementById("exportBtn");
const stageWrap = document.getElementById("stageWrap");

const bookTitleInput = document.getElementById("bookTitle");
const authorInput = document.getElementById("authorName");

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
scene.add(new THREE.AmbientLight(0xffffff, 1.4));

const light = new THREE.DirectionalLight(0xffffff, 1.4);
light.position.set(5, 6, 8);
scene.add(light);

// Cover texture
let coverTexture;

// Create spine texture
function makeSpineTexture() {
  const c = document.createElement("canvas");
  c.width = 500;
  c.height = 1400;

  const ctx = c.getContext("2d");

  ctx.fillStyle = "#8f3f1d";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.save();
  ctx.translate(120, 1280);
  ctx.rotate(-Math.PI / 2);

  ctx.fillStyle = "#f4d9a8";
  ctx.font = "bold 58px Arial";

  const title = (bookTitleInput.value || "Your Book Title").toUpperCase();
  ctx.fillText(title, 0, 0);

  ctx.font = "36px Arial";
  const author = authorInput.value || "Author Name";
  ctx.fillText(author, 0, 70);

  ctx.restore();

  return new THREE.CanvasTexture(c);
}

// Default front texture
function makeDefaultFrontTexture() {
  const c = document.createElement("canvas");
  c.width = 1000;
  c.height = 1600;

  const ctx = c.getContext("2d");

  ctx.fillStyle = "#b4572c";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px Arial";
  ctx.fillText(bookTitleInput.value || "Your Book", 80, 1180);

  ctx.font = "50px Arial";
  ctx.fillText(authorInput.value || "Author Name", 80, 1280);

  return new THREE.CanvasTexture(c);
}

coverTexture = makeDefaultFrontTexture();

let book;

// Build book
function createBook(depth = 0.55) {
  if (book) scene.remove(book);

  const geo = new THREE.BoxGeometry(2.4, 3.6, depth);

  const spineTexture = makeSpineTexture();

  const mats = [
    new THREE.MeshStandardMaterial({ color: 0x8f3f1d }), // right
    new THREE.MeshStandardMaterial({ map: spineTexture }), // left spine
    new THREE.MeshStandardMaterial({ color: 0xf4eee5 }), // top
    new THREE.MeshStandardMaterial({ color: 0xf4eee5 }), // bottom
    new THREE.MeshStandardMaterial({ map: coverTexture }), // front
    new THREE.MeshStandardMaterial({ color: 0x9d4722 }) // back
  ];

  book = new THREE.Mesh(geo, mats);
  book.rotation.y = -0.6;
  scene.add(book);
}

createBook();

// Upload cover
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

// Live title/author updates
bookTitleInput.addEventListener("input", () => {
  if (!coverUpload.files[0]) {
    coverTexture = makeDefaultFrontTexture();
  }
  createBook(parseFloat(depthRange.value));
});

authorInput.addEventListener("input", () => {
  if (!coverUpload.files[0]) {
    coverTexture = makeDefaultFrontTexture();
  }
  createBook(parseFloat(depthRange.value));
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

window.addEventListener("mouseup", () => dragging = false);

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

// Export
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
