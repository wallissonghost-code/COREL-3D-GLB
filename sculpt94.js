(()=>{
'use strict';
if(!window.THREE)return;
const CAP=window.__COREL_SCULPT_CAPTURE={scene:null,camera:null,renderer:null};
const Scene0=THREE.Scene, Camera0=THREE.PerspectiveCamera, Renderer0=THREE.WebGLRenderer;
THREE.Scene=class extends Scene0{constructor(...a){super(...a);CAP.scene=this;}};
THREE.PerspectiveCamera=class extends Camera0{constructor(...a){super(...a);CAP.camera=this;}};
THREE.WebGLRenderer=class extends Renderer0{constructor(...a){super(...a);CAP.renderer=this;}};

function init(){
 if(!CAP.scene||!CAP.camera||!CAP.renderer||!CAP.renderer.domElement)return setTimeout(init,120);
 const $=id=>document.getElementById(id), canvas=CAP.renderer.domElement;
 const panel=document.querySelector('.panel.left');
 if(!panel||$('sculptSection'))return;
 const sec=document.createElement('section');sec.id='sculptSection';
 sec.innerHTML=`<h3>PINCEL 3D</h3>
 <button id="sculptToggle">🖌️ Ativar pincel</button>
 <select id="sculptMode"><option value="raise">Elevar</option><option value="lower">Afundar</option><option value="smooth">Suavizar</option></select>
 <div class="grid2 labeled"><label><span>Tamanho</span><input id="sculptRadius" type="range" min="1" max="60" step="1" value="14"><small>área afetada</small></label><label><span>Força</span><input id="sculptStrength" type="range" min="0.05" max="2" step="0.05" value="0.45"><small>intensidade</small></label></div>
 <div class="grid2"><button id="sculptUndo">↶ Desfazer pincel</button><button id="sculptReset">Limpar detalhe</button></div>
 <small class="sub">Ative o pincel e arraste com o botão esquerdo sobre a peça. Elevar cria volume, Afundar cava e Suavizar reduz irregularidades. Botão direito continua girando a câmera.</small>`;
 const model=[...panel.querySelectorAll('section')].find(s=>s.querySelector('h3')?.textContent.trim()==='MODELAGEM');
 if(model)model.after(sec);else panel.appendChild(sec);
 let active=false,painting=false,currentMesh=null,lastStroke=null,undo=[];
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
 const cursor=new THREE.Mesh(new THREE.RingGeometry(.94,1,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,side:THREE.DoubleSide,depthTest:false}));
 cursor.visible=false;cursor.renderOrder=9999;CAP.scene.add(cursor);
 function meshes(){const a=[];CAP.scene.traverse(o=>{if(o.isMesh&&o!==cursor&&o.geometry?.attributes?.position&&o.visible&&o.userData?.partId!=null)a.push(o)});return a;}
 function hitAt(e){const r=canvas.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(mouse,CAP.camera);return ray.intersectObjects(meshes(),false)[0]||null;}
 function radius(){return +$('sculptRadius').value||14}function strength(){return +$('sculptStrength').value||.45}
 function saveStroke(mesh){const p=mesh.geometry.attributes.position;lastStroke={mesh,arr:new Float32Array(p.array)};}
 function finishStroke(){if(lastStroke){undo.push(lastStroke);if(undo.length>30)undo.shift();lastStroke=null;const s=$('status');if(s){s.textContent='Detalhe do pincel aplicado';s.style.color='#84dca8'}}}
 function deform(hit){const mesh=hit.object;if(!mesh||!mesh.geometry?.attributes?.position)return;if(!currentMesh)currentMesh=mesh;if(mesh!==currentMesh){finishStroke();currentMesh=mesh;saveStroke(mesh)}
 const g=mesh.geometry,pos=g.attributes.position;if(!lastStroke)saveStroke(mesh);if(!g.attributes.normal)g.computeVertexNormals();const nor=g.attributes.normal;
 const local=mesh.worldToLocal(hit.point.clone()),rad=radius(),str=strength(),mode=$('sculptMode').value;
 const affected=[];let cx=0,cy=0,cz=0;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),dx=x-local.x,dy=y-local.y,dz=z-local.z,d=Math.hypot(dx,dy,dz);if(d<=rad){const fall=Math.pow(1-d/rad,2);affected.push([i,fall,x,y,z]);cx+=x;cy+=y;cz+=z;}}
 if(!affected.length)return;
 if(mode==='smooth'){cx/=affected.length;cy/=affected.length;cz/=affected.length;for(const [i,fall,x,y,z] of affected){const k=Math.min(.35,str*.12)*fall;pos.setXYZ(i,x+(cx-x)*k,y+(cy-y)*k,z+(cz-z)*k)}}else{const sign=mode==='lower'?-1:1;for(const [i,fall,x,y,z] of affected){let nx=nor?nor.getX(i):0,ny=nor?nor.getY(i):0,nz=nor?nor.getZ(i):1;const len=Math.hypot(nx,ny,nz)||1;nx/=len;ny/=len;nz/=len;const amt=sign*str*.55*fall;pos.setXYZ(i,x+nx*amt,y+ny*amt,z+nz*amt)}}
 pos.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
 }
 function updateCursor(e){if(!active){cursor.visible=false;return}const hit=hitAt(e);if(!hit){cursor.visible=false;return}cursor.visible=true;cursor.position.copy(hit.point);const n=hit.face?.normal?.clone()||new THREE.Vector3(0,0,1);n.transformDirection(hit.object.matrixWorld);cursor.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n.normalize());cursor.scale.setScalar(radius());}
 $('sculptToggle').onclick=()=>{active=!active;$('sculptToggle').textContent=active?'✅ Pincel ativo':'🖌️ Ativar pincel';$('sculptToggle').classList.toggle('primary',active);cursor.visible=false;if(active){const s=$('status');if(s){s.textContent='Pincel 3D ativo • arraste sobre a peça';s.style.color='#84dca8'}}};
 $('sculptUndo').onclick=()=>{const u=undo.pop();if(!u)return;const p=u.mesh?.geometry?.attributes?.position;if(!p||p.array.length!==u.arr.length)return;p.array.set(u.arr);p.needsUpdate=true;u.mesh.geometry.computeVertexNormals();u.mesh.geometry.computeBoundingBox();u.mesh.geometry.computeBoundingSphere();};
 $('sculptReset').onclick=()=>{while(undo.length){const u=undo.shift();if(!u.mesh?.geometry?.attributes?.position)continue;const p=u.mesh.geometry.attributes.position;if(p.array.length===u.arr.length){p.array.set(u.arr);p.needsUpdate=true;u.mesh.geometry.computeVertexNormals();}}};
 canvas.addEventListener('pointermove',e=>{updateCursor(e);if(active&&painting&&e.buttons===1){const h=hitAt(e);if(h)deform(h)}},true);
 canvas.addEventListener('pointerdown',e=>{if(!active||e.button!==0)return;const h=hitAt(e);if(!h)return;e.preventDefault();painting=true;currentMesh=h.object;saveStroke(currentMesh);deform(h);},true);
 window.addEventListener('pointerup',()=>{if(painting){painting=false;finishStroke();currentMesh=null}},true);
 canvas.addEventListener('mouseleave',()=>cursor.visible=false);
}
setTimeout(init,0);
})();