import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BuildingData, CameraMode, SimulationState } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { EVACUATION_PATH_POINTS } from '../data/worldData';
import { Shield, AlertTriangle, Waves } from 'lucide-react';

interface ThreeCanvasProps {
  buildings: BuildingData[];
  simulationState: SimulationState;
  onSelectBuilding: (b: BuildingData | null) => void;
  onUpdateWaterLevel: (lvl: number) => void;
  isCompareSecondary?: boolean;
}

interface ProjectedMarker {
  id: string;
  x: number;
  y: number;
  visible: boolean;
  type: 'safe_citadel' | 'low_risk_group' | 'cottage_hazard';
  name?: string;
  elevation?: number;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  buildings,
  simulationState,
  onSelectBuilding,
  isCompareSecondary = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const simStateRef = useRef(simulationState);
  simStateRef.current = simulationState;

  const buildingsRef = useRef(buildings);
  buildingsRef.current = buildings;

  // Screen-projected markers for Image 2 style callout badges
  const [markers, setMarkers] = useState<ProjectedMarker[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8); // Sky blue
    scene.fog = new THREE.FogExp2(0xcce7ff, 0.005);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Perspective Camera matching the second reference image
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.5, 600);
    // Initial Cinematic Overview Position (matching Image 2)
    camera.position.set(-3, 26, 46);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.45);
    sunLight.position.set(45, 65, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 180;
    const shadowD = 55;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    scene.add(sunLight);

    // Cyan Sea Fill Light from the bay
    const seaFillLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    seaFillLight.position.set(-45, 25, -20);
    scene.add(seaFillLight);

    // --- Atmospheric Sky Dome ---
    const skyGeo = new THREE.SphereGeometry(320, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0x1d4ed8) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        horizonColor: { value: new THREE.Color(0x93c5fd) },
        offset: { value: 25 },
        exponent: { value: 0.55 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          vec3 col = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
          if (h < 0.2) col = mix(horizonColor, col, h / 0.2);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // --- Procedural Terrain with Cliffs & Beach ---
    const terrainWidth = 130;
    const terrainDepth = 130;
    const terrainSegments = 90;
    const terrainGeo = new THREE.PlaneGeometry(terrainWidth, terrainDepth, terrainSegments, terrainSegments);
    terrainGeo.rotateX(-Math.PI / 2);

    const getElevationAt = (x: number, z: number): number => {
      // High Citadel Rocky Plateau (X > 10, Z < 10)
      if (x > 8 && z < 12) {
        const plateauDist = Math.hypot(x - 22, z - (-4));
        if (plateauDist < 16) {
          return 18.0 + Math.sin(x * 0.3) * 0.6; // High elevation Citadel ground
        }
        // Cliff slope
        return Math.max(2.0, 18.0 - (plateauDist - 16) * 1.8);
      }
      // Low coastal bay on the left & beach (X < -2, Z < 15)
      if (x < -10) {
        return Math.max(0.2, 1.8 + Math.sin(z * 0.2) * 0.5 - (x + 10) * 0.08);
      }
      // Rolling village center
      return 2.5 + Math.sin(x * 0.2) * 0.6 + Math.cos(z * 0.2) * 0.5;
    };

    const posAttr = terrainGeo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = getElevationAt(vx, vz);
      posAttr.setY(i, vy);

      // Color coding (Natural mode): Sand beach -> Green grass -> Grey rocky cliff
      let r = 0.25, g = 0.65, b = 0.25;
      if (vy < 2.0) {
        // Sandy coast
        r = 0.88; g = 0.82; b = 0.65;
      } else if (vy > 10.0) {
        // High stone rock cliff
        r = 0.48; g = 0.50; b = 0.52;
      } else {
        // Lush green hills
        r = 0.22 + Math.random() * 0.05;
        g = 0.58 + Math.random() * 0.08;
        b = 0.22;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    scene.add(terrain);

    // --- Dynamic Water & Towering Tsunami Wave (Image 2 style) ---
    // 1. Base Sea Water Plane
    const waterWidth = 140;
    const waterDepth = 140;
    const waterGeo = new THREE.PlaneGeometry(waterWidth, waterDepth, 60, 60);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant turquoise deep ocean
      roughness: 0.15,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0, 0);
    scene.add(waterMesh);

    // 2. Colossal Tsunami Wave Surge Wall (Image 2 style)
    // Towering curling wave crest sweeping in from the bay on the left
    const waveGroup = new THREE.Group();
    const waveWidth = 90;

    // Curved wave wall geometry
    const waveCylinderGeo = new THREE.CylinderGeometry(14, 18, waveWidth, 32, 16, true, Math.PI * 0.05, Math.PI * 0.8);
    waveCylinderGeo.rotateZ(Math.PI / 2);
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
    const waveWall = new THREE.Mesh(waveCylinderGeo, waveMat);
    waveWall.position.set(0, 8, 0);
    waveGroup.add(waveWall);

    // White billowy foam crest on top of the wave (Image 2)
    const foamCrestGeo = new THREE.CylinderGeometry(2.5, 3.5, waveWidth * 1.02, 24);
    foamCrestGeo.rotateZ(Math.PI / 2);
    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      emissive: 0xffffff,
      emissiveIntensity: 0.25,
    });
    const foamCrest = new THREE.Mesh(foamCrestGeo, foamMat);
    foamCrest.position.set(2, 16, 0);
    waveGroup.add(foamCrest);

    // Spray & Water Splashing Particles
    const sprayCount = 400;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPositions = new Float32Array(sprayCount * 3);
    for (let i = 0; i < sprayCount; i++) {
      sprayPositions[i * 3] = (Math.random() - 0.5) * waveWidth;
      sprayPositions[i * 3 + 1] = 6 + Math.random() * 12;
      sprayPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));
    const sprayParticles = new THREE.Points(
      sprayGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.85,
      })
    );
    waveGroup.add(sprayParticles);

    waveGroup.position.set(-36, 0, -4);
    scene.add(waveGroup);

    // Floating Debris (Crates & Barrels bobbing in water)
    const debrisGroup = new THREE.Group();
    const debrisItems: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number }[] = [];
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.6 });

    for (let i = 0; i < 18; i++) {
      const isCrate = i % 2 === 0;
      const mesh = isCrate
        ? new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), crateMat)
        : new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.3, 10), barrelMat);

      const dx = -24 + Math.random() * 20;
      const dz = -25 + Math.random() * 45;
      mesh.position.set(dx, 1.5, dz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      debrisGroup.add(mesh);
      debrisItems.push({
        mesh,
        basePos: mesh.position.clone(),
        speed: 0.6 + Math.random() * 0.8,
      });
    }
    scene.add(debrisGroup);

    // --- Red Hazard Disks under low buildings (Image 2 style) ---
    const hazardRingsGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(3.5, 5.0, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    // --- Procedural Buildings & Structures ---
    const buildingsGroup = new THREE.Group();
    const buildingMeshes: Map<string, THREE.Group> = new Map();
    const measurementLines: THREE.Line[] = [];
    const floatingSprites: THREE.Sprite[] = [];

    // Helper to generate text/badge sprite for 3D heights
    const createHeightSprite = (text: string, bgColor: string, borderColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = bgColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 6;
      const r = 18;
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 112, r);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 36px "Cinzel", serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4, 2, 1);
      return sprite;
    };

    buildings.forEach((b) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.position[0], b.groundElevation, b.position[2]);
      bGroup.name = b.id;

      const [bw, bh, bd] = b.dimensions;

      if (b.type === 'citadel') {
        // --- Grand High Citadel Fortress (Image 2 Castle on the Right!) ---
        // Multi-tiered stone walls
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
        const castleBaseGeo = new THREE.BoxGeometry(bw, bh * 0.65, bd);
        const castleBase = new THREE.Mesh(castleBaseGeo, stoneMat);
        castleBase.position.y = (bh * 0.65) / 2;
        castleBase.castShadow = true;
        castleBase.receiveShadow = true;
        bGroup.add(castleBase);

        // High Central Tower
        const towerGeo = new THREE.BoxGeometry(bw * 0.55, bh * 0.5, bd * 0.55);
        const tower = new THREE.Mesh(towerGeo, stoneMat);
        tower.position.y = bh * 0.65 + (bh * 0.5) / 2;
        tower.castShadow = true;
        bGroup.add(tower);

        // Royal Blue Slate Conical Roof (as in Image 2!)
        const blueRoofMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.45 });
        const roofGeo = new THREE.ConeGeometry(bw * 0.45, bh * 0.35, 4);
        roofGeo.rotateY(Math.PI / 4);
        const mainRoof = new THREE.Mesh(roofGeo, blueRoofMat);
        mainRoof.position.y = bh * 1.15 + (bh * 0.35) / 2;
        mainRoof.castShadow = true;
        bGroup.add(mainRoof);

        // Corner Turrets with Blue Conical Spire Roofs
        const turretRadius = bw * 0.16;
        const turretGeo = new THREE.CylinderGeometry(turretRadius, turretRadius * 1.05, bh * 0.85, 8);
        const turretRoofGeo = new THREE.ConeGeometry(turretRadius * 1.25, bh * 0.3, 8);
        const turretOffsets = [
          [-bw / 2, -bd / 2],
          [bw / 2, -bd / 2],
          [-bw / 2, bd / 2],
          [bw / 2, bd / 2],
        ];
        turretOffsets.forEach(([ox, oz]) => {
          const turret = new THREE.Mesh(turretGeo, stoneMat);
          turret.position.set(ox, (bh * 0.85) / 2, oz);
          turret.castShadow = true;
          bGroup.add(turret);

          const troof = new THREE.Mesh(turretRoofGeo, blueRoofMat);
          troof.position.set(ox, bh * 0.85 + (bh * 0.3) / 2, oz);
          troof.castShadow = true;
          bGroup.add(troof);
        });

        // Royal Blue & Gold Heraldic Banner down the front (Image 2)
        const bannerGeo = new THREE.BoxGeometry(2.4, 6.0, 0.2);
        const bannerMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
        const banner = new THREE.Mesh(bannerGeo, bannerMat);
        banner.position.set(0, bh * 0.7, bd / 2 + 0.2);
        bGroup.add(banner);

        // Gold Shield Emblem on the banner
        const shieldGeo = new THREE.BoxGeometry(1.6, 2.0, 0.3);
        const shieldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        shield.position.set(0, bh * 0.75, bd / 2 + 0.35);
        bGroup.add(shield);

        // Grand Stone Stairway leading up to the fortress gate (Image 2)
        const stairCount = 8;
        for (let s = 0; s < stairCount; s++) {
          const stepGeo = new THREE.BoxGeometry(bw * 0.6, 0.4, 0.8);
          const step = new THREE.Mesh(stepGeo, stoneMat);
          step.position.set(0, s * 0.4, bd / 2 + (stairCount - s) * 0.8);
          step.castShadow = true;
          step.receiveShadow = true;
          bGroup.add(step);
        }
      } else {
        // Village Cottage / Townhouse (Warm terracotta tiled roof as in Image 2!)
        const baseGeo = new THREE.BoxGeometry(bw, bh * 0.65, bd);
        const plasterMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
        const base = new THREE.Mesh(baseGeo, plasterMat);
        base.position.y = (bh * 0.65) / 2;
        base.castShadow = true;
        base.receiveShadow = true;
        bGroup.add(base);

        // Dark timber framing beam
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
        const beam = new THREE.Mesh(new THREE.BoxGeometry(bw * 1.02, 0.35, bd * 1.02), beamMat);
        beam.position.y = bh * 0.65;
        bGroup.add(beam);

        // Terracotta Orange Tile Roof (Image 2)
        const roofGeo = new THREE.ConeGeometry(bw * 0.72, bh * 0.48, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(b.roofColor || 0xc2410c), roughness: 0.6 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = bh * 0.65 + (bh * 0.48) / 2;
        roof.castShadow = true;
        bGroup.add(roof);

        // Chimney
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.7, bh * 0.5, 0.7), new THREE.MeshStandardMaterial({ color: 0x64748b }));
        chimney.position.set(bw * 0.25, bh * 0.7, bd * 0.2);
        chimney.castShadow = true;
        bGroup.add(chimney);

        // Add Red Hazard Disk for low cottages below 10m ground elevation
        if (b.groundElevation < 10) {
          const hRing = new THREE.Mesh(ringGeo, ringMat);
          hRing.position.set(b.position[0], b.groundElevation + 0.1, b.position[2]);
          hazardRingsGroup.add(hRing);
        }
      }

      // Vertical Laser Measurement Line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, b.estimatedHeight, 0),
      ]);
      const lineColor = b.isShelter ? 0x10b981 : (b.groundElevation < 10 ? 0xef4444 : 0x3b82f6);
      const lineMat = new THREE.LineBasicMaterial({
        color: lineColor,
        linewidth: 3,
        transparent: true,
        opacity: 0.9,
      });
      const measLine = new THREE.Line(lineGeo, lineMat);
      measLine.visible = simulationState.showHeights;
      bGroup.add(measLine);
      measurementLines.push(measLine);

      // 3D Height Badge Sprite floating above roof
      const badgeBg = b.isShelter ? 'rgba(6, 95, 70, 0.9)' : (b.groundElevation < 10 ? 'rgba(185, 28, 28, 0.9)' : 'rgba(30, 58, 138, 0.9)');
      const badgeBorder = b.isShelter ? '#34d399' : (b.groundElevation < 10 ? '#f87171' : '#60a5fa');
      const sprite = createHeightSprite(`${b.estimatedHeight.toFixed(1)}m`, badgeBg, badgeBorder);
      sprite.position.set(0, b.estimatedHeight + 2.5, 0);
      sprite.visible = simulationState.showHeights;
      bGroup.add(sprite);
      floatingSprites.push(sprite);

      buildingsGroup.add(bGroup);
      buildingMeshes.set(b.id, bGroup);
    });

    scene.add(buildingsGroup);
    scene.add(hazardRingsGroup);

    // --- Evacuation Route (Glowing green ribbon with directional chevrons) ---
    const evacCurve = new THREE.CatmullRomCurve3(
      EVACUATION_PATH_POINTS.map((pt) => new THREE.Vector3(pt[0], pt[1] + 0.4, pt[2]))
    );
    const evacGeo = new THREE.TubeGeometry(evacCurve, 50, 0.4, 8, false);
    const evacMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.85,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const evacMesh = new THREE.Mesh(evacGeo, evacMat);
    evacMesh.visible = simulationState.evacuationMode;
    scene.add(evacMesh);

    // --- Environment Trees (Placed ONLY on distant ridges & castle cliff so they NEVER block camera view!) ---
    const propsGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });

    // Tasteful perimeter locations ONLY (NO foreground trees blocking camera frustum!)
    const treePositions: [number, number][] = [
      [28, 6], [32, -6], [30, -18], [24, -24], // Around castle perimeter
      [-32, 24], [-24, 28], [12, 30], [24, 26], // Far background ridges
      [22, 10], [18, -4], // Small cliffside foliage
    ];

    treePositions.forEach(([tx, tz]) => {
      const ty = getElevationAt(tx, tz);
      const tree = new THREE.Group();
      tree.position.set(tx, ty, tz);

      // Moderate scale
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.2, 7), trunkMat);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);

      const fol1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.8, 7), foliageMat1);
      fol1.position.y = 2.8;
      fol1.castShadow = true;
      tree.add(fol1);

      const fol2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.2, 7), foliageMat2);
      fol2.position.y = 4.0;
      fol2.castShadow = true;
      tree.add(fol2);

      propsGroup.add(tree);
    });

    scene.add(propsGroup);

    // --- Playable Wizard Avatar (Optional walk mode) ---
    const wizardGroup = new THREE.Group();
    wizardGroup.position.set(-6, getElevationAt(-6, 0), 0);

    // Robes
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
    const robeMesh = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 8), robeMat);
    robeMesh.position.y = 0.9;
    robeMesh.castShadow = true;
    wizardGroup.add(robeMesh);

    // Head
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfde047 }));
    headMesh.position.y = 2.0;
    wizardGroup.add(headMesh);

    // Pointed Wizard Hat
    const hatMesh = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0x1e1b4b }));
    hatMesh.position.y = 2.6;
    wizardGroup.add(hatMesh);

    scene.add(wizardGroup);

    // --- Interactive Orbit & Drag Controls ---
    let isPointerDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitAzimuth = -0.15; // Centered angle matching Image 2
    let orbitPolar = 0.48; // Elevated 3/4 isometric angle
    let orbitDist = 58;

    let dronePos = new THREE.Vector3(0, 30, 40);
    let dronePitch = -0.4;
    let droneYaw = 0;

    let avatarPos = wizardGroup.position.clone();
    let avatarRotation = 0;

    const keysPressed: Record<string, boolean> = {};

    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      isPointerDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isPointerDown = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (simStateRef.current.cameraMode === 'fly') {
        droneYaw -= dx * 0.003;
        dronePitch = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, dronePitch - dy * 0.003));
      } else if (simStateRef.current.cameraMode === 'avatar') {
        avatarRotation -= dx * 0.005;
      } else {
        // Orbit mode: smooth orbiting around village center
        orbitAzimuth -= dx * 0.005;
        orbitPolar = Math.max(0.15, Math.min(Math.PI * 0.45, orbitPolar + dy * 0.004));
      }
    };

    // Raycasting for clicking on buildings
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onClickCanvas = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObjects(buildingsGroup.children, true);

      if (intersects.length > 0) {
        let currentObj: THREE.Object3D | null = intersects[0].object;
        while (currentObj && currentObj.parent && currentObj.parent !== buildingsGroup) {
          currentObj = currentObj.parent;
        }
        if (currentObj && currentObj.name) {
          const matched = buildingsRef.current.find((b) => b.id === currentObj?.name);
          if (matched) {
            onSelectBuilding(matched);
            soundEngine.playMagicChime();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClickCanvas);

    // --- Animation Loop ---
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const state = simStateRef.current;

      // 1. Water Level Elevation
      const effectiveWaterLevel = isCompareSecondary ? 0 : state.waterLevel;
      waterMesh.position.y = THREE.MathUtils.lerp(waterMesh.position.y, effectiveWaterLevel, 0.08);

      // Dynamic water undulating waves
      const wPos = waterGeo.attributes.position;
      for (let i = 0; i < wPos.count; i++) {
        const u = wPos.getX(i);
        const v = wPos.getZ(i);
        const waveH = Math.sin(u * 0.15 + elapsed * 2.2) * 0.25 + Math.cos(v * 0.15 + elapsed * 1.8) * 0.25;
        wPos.setY(i, waveH);
      }
      waterGeo.computeVertexNormals();
      wPos.needsUpdate = true;

      // 2. Colossal Tsunami Wave Animation
      if (state.isFloodActive && !isCompareSecondary) {
        waveGroup.visible = true;
        // Sweeping surge along X axis towards the village
        const surgeX = -38 + Math.sin(elapsed * 1.2) * 8;
        waveGroup.position.x = surgeX;
        waveGroup.position.y = Math.max(waterMesh.position.y, 1.5) + Math.sin(elapsed * 3) * 0.4;
        waveGroup.scale.set(1, Math.min(effectiveWaterLevel / 4.5 + 0.6, 2.5), 1);

        // Spray particles animation
        const sPos = sprayGeo.attributes.position;
        for (let i = 0; i < sprayCount; i++) {
          let y = sPos.getY(i) - delta * 4;
          if (y < 2) y = 14 + Math.random() * 4;
          sPos.setY(i, y);
        }
        sPos.needsUpdate = true;
      } else {
        // Subtle background sea wave
        waveGroup.visible = state.waterLevel > 4;
      }

      // 3. Bobbing Debris in Flood
      debrisItems.forEach(({ mesh, basePos, speed }) => {
        mesh.position.y = Math.max(basePos.y, waterMesh.position.y + 0.4) + Math.sin(elapsed * speed * 3) * 0.35;
        mesh.rotation.x = Math.sin(elapsed * speed) * 0.3;
        mesh.rotation.z = Math.cos(elapsed * speed) * 0.3;
      });

      // 4. Update Building Visuals & Damage
      buildingMeshes.forEach((meshGroup, id) => {
        const b = buildingsRef.current.find((item) => item.id === id);
        if (!b) return;

        const isSubmerged = !b.isShelter && effectiveWaterLevel > b.groundElevation + 0.8;
        if (isSubmerged) {
          // Tilt damaged cottage
          meshGroup.rotation.z = THREE.MathUtils.lerp(meshGroup.rotation.z, 0.15, 0.05);
          meshGroup.position.y = THREE.MathUtils.lerp(
            meshGroup.position.y,
            b.groundElevation + Math.sin(elapsed * 4 + b.position[0]) * 0.25,
            0.1
          );
        } else {
          meshGroup.rotation.z = THREE.MathUtils.lerp(meshGroup.rotation.z, 0, 0.05);
          meshGroup.position.y = THREE.MathUtils.lerp(meshGroup.position.y, b.groundElevation, 0.1);
        }
      });

      // 5. Update Height Visibility
      measurementLines.forEach((l) => (l.visible = state.showHeights));
      floatingSprites.forEach((s) => (s.visible = state.showHeights));
      evacMesh.visible = state.evacuationMode;

      // 6. Camera Positioning based on CameraMode
      if (state.cameraMode === 'fly') {
        // Drone Flythrough Mode
        const flySpeed = (keysPressed['shift'] ? 24 : 12) * delta;
        const forward = new THREE.Vector3(0, 0, -1)
          .applyAxisAngle(new THREE.Vector3(1, 0, 0), dronePitch)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), droneYaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), droneYaw);

        if (keysPressed['w']) dronePos.addScaledVector(forward, flySpeed);
        if (keysPressed['s']) dronePos.addScaledVector(forward, -flySpeed);
        if (keysPressed['a']) dronePos.addScaledVector(right, -flySpeed);
        if (keysPressed['d']) dronePos.addScaledVector(right, flySpeed);
        if (keysPressed['e']) dronePos.y += flySpeed;
        if (keysPressed['q']) dronePos.y = Math.max(3, dronePos.y - flySpeed);

        camera.position.lerp(dronePos, 0.2);
        camera.rotation.order = 'YXZ';
        camera.rotation.y = droneYaw;
        camera.rotation.x = dronePitch;
      } else if (state.cameraMode === 'avatar') {
        // Third-person Avatar Mode
        const moveSpeed = (keysPressed['shift'] ? 14 : 7) * delta;
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), avatarRotation);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), avatarRotation);

        if (keysPressed['w'] || keysPressed['arrowup']) avatarPos.addScaledVector(forward, moveSpeed);
        if (keysPressed['s'] || keysPressed['arrowdown']) avatarPos.addScaledVector(forward, -moveSpeed);
        if (keysPressed['a'] || keysPressed['arrowleft']) avatarPos.addScaledVector(right, -moveSpeed);
        if (keysPressed['d'] || keysPressed['arrowright']) avatarPos.addScaledVector(right, moveSpeed);

        avatarPos.x = Math.max(-45, Math.min(45, avatarPos.x));
        avatarPos.z = Math.max(-45, Math.min(45, avatarPos.z));
        avatarPos.y = getElevationAt(avatarPos.x, avatarPos.z);

        wizardGroup.position.copy(avatarPos);
        wizardGroup.rotation.y = avatarRotation;

        const camOffset = new THREE.Vector3(0, 6, 12).applyAxisAngle(new THREE.Vector3(0, 1, 0), avatarRotation);
        camera.position.lerp(avatarPos.clone().add(camOffset), 0.12);
        camera.lookAt(avatarPos.x, avatarPos.y + 2, avatarPos.z);
      } else {
        // Orbit / Cinematic Command Overview Mode (MATCHING IMAGE 2 EXACTLY!)
        // Elevated panoramic vantage point
        const lookTarget = new THREE.Vector3(4, 9, -5);
        const camX = lookTarget.x + Math.sin(orbitAzimuth) * Math.cos(orbitPolar) * orbitDist;
        const camY = lookTarget.y + Math.sin(orbitPolar) * orbitDist;
        const camZ = lookTarget.z + Math.cos(orbitAzimuth) * Math.cos(orbitPolar) * orbitDist;

        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        camera.lookAt(lookTarget);
      }

      // 7. Calculate 2D Screen Projections for In-World Callout Badges (Image 2 style)
      const currentMarkers: ProjectedMarker[] = [];
      const halfW = (container.clientWidth || window.innerWidth) / 2;
      const halfH = (container.clientHeight || window.innerHeight) / 2;

      // Project Safe Zone (High Citadel on the right)
      const citadelObj = buildingsRef.current.find((b) => b.isShelter);
      if (citadelObj) {
        const cVec = new THREE.Vector3(citadelObj.position[0], citadelObj.groundElevation + 14, citadelObj.position[2]);
        cVec.project(camera);
        if (cVec.z < 1) {
          currentMarkers.push({
            id: 'safe_citadel',
            type: 'safe_citadel',
            x: cVec.x * halfW + halfW,
            y: -cVec.y * halfH + halfH,
            visible: true,
            name: 'Safe Zone (Higher Ground)',
            elevation: citadelObj.groundElevation,
          });
        }
      }

      // Project Low Buildings At High Risk Callout
      const lowClusterVec = new THREE.Vector3(-14, 12, -2);
      lowClusterVec.project(camera);
      if (lowClusterVec.z < 1) {
        currentMarkers.push({
          id: 'low_risk_group',
          type: 'low_risk_group',
          x: lowClusterVec.x * halfW + halfW,
          y: -lowClusterVec.y * halfH + halfH,
          visible: true,
          name: 'Low Buildings At High Risk',
        });
      }

      // Project Individual Red Exclamation Pins over Low Cottages
      buildingsRef.current
        .filter((b) => !b.isShelter && b.groundElevation < 10)
        .slice(0, 5)
        .forEach((b) => {
          const bVec = new THREE.Vector3(b.position[0], b.groundElevation + b.estimatedHeight + 2.0, b.position[2]);
          bVec.project(camera);
          if (bVec.z < 1) {
            currentMarkers.push({
              id: `hazard_${b.id}`,
              type: 'cottage_hazard',
              x: bVec.x * halfW + halfW,
              y: -bVec.y * halfH + halfH,
              visible: true,
            });
          }
        });

      setMarkers(currentMarkers);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClickCanvas);
      window.removeEventListener('resize', onResize);

      renderer.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [buildings, isCompareSecondary]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden">
      {/* --- In-World 3D Callout Badges (Exact Theme & Styling from Image 2!) --- */}
      {markers.map((m) => {
        if (!m.visible) return null;

        if (m.type === 'safe_citadel') {
          return (
            <div
              key={m.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full z-20 transition-transform duration-75"
              style={{ left: `${m.x}px`, top: `${m.y}px` }}
            >
              <div className="flex items-center gap-2.5 bg-emerald-600/90 text-white px-3.5 py-1.5 rounded-full border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.8)] backdrop-blur-md">
                <div className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center border border-emerald-300">
                  <Shield className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bold text-xs font-sans tracking-wide">Safe Zone</span>
                  <span className="text-[10px] text-emerald-100 font-medium">(Higher Ground)</span>
                </div>
              </div>
              {/* Pointer Arrow pointing to the castle */}
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-emerald-400 mx-auto mt-0.5" />
            </div>
          );
        }

        if (m.type === 'low_risk_group') {
          return (
            <div
              key={m.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full z-20 transition-transform duration-75"
              style={{ left: `${m.x}px`, top: `${m.y}px` }}
            >
              <div className="flex items-center gap-2.5 bg-rose-600/90 text-white px-4 py-2 rounded-2xl border-2 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.8)] backdrop-blur-md">
                <div className="w-6 h-6 rounded-full bg-rose-800 flex items-center justify-center border border-rose-300 animate-pulse">
                  <span className="text-white font-black text-sm">!</span>
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bold text-xs font-sans tracking-wide">Low Buildings</span>
                  <span className="text-[10px] text-rose-100 font-medium">At High Risk</span>
                </div>
              </div>
              {/* Pointer Line */}
              <div className="w-0.5 h-10 bg-rose-400 mx-auto shadow-sm" />
            </div>
          );
        }

        if (m.type === 'cottage_hazard') {
          return (
            <div
              key={m.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-75"
              style={{ left: `${m.x}px`, top: `${m.y}px` }}
            >
              <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-[0_0_12px_rgba(244,63,94,0.9)] flex items-center justify-center text-white font-black text-xs animate-bounce">
                !
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
