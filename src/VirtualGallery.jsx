// src/components/VirtualGallery.jsx
import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { room1Hotspots, room2Hotspots, room3Hotspots } from "./data/hotspots";
import { createRoomTitle } from "./ui/RoomTitle";
import { createLoadingOverlay } from "./ui/LoadingOverlay";
import { createArtifactModal } from "./ui/ArtifactModal";
import { createTooltip } from "./ui/Tooltip";


// Background music for each room
  // 🎵 Audio setup
    const audios = [
      new Audio("/assets/background1.mp3"),
      new Audio("/assets/background2.mp3"),
      new Audio("/assets/background3.mp3"),
    ];
function playMusicForRoom(room) {
  // Stop all music first
  Object.values(roomMusic).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });

  // Play selected room music
  if (roomMusic[room]) {
    roomMusic[room].loop = true;
    roomMusic[room].volume = 0.5; // adjust volume
    roomMusic[room].play();
  }
}
let artifactAudio = null; // <— add this so close handler can see it
let descriptionAudio = null;
const roomIndexMap = { room1: 1, room2: 2, room3: 3 }; // for resuming bg music


export default function VirtualGallery() {
  useEffect(() => {
    let scene, camera, renderer, controls;
    let sphere, raycaster, mouse;
    let hotspotMeshes = [];
    let currentRoom = "room1";

    const tooltip = createTooltip();

  
    audios.forEach((audio) => {
      audio.loop = true;
      audio.volume = 0;
    });

    function fadeVolume(audio, target, duration = 1000) {
      const start = audio.volume;
      const change = target - start;
      const startTime = Date.now();

      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = Math.max(0, Math.min(1, start + change * progress));
        if (progress < 1) requestAnimationFrame(animate);
      }
      animate();
    }

    function playMusicForRoom(roomIndex) {
      audios.forEach((audio, i) => {
        if (i === roomIndex - 1) {
          if (audio.paused) audio.play();
          fadeVolume(audio, 0.5, 2000);
        } else {
          fadeVolume(audio, 0, 2000);
        }
      });
    }

    // 🎨 UI Elements
    const roomTitle = createRoomTitle();
    const loadingOverlay = createLoadingOverlay();
    const { modal, modalImg, modalTitle, modalDesc, closeBtn, audioDescBtn } = createArtifactModal();


    closeBtn.onclick = () => {
  modal.style.display = "none";

  if (artifactAudio) {
    artifactAudio.pause();
    artifactAudio.currentTime = 0;
    artifactAudio = null;
  }
  if (descriptionAudio) {
    descriptionAudio.pause();
    descriptionAudio.currentTime = 0;
    descriptionAudio = null;
  }

  const idx = roomIndexMap[currentRoom];
  if (idx) playMusicForRoom(idx);
};

    // Scene Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const loader = new THREE.TextureLoader();

    function loadPanorama(path, callback) {
      loadingOverlay.style.display = "flex";
      loader.load(
        path,
        (texture) => {
          if (!sphere) {
            const geometry = new THREE.SphereGeometry(400, 60, 40);
            geometry.scale(-1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
          } else {
            sphere.material.map = texture;
            sphere.material.needsUpdate = true;
          }
          loadingOverlay.style.opacity = "0";
          setTimeout(() => {
            loadingOverlay.style.display = "none";
            loadingOverlay.style.opacity = "1";
          }, 500);
          if (callback) callback();
        },
        undefined,
        (err) => {
          console.error("Failed to load panorama", err);
        }
      );
    }

    function clearHotspots() {
      hotspotMeshes.forEach((mesh) => scene.remove(mesh));
      hotspotMeshes = [];
    }

function addHotspots(hotspots) {
  hotspots.forEach((spot) => {
    if (spot.type === "artifact") {
      createInfoHotspot(spot.position.x, spot.position.y, spot.position.z, spot);
    } else if (spot.type === "navigation") {
      createNavigationHotspot(spot.position.x, spot.position.y, spot.position.z, spot.action, spot.title);
    }
  });
}
   function createNavigationHotspot(x, y, z, onClick) {
  const geometry = new THREE.ConeGeometry(3, 8, 4); // triangle
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // green
  const cone = new THREE.Mesh(geometry, material);

  cone.position.set(x, y, z);
  cone.rotation.x = Math.PI; // points down
  cone.userData = { type: "navigation", action: onClick };
  

  scene.add(cone);
  hotspotMeshes.push(cone);
}

function createInfoHotspot(x, y, z, data) {
  const textureLoader = new THREE.TextureLoader();
  const spriteMap = textureLoader.load("/assets/exclamation.png"); 
  const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
  const sprite = new THREE.Sprite(spriteMaterial);

  sprite.position.set(x, y, z);
  sprite.scale.set(15, 15, 1);
  sprite.userData = { type: "artifact", ...data };
  

  scene.add(sprite);
  hotspotMeshes.push(sprite);
}

  function switchRoom(room) {
  clearHotspots();

  if (room === "room1") {
    roomTitle.style.display = "block";
    setTimeout(() => {
      roomTitle.style.opacity = 1;
    }, 50);

    loadPanorama("/assets/room1.jpg", () => {
      addHotspots(room1Hotspots);

      // Add navigation to room2
      // Add an info hotspot (ℹ️)
    
    });

    playMusicForRoom(1);
  } 
  
  else if (room === "room2") {
    roomTitle.style.opacity = 0;
    setTimeout(() => {
      roomTitle.style.display = "none";
    }, 1000);

    loadPanorama("/assets/room2.jpg", () => {
      addHotspots(room2Hotspots);
      // Navigation to room1 and room3 
      // Info hotspot for room2
    });

    playMusicForRoom(2);
  } 
  
  else if (room === "room3") {
    loadPanorama("/assets/room3.jpg", () => {
      addHotspots(room3Hotspots);
      // Navigation back to room2
      // Info hotspot for room3
    });

    playMusicForRoom(3);
  }

  currentRoom = room;
}


    //  Interaction
    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hotspotMeshes, true);

  if (intersects.length > 0) {
   const data = intersects[0].object.userData || {};
    if (data.type === "navigation" || data.type === "artifact") {
      tooltip.innerText = data.title || "Enter"; // uses your existing title field
      tooltip.style.left = event.clientX + 20 + "px";
      tooltip.style.top  = event.clientY + 20 + "px";
      tooltip.style.display = "block";
      return;
    }
  }
  tooltip.style.display = "none";
}
  function onClick() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hotspotMeshes);

  if (intersects.length > 0) {
    const hotspot = intersects[0].object.userData;

if (hotspot.type === "artifact") {
  modal.style.display = "flex";
  modalImg.src = hotspot.image;
  modalTitle.innerText = hotspot.title || "";
  modalDesc.innerText = hotspot.description || "";

  // pause bg music
  audios.forEach(a => a && a.pause());

  // play artifact music
  if (artifactAudio) {
    artifactAudio.pause();
    artifactAudio = null;
  }
  if (hotspot.music) {
    artifactAudio = new Audio(hotspot.music);
    artifactAudio.loop = true;
    artifactAudio.volume = 0.8;
    artifactAudio.play();
  }

  // set up audio description button
  if (hotspot.audioDescription) {
    closeBtn.style.display = "block"; 
    audioDescBtn.style.display = "inline-block";

    audioDescBtn.onclick = () => {
      if (descriptionAudio && !descriptionAudio.paused) {
        // Stop description and restore music volume
        descriptionAudio.pause();
        descriptionAudio.currentTime = 0;
        descriptionAudio = null;
        artifactAudio.volume = 0.8;
        audioDescBtn.innerText = "Play Audio Description";
      } else {
        // Lower artifact music
        if (artifactAudio) artifactAudio.volume = 0.4;

        descriptionAudio = new Audio(hotspot.audioDescription);
        descriptionAudio.volume = 1.0;
        descriptionAudio.play();

        audioDescBtn.innerText = "Stop Audio Description";

        descriptionAudio.onended = () => {
          if (artifactAudio) artifactAudio.volume = 0.8;
          descriptionAudio = null;
          audioDescBtn.innerText = "Play Audio Description";
        };
      }
    };
  } else {
    audioDescBtn.style.display = "none"; // hide if no description available
  }
}

    
    else if (hotspot.type === "navigation") {
      switchRoom(hotspot.action);
    }
  }
}


    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    
    // 🎬 Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      raycaster.setFromCamera(mouse, camera);
      // Floating effect for navigation arrows
  const time = Date.now() * 0.002;
  hotspotMeshes.forEach(mesh => {
   if (mesh.geometry && mesh.geometry.type === "ConeGeometry") {
    mesh.position.y += Math.sin(time) * 0.10;
  }
    if (mesh.type === "Sprite") {
      const scaleFactor = 10; // Adjust size (smaller or bigger)
      const distance = camera.position.distanceTo(mesh.position);
      mesh.scale.set(scaleFactor * distance * .01, scaleFactor * distance * .01, 10);
    }
});

      renderer.render(scene, camera);
    }

    // 🚪 Start in room1
    switchRoom("room1");
    animate();

    // 🧹 Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      if (renderer) {
        document.body.removeChild(renderer.domElement);
      }
    };
  }, []);

  return null;
}
