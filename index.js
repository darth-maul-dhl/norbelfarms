// Get the canvas element and set its size
const canvas = document.getElementById('renderCanvas');
canvas.style.width = '80vw';
canvas.style.height = '80vh';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Create the Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.2, 0.3, 0.7, 1);

// // Camera with orbit controls
// const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 15, new BABYLON.Vector3(0, 0, 0), scene);
// camera.attachControl(canvas, true);

// Camera with orbit controls - adjusted settings to limit rotation below the ground
const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 150, new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);
camera.lowerBetaLimit = 0.1; // Prevent camera from going too far below the scene
camera.upperBetaLimit = Math.PI - 0.1; // Prevent camera from going too far above
camera.lowerRadiusLimit = 5; // Prevent camera from getting too close
camera.upperRadiusLimit = 200; // Prevent camera from getting too far

canvas.addEventListener("wheel", function(event) {
    event.preventDefault();
}, { passive: false });

// Lighting
const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

// Keep your existing detailed terrain ground for the central area
const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 100, height: 100, subdivisions: 100 }, scene);
const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);

// Create sine wave terrain as you already have
for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    positions[i + 1] = 0.5 * Math.sin(x * 0.1) * Math.cos(z * 0.1);
}
ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

// Apply your ground material as before
const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
const diffuseTexture = new BABYLON.Texture('assets/farms/dakota.png', scene);
groundMaterial.diffuseTexture = diffuseTexture;
groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
ground.material = groundMaterial;

// const extendedGround = BABYLON.MeshBuilder.CreateGround('extendedGround', {
//     width: 200, 
//     height: 200,
//     subdivisions: 2 // Fewer subdivisions since we don't need detailed terrain here
// }, scene);
// extendedGround.position.y = -0.2;
// const extendedGroundMaterial = new BABYLON.StandardMaterial('extendedGroundMaterial', scene);
// extendedGroundMaterial.diffuseTexture = new BABYLON.Texture('grass.jpg', scene);
// extendedGroundMaterial.diffuseTexture.uScale = 20; // More tiling for the larger area
// extendedGroundMaterial.diffuseTexture.vScale = 20;
// extendedGroundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
// extendedGround.material = extendedGroundMaterial;

// const extendedUnderPlaneHeight = 7;
// const extendedUnderPlane = BABYLON.MeshBuilder.CreateBox('extendedUnderPlane', { 
//     width: 200, 
//     height: extendedUnderPlaneHeight, 
//     depth: 200 
// }, scene);

// extendedUnderPlane.position.y = -extendedUnderPlaneHeight / 2 - 0.01; // Slightly below the extended ground
// const extendedUnderMaterial = new BABYLON.StandardMaterial('extendedUnderMaterial', scene);
// const extendedGroundTexture = new BABYLON.Texture("grass.jpg", scene);
// extendedUnderMaterial.diffuseTexture = extendedGroundTexture;
// extendedGroundTexture.uScale = 1;
// extendedGroundTexture.vScale = 1;
// extendedUnderMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
// extendedUnderPlane.material = extendedUnderMaterial;

const underPlaneHeight = 7;
const underPlane = BABYLON.MeshBuilder.CreateBox('underPlane', { width: 100, height: underPlaneHeight, depth: 100 }, scene);
underPlane.position.y = -underPlaneHeight / 2 - 0.01; // Slightly below the main ground
const underMaterial = new BABYLON.StandardMaterial('underMaterial', scene);
const groundTexture = new BABYLON.Texture("assets/dirt.jpg", scene);
underMaterial.diffuseTexture = groundTexture;

// Add texture tiling if the texture is too small
groundTexture.uScale = 1;
groundTexture.vScale = 1;

// Keep low specular to avoid too much shininess
underMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

// Apply the material to the mesh
underPlane.material = underMaterial;

const skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 800 }, scene);
const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', scene);
skyboxMaterial.backFaceCulling = false; // Show the inside of the box

const hdrTexture = new BABYLON.CubeTexture("assets/textures/TropicalSunnyDay", scene);

skyboxMaterial.reflectionTexture = hdrTexture;
skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
skyboxMaterial.disableLighting = true;

skyboxMaterial.disableLighting = true; // We want constant color regardless of lighting
skybox.material = skyboxMaterial;

// Make sure the skybox is rendered behind everything else
skybox.infiniteDistance = true;

// Load tractor model and scale dynamically
BABYLON.SceneLoader.ImportMesh('', '', 'assets/models/tractor.glb', scene, function (meshes) {
    const tractor = meshes[0];
    tractor.position = new BABYLON.Vector3(0, 4, 0); // Raise the tractor above the ground

    // Scale dynamically based on window size
    function updateScale() {
        const scaleFactor = Math.min(window.innerWidth, window.innerHeight) / 800; // Increase size factor
        tractor.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
    }

    updateScale();
    window.addEventListener('resize', updateScale);
});

// Render loop
engine.runRenderLoop(() => {
    scene.render();
});

// Handle window resize
window.addEventListener('resize', () => {
    engine.resize();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
