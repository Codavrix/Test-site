import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const stage = document.querySelector("#cat-stage");
const canvas = document.querySelector("#cat-canvas");
if (stage && canvas) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, stage.clientWidth / stage.clientHeight, 0.1, 100);
    camera.position.set(0, 1.25, 6.7);

    scene.add(new THREE.HemisphereLight(0xf8f5ed, 0x34313a, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(-3, 5, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x9ba7c2, 2.1);
    rim.position.set(4, 2, -4); scene.add(rim);
    const fill = new THREE.PointLight(0xd5c8b8, 18, 12);
    fill.position.set(0, 1.2, 3.5); scene.add(fill);

    const cat = new THREE.Group();
    scene.add(cat);
    const black = new THREE.MeshPhysicalMaterial({ color: 0x111216, roughness: 0.3, metalness: 0.04, clearcoat: 0.48, clearcoatRoughness: 0.22 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x202127, roughness: 0.4 });
    const eye = new THREE.MeshPhysicalMaterial({ color: 0xc6a76b, roughness: 0.2, metalness: 0.18, emissive: 0x493719, emissiveIntensity: 0.15 });
    const pupil = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x7e5960, roughness: 0.38 });
    const add = (geo, mat, pos, scale, parent=cat) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...pos); if (scale) m.scale.set(...scale);
      m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    };
    const sphere = new THREE.SphereGeometry(1, 48, 32);
    add(sphere, black, [0, -0.08, 0], [0.83, 0.94, 0.58]); // body
    add(sphere, black, [0, 0.72, 0.22], [0.66, 0.62, 0.57]); // head
    // Soft cheeks
    add(sphere, black, [-0.36, 0.48, 0.58], [0.34, 0.25, 0.2]);
    add(sphere, black, [0.36, 0.48, 0.58], [0.34, 0.25, 0.2]);
    // Ears: rounded triangular silhouettes
    const earGeo = new THREE.ConeGeometry(0.27, 0.72, 4, 1);
    const earL = add(earGeo, black, [-0.43, 1.26, 0.15], [0.92, 1, 0.62]); earL.rotation.z = -0.16; earL.rotation.y = -0.1;
    const earR = add(earGeo, black, [0.43, 1.26, 0.15], [0.92, 1, 0.62]); earR.rotation.z = 0.16; earR.rotation.y = 0.1;
    // Ear inset
    const innerMat = new THREE.MeshStandardMaterial({color:0x57434a,roughness:0.65});
    const innerGeo = new THREE.ConeGeometry(0.145,0.48,4,1);
    const inL=add(innerGeo,innerMat,[-0.43,1.28,0.285],[0.8,1,0.5]); inL.rotation.z=-0.16;
    const inR=add(innerGeo,innerMat,[0.43,1.28,0.285],[0.8,1,0.5]); inR.rotation.z=0.16;
    // Eyes facing camera
    for (const x of [-0.245,0.245]) {
      add(sphere, eye, [x,0.78,0.704],[0.105,0.072,0.035]);
      add(sphere, pupil, [x,0.78,0.737],[0.027,0.064,0.014]);
      add(sphere, new THREE.MeshBasicMaterial({color:0xffffff}), [x-0.025,0.81,0.752],[0.018,0.018,0.009]);
    }
    // Nose and muzzle
    add(new THREE.SphereGeometry(0.075,24,16),noseMat,[0,0.55,0.77],[1,0.72,0.75]);
    add(sphere,dark,[-0.105,0.43,0.7],[0.15,0.09,0.12]);
    add(sphere,dark,[0.105,0.43,0.7],[0.15,0.09,0.12]);
    // Four short rounded legs
    for (const x of [-0.52,0.52]) for (const z of [-0.3,0.32]) {
      const leg=add(new THREE.CapsuleGeometry(0.17,0.43,8,16),black,[x,-0.82,z],[1,1,1]);
      leg.rotation.z=x*0.12;
      add(sphere,black,[x,-1.05,z+0.02],[0.2,0.11,0.24]);
    }
    // Curved tail
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55,-0.55,-0.2),new THREE.Vector3(1.0,-0.25,-0.28),
      new THREE.Vector3(1.18,0.25,-0.25),new THREE.Vector3(1.02,0.55,-0.2),
      new THREE.Vector3(0.82,0.58,-0.12)
    ]);
    const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve,48,0.105,16,false),black);
    tail.castShadow=true;cat.add(tail);
    // Soft floor shadow
    const floor = new THREE.Mesh(new THREE.CircleGeometry(1.75,64),new THREE.MeshBasicMaterial({color:0xaaa69e,transparent:true,opacity:0.18}));
    floor.rotation.x=-Math.PI/2;floor.position.y=-1.18;floor.scale.set(1.35,0.56,1);scene.add(floor);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0,0.1,0); controls.enableDamping=true; controls.dampingFactor=0.06;
    controls.enablePan=false; controls.minDistance=5.2; controls.maxDistance=8.5;
    controls.minPolarAngle=0.65; controls.maxPolarAngle=2.15;
    controls.autoRotate=true; controls.autoRotateSpeed=0.8;
    const reset = document.querySelector("#cat-reset");
    reset?.addEventListener("click",()=>{controls.reset();controls.autoRotate=true;});
    renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
    const resize = () => {
      const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
      camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
    };
    new ResizeObserver(resize).observe(stage);
    renderer.domElement.addEventListener("pointerdown",()=>{controls.autoRotate=false;},{passive:true});
    stage.classList.add("ready");
  } catch (error) {
    const loading=document.querySelector("#cat-loading");
    if(loading)loading.textContent="3D-модель недоступна в этом браузере";
    stage.classList.add("failed");
    console.error("Omnivex 3D cat:",error);
  }
}
