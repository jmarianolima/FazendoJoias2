import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128/examples/jsm/loaders/GLTFLoader.js';
import * as facemesh from '@tensorflow-models/facemesh';
import '@tensorflow/tfjs';

const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
let scene, camera, renderer, loader;

// Iniciar câmera
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        video.play();
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        initThreeJS();
        loadFaceMesh();
    };
}

// Inicializar Three.js
function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(canvas.width, canvas.height);
    document.body.appendChild(renderer.domElement);
    loader = new GLTFLoader();
    camera.position.z = 2;
}

// Carregar FaceMesh para detecção facial
async function loadFaceMesh() {
    const model = await facemesh.load();
    detectFace(model);
}

// Detectar rosto e posicionar joia
async function detectFace(model) {
    const predictions = await model.estimateFaces(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (predictions.length > 0) {
        const keypoints = predictions[0].scaledMesh;
        const noseTip = keypoints[4];
        const leftEar = keypoints[234];
        const rightEar = keypoints[454];

        // Exemplo: adicionar um brinco na orelha direita
        placeJewelry(rightEar, 'earring');
    }
    requestAnimationFrame(() => detectFace(model));
}

// Carregar e posicionar joia
function placeJewelry(position, type) {
    loader.load(`models/${type}.glb`, (gltf) => {
        const model = gltf.scene;
        model.position.set(position[0] / 100, -position[1] / 100, -1);
        model.scale.set(0.1, 0.1, 0.1);
        scene.add(model);
    });
}

startCamera();
