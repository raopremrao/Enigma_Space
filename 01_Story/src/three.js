/**
 * Three.js script for the interactive 3D object in the contact section.
 * This script creates a scene, adds a rotating icosahedron, and handles
 * user interaction (orbit controls) and responsive resizing.
 */

// Import necessary modules from Three.js CDN
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

// --- Core Components Setup ---

// 1. Scene: The container for all 3D objects.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e27); // Match the site's primary background

// 2. Camera: Defines the perspective from which we view the scene.
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.z = 5; // Move camera back to see the object

// 3. Renderer: Renders the scene onto the HTML canvas.
const canvas = document.querySelector(".contact-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true, // Smoother edges
  alpha: true, // Transparent background
});
renderer.setPixelRatio(window.devicePixelRatio); // Adjust for high-DPI screens

// --- 3D Object (Icosahedron) ---

// Create a geometric shape (20-sided polyhedron)
const geometry = new THREE.IcosahedronGeometry(1.2, 0);

// Create a material with a wireframe style to match the site's aesthetic
const material = new THREE.MeshStandardMaterial({
    color: 0x64ffda, // Primary accent color
    emissive: 0x00bcd4, // Secondary accent color for a glow effect
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.4,
    wireframe: true, // Show the geometric structure
    wireframeLinewidth: 2,
});

// Create a mesh by combining the geometry and material, then add it to the scene
const shape = new THREE.Mesh(geometry, material);
scene.add(shape);

// --- Lighting ---

// Add ambient light to softly illuminate the entire scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add a directional light to create highlights and shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// --- Controls & Interactivity ---

// OrbitControls allow the user to rotate the object with the mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooths out the rotation
controls.dampingFactor = 0.05;
controls.enableZoom = false; // Disable zooming for a cleaner experience
controls.enablePan = false; // Disable panning
controls.autoRotate = true; // Automatically rotate the object
controls.autoRotateSpeed = 0.8;

// --- Responsiveness ---

// Function to handle window resizing
function onWindowResize() {
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Update camera aspect ratio and projection matrix
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(width, height);
}

// Initial call to set size correctly
onWindowResize();

// Add event listener for window resize
window.addEventListener('resize', onWindowResize);


// --- Animation Loop ---

// The animate function is called on every frame to update the scene
function animate() {
    // Request the next frame
    requestAnimationFrame(animate);

    // Update the controls (for damping and auto-rotate)
    controls.update();

    // Render the scene from the camera's perspective
    renderer.render(scene, camera);
}

// Start the animation loop
animate();
