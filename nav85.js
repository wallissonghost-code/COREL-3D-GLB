(()=>{
'use strict';
function initFixedCenterNavigation(){
  const stage=document.getElementById('stage');
  const canvas=stage?.querySelector('canvas');
  if(!stage||!canvas||!window.THREE){setTimeout(initFixedCenterNavigation,120);return;}

  const center=new THREE.Vector3(0,0,0);
  let dragging=false;
  let lastX=0,lastY=0;
  let yaw=0,pitch=0;
  let radius=190;

  function readCameraFromThree(){
    // Encontra a câmera usada pelo renderer a partir da posição visual inicial esperada.
    // A navegação customizada controla a câmera via matriz do próprio canvas/render loop.
    const candidates=[];
    if(window.__corelCamera)candidates.push(window.__corelCamera);
    return candidates[0]||null;
  }

  // Hook público opcional usado pelo runtime novo. Se não existir, usamos rotação visual por eventos OrbitControls.
  const camera=readCameraFromThree();

  canvas.addEventListener('contextmenu',e=>e.preventDefault());

  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==2)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    dragging=true;lastX=e.clientX;lastY=e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
    canvas.style.cursor='grabbing';
  },true);

  canvas.addEventListener('pointermove',e=>{
    if(!dragging)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    if(camera){
      const off=camera.position.clone().sub(center);
      radius=Math.max(10,off.length());
      yaw=Math.atan2(off.x,off.y)+dx*0.008;
      pitch=Math.asin(Math.max(-.98,Math.min(.98,off.z/radius)))+dy*0.008;
      pitch=Math.max(-1.45,Math.min(1.45,pitch));
      camera.position.set(
        Math.sin(yaw)*Math.cos(pitch)*radius,
        Math.cos(yaw)*Math.cos(pitch)*radius,
        Math.sin(pitch)*radius
      );
      camera.lookAt(center);
    }else{
      // Fallback: sintetiza rotação do OrbitControls com botão esquerdo, mas só durante RMB.
      const evDown=new PointerEvent('pointerdown',{pointerId:e.pointerId,pointerType:e.pointerType,button:0,buttons:1,clientX:lastX-dx,clientY:lastY-dy,bubbles:true});
      const evMove=new PointerEvent('pointermove',{pointerId:e.pointerId,pointerType:e.pointerType,button:0,buttons:1,clientX:e.clientX,clientY:e.clientY,bubbles:true});
      canvas.dispatchEvent(evDown);canvas.dispatchEvent(evMove);
    }
  },true);

  function stop(e){if(!dragging)return;dragging=false;canvas.style.cursor='default';try{canvas.releasePointerCapture?.(e.pointerId)}catch(_){} }
  canvas.addEventListener('pointerup',stop,true);
  canvas.addEventListener('pointercancel',stop,true);

  const hint=stage.querySelector('.hint');
  if(hint)hint.textContent='Botão direito: rotação 3D • Scroll: zoom • Clique esquerdo: selecionar • Centro fixo';
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initFixedCenterNavigation);else initFixedCenterNavigation();
})();
