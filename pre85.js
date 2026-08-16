(()=>{
'use strict';
if(!window.THREE||!THREE.PerspectiveCamera)return;
const Original=THREE.PerspectiveCamera;
function TrackedPerspectiveCamera(...args){
  const cam=new Original(...args);
  window.__corelCamera=cam;
  return cam;
}
TrackedPerspectiveCamera.prototype=Original.prototype;
Object.setPrototypeOf(TrackedPerspectiveCamera,Original);
THREE.PerspectiveCamera=TrackedPerspectiveCamera;
})();
