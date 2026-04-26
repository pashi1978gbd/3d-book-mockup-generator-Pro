// script.js - Final Premium Spine + Full Drag Rotation

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

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
45,
holder.clientWidth / holder.clientHeight,
0.1,
1000
);

camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({
antialias:true,
alpha:true,
preserveDrawingBuffer:true
});

renderer.setSize(holder.clientWidth, holder.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
holder.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff,1.5));

const light = new THREE.DirectionalLight(0xffffff,1.5);
light.position.set(5,6,8);
scene.add(light);

let coverTexture;
let book;

// FRONT TEXTURE
function makeFrontTexture(){
const c = document.createElement("canvas");
c.width = 1000;
c.height = 1600;

const ctx = c.getContext("2d");

ctx.fillStyle="#b4572c";
ctx.fillRect(0,0,c.width,c.height);

ctx.fillStyle="#ffffff";
ctx.font="bold 80px Arial";
ctx.fillText(bookTitleInput.value || "Your Book Title",70,1180);

ctx.font="50px Arial";
ctx.fillText(authorInput.value || "Author Name",70,1280);

return new THREE.CanvasTexture(c);
}

// SPINE TEXTURE (Vertical)
function makeSpineTexture(){
const c = document.createElement("canvas");
c.width = 500;
c.height = 1400;

const ctx = c.getContext("2d");

ctx.fillStyle="#8f3f1d";
ctx.fillRect(0,0,c.width,c.height);

ctx.save();
ctx.translate(120,1280);
ctx.rotate(-Math.PI/2);

ctx.fillStyle="#f4d7a1";
ctx.font="bold 58px Arial";

const title = (bookTitleInput.value || "YOUR BOOK TITLE").toUpperCase();
ctx.fillText(title,0,0);

ctx.font="36px Arial";
ctx.fillText(authorInput.value || "Author Name",0,70);

ctx.restore();

return new THREE.CanvasTexture(c);
}

coverTexture = makeFrontTexture();

// BUILD BOOK
function createBook(depth=0.55){

if(book) scene.remove(book);

const geo = new THREE.BoxGeometry(2.4,3.6,depth);

const spineTexture = makeSpineTexture();

const mats = [

new THREE.MeshStandardMaterial({color:0x9d4722}), // right
new THREE.MeshStandardMaterial({map:spineTexture}), // left spine
new THREE.MeshStandardMaterial({color:0xf4eee5}), // top
new THREE.MeshStandardMaterial({color:0xf4eee5}), // bottom
new THREE.MeshStandardMaterial({map:coverTexture}), // front
new THREE.MeshStandardMaterial({color:0x7c3518}) // back

];

book = new THREE.Mesh(geo,mats);

book.rotation.y = -0.6;
book.rotation.x = 0;

scene.add(book);
}

createBook();

// COVER UPLOAD
coverUpload.addEventListener("change",function(){

const file = this.files[0];
if(!file) return;

const reader = new FileReader();

reader.onload = function(e){

const loader = new THREE.TextureLoader();

loader.load(e.target.result,function(tex){

coverTexture = tex;
createBook(parseFloat(depthRange.value));

});

};

reader.readAsDataURL(file);

});

// LIVE TITLE / AUTHOR
function refreshBook(){
if(!coverUpload.files[0]){
coverTexture = makeFrontTexture();
}
createBook(parseFloat(depthRange.value));
}

bookTitleInput.addEventListener("input",refreshBook);
authorInput.addEventListener("input",refreshBook);

// BACKGROUND
bgSelect.addEventListener("change",()=>{

stageWrap.classList.remove("dark","blue");

if(bgSelect.value==="dark") stageWrap.classList.add("dark");
if(bgSelect.value==="blue") stageWrap.classList.add("blue");

});

// DEPTH
depthRange.addEventListener("input",()=>{
createBook(parseFloat(depthRange.value));
});

// TILT SLIDER
tiltRange.addEventListener("input",()=>{
if(book){
book.rotation.x = tiltRange.value * 0.02;
}
});

// FULL DRAG ROTATION
let dragging=false;
let prevX=0;
let prevY=0;

renderer.domElement.addEventListener("mousedown",(e)=>{
dragging=true;
prevX=e.clientX;
prevY=e.clientY;
});

window.addEventListener("mouseup",()=>{
dragging=false;
});

window.addEventListener("mousemove",(e)=>{

if(!dragging || !book) return;

const dx = e.clientX - prevX;
const dy = e.clientY - prevY;

prevX = e.clientX;
prevY = e.clientY;

book.rotation.y += dx * 0.01;
book.rotation.x += dy * 0.01;

// limits
if(book.rotation.x > 0.7) book.rotation.x = 0.7;
if(book.rotation.x < -0.7) book.rotation.x = -0.7;

});

// ZOOM
renderer.domElement.addEventListener("wheel",(e)=>{

e.preventDefault();

camera.position.z += e.deltaY * 0.003;

if(camera.position.z < 3) camera.position.z = 3;
if(camera.position.z > 10) camera.position.z = 10;

});

// EXPORT
exportBtn.addEventListener("click",()=>{

renderer.render(scene,camera);

const link = document.createElement("a");
link.download="3d-book-mockup.png";
link.href = renderer.domElement.toDataURL("image/png");
link.click();

});

// RESIZE
window.addEventListener("resize",()=>{

camera.aspect = holder.clientWidth / holder.clientHeight;
camera.updateProjectionMatrix();
renderer.setSize(holder.clientWidth, holder.clientHeight);

});

// ANIMATE
function animate(){

requestAnimationFrame(animate);

if(spinSelect.value==="on" && book){
book.rotation.y += 0.01;
}

renderer.render(scene,camera);

}

animate();
