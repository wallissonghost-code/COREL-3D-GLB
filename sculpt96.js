(()=>{
'use strict';
const $=id=>document.getElementById(id);
const panel=document.querySelector('.panel.left');
if(!panel)return;
let sec=$('sculptSection');
if(!sec){
 sec=document.createElement('section');sec.id='sculptSection';
 sec.innerHTML=`<h3>PINCEL 3D PRO</h3>
 <div id="sculptState" class="sub">⏳ Aguardando motor 3D...</div>
 <button id="sculptToggle" disabled>🖌️ Ativar pincel</button>
 <label class="field-block"><span>Tipo de pincel</span><select id="sculptMode">
 <option value="raise">Elevar</option><option value="lower">Afundar</option><option value="inflate">Inflar</option><option value="flatten">Achatar</option><option value="pinch">Pinçar</option><option value="crease">Corte / Crease</option><option value="smooth">Suavizar</option>
 </select><small>define como a superfície será modelada</small></label>
 <div class="grid2 labeled"><label><span>Tamanho</span><input id="sculptRadius" type="range" min="1" max="60" step="1" value="14"><small>raio da área</small></label><label><span>Força</span><input id="sculptStrength" type="range" min="0.05" max="2" step="0.05" value="0.45"><small>intensidade</small></label></div>
 <div class="grid2"><button id="sculptUndo" disabled>↶ Desfazer pincel</button><button id="sculptReset" disabled>Limpar detalhe</button></div>
 <button id="sculptSubdivide" class="primary" disabled>➕ Subdividir peça para mais detalhes</button>
 <small id="sculptInfo" class="sub">Passe o mouse sobre uma peça para ver a densidade da malha.</small>
 <small class="sub">Elevar cria volume • Afundar cava • Inflar engrossa • Achatar nivela • Pinçar concentra • Crease cria sulco • Suavizar remove irregularidades.</small>`;
 const model=[...panel.querySelectorAll('section')].find(s=>s.querySelector('h3')?.textContent.trim()==='MODELAGEM');
 if(model)model.after(sec);else panel.appendChild(sec);
}
if(!window.THREE){$('sculptState').textContent='❌ Three.js não carregou';return;}
const CAP=window.__COREL_SCULPT_CAPTURE={scene:null,camera:null,renderer:null};
const Scene0=THREE.Scene,Camera0=THREE.PerspectiveCamera,Renderer0=THREE.WebGLRenderer;
try{
 THREE.Scene=class extends Scene0{constructor(...a){super(...a);CAP.scene=this;}};
 THREE.PerspectiveCamera=class extends Camera0{constructor(...a){super(...a);CAP.camera=this;}};
 THREE.WebGLRenderer=class extends Renderer0{constructor(...a){super(...a);CAP.renderer=this;}};
}catch(e){console.warn('Sculpt capture patch:',e)}
let tries=0;
function init(){
 tries++;
 if(!CAP.scene||!CAP.camera||!CAP.renderer||!CAP.renderer.domElement){
   $('sculptState').textContent=tries>80?'❌ Pincel não conectou ao motor 3D':'⏳ Aguardando motor 3D...';
   if(tries<=80)setTimeout(init,125);return;
 }
 if(window.__COREL_SCULPT_READY)return;window.__COREL_SCULPT_READY=true;
 const canvas=CAP.renderer.domElement;
 $('sculptState').textContent='✅ Pincel pronto';
 ['sculptToggle','sculptUndo','sculptReset','sculptSubdivide'].forEach(id=>$(id).disabled=false);
 let active=false,painting=false,currentMesh=null,lastStroke=null,lastHovered=null,undo=[];
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),zAxis=new THREE.Vector3(0,0,1);
 const cursor=new THREE.Mesh(new THREE.RingGeometry(.94,1,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,side:THREE.DoubleSide,depthTest:false}));
 cursor.visible=false;cursor.renderOrder=9999;CAP.scene.add(cursor);
 function status(t,err=false){const s=$('status');if(s){s.textContent=t;s.style.color=err?'#ff8da0':'#84dca8'}}
 function meshes(){const a=[];CAP.scene.traverse(o=>{if(o.isMesh&&o!==cursor&&o.geometry?.attributes?.position&&o.visible&&o.userData?.partId!=null)a.push(o)});return a;}
 function hitAt(e){const r=canvas.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(mouse,CAP.camera);return ray.intersectObjects(meshes(),false)[0]||null;}
 const radius=()=>+$('sculptRadius').value||14,strength=()=>+$('sculptStrength').value||.45;
 function stats(mesh){if(!mesh?.geometry)return;const g=mesh.geometry,p=g.attributes.position,tri=Math.round((g.index?g.index.count:p.count)/3);$('sculptInfo').textContent=`Malha: ${p.count.toLocaleString('pt-BR')} vértices • ${tri.toLocaleString('pt-BR')} triângulos`;}
 function saveStroke(mesh){const p=mesh.geometry.attributes.position;lastStroke={mesh,arr:new Float32Array(p.array)};}
 function finishStroke(){if(lastStroke){undo.push(lastStroke);if(undo.length>40)undo.shift();lastStroke=null;status('Detalhe do pincel aplicado')}}
 function deform(hit){
  const mesh=hit.object;if(!mesh?.geometry?.attributes?.position)return;
  if(!currentMesh)currentMesh=mesh;if(mesh!==currentMesh){finishStroke();currentMesh=mesh;saveStroke(mesh)}
  const g=mesh.geometry,pos=g.attributes.position;if(!lastStroke)saveStroke(mesh);if(!g.attributes.normal)g.computeVertexNormals();const nor=g.attributes.normal;
  const local=mesh.worldToLocal(hit.point.clone()),rad=radius(),str=strength(),mode=$('sculptMode').value,planeN=(hit.face?.normal?.clone()||new THREE.Vector3(0,0,1)).normalize();
  const affected=[];let cx=0,cy=0,cz=0,ws=0;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),dx=x-local.x,dy=y-local.y,dz=z-local.z,d=Math.hypot(dx,dy,dz);if(d<=rad){const fall=Math.pow(1-d/rad,2);affected.push([i,fall,x,y,z]);cx+=x*fall;cy+=y*fall;cz+=z*fall;ws+=fall;}}
  if(!affected.length)return;cx/=ws||1;cy/=ws||1;cz/=ws||1;
  for(const [i,fall,x,y,z] of affected){const k=str*fall,dx=x-local.x,dy=y-local.y,dz=z-local.z;let nx=nor?nor.getX(i):0,ny=nor?nor.getY(i):0,nz=nor?nor.getZ(i):1;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
   if(mode==='raise'||mode==='lower'){const amt=(mode==='lower'?-1:1)*k*.55;pos.setXYZ(i,x+nx*amt,y+ny*amt,z+nz*amt)}
   else if(mode==='inflate'){const amt=k*.75;pos.setXYZ(i,x+nx*amt,y+ny*amt,z+nz*amt)}
   else if(mode==='smooth'){const q=Math.min(.42,str*.14)*fall;pos.setXYZ(i,x+(cx-x)*q,y+(cy-y)*q,z+(cz-z)*q)}
   else if(mode==='flatten'){const dist=dx*planeN.x+dy*planeN.y+dz*planeN.z,q=Math.min(.65,k*.35);pos.setXYZ(i,x-planeN.x*dist*q,y-planeN.y*dist*q,z-planeN.z*dist*q)}
   else if(mode==='pinch'){const q=Math.min(.7,k*.22),tx=local.x-x,ty=local.y-y,tz=local.z-z,dot=tx*planeN.x+ty*planeN.y+tz*planeN.z;pos.setXYZ(i,x+(tx-planeN.x*dot)*q,y+(ty-planeN.y*dot)*q,z+(tz-planeN.z*dot)*q)}
   else if(mode==='crease'){const q=Math.min(.65,k*.18),tx=local.x-x,ty=local.y-y,tz=local.z-z,dot=tx*planeN.x+ty*planeN.y+tz*planeN.z,cut=k*.32;pos.setXYZ(i,x+(tx-planeN.x*dot)*q-nx*cut,y+(ty-planeN.y*dot)*q-ny*cut,z+(tz-planeN.z*dot)*q-nz*cut)}
  }
  pos.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
 }
 function updateCursor(e){if(!active){cursor.visible=false;return}const hit=hitAt(e);if(!hit){cursor.visible=false;return}lastHovered=hit.object;stats(lastHovered);cursor.visible=true;cursor.position.copy(hit.point);const n=hit.face?.normal?.clone()||new THREE.Vector3(0,0,1);n.transformDirection(hit.object.matrixWorld);cursor.quaternion.setFromUnitVectors(zAxis,n.normalize());cursor.scale.setScalar(radius());}
 function subdivide(mesh){if(!mesh?.geometry?.attributes?.position)return status('Passe o mouse sobre uma peça primeiro',true);const src=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone(),p=src.attributes.position,tri=p.count/3;if(tri>60000){src.dispose();return status('Malha já está pesada demais para subdividir',true)}const out=[],v=i=>new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)),push=(a,b,c)=>out.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);for(let i=0;i<p.count;i+=3){const a=v(i),b=v(i+1),c=v(i+2),ab=a.clone().add(b).multiplyScalar(.5),bc=b.clone().add(c).multiplyScalar(.5),ca=c.clone().add(a).multiplyScalar(.5);push(a,ab,ca);push(ab,b,bc);push(ca,bc,c);push(ab,bc,ca)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(out,3));g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();undo.push({mesh,geometry:mesh.geometry.clone()});if(undo.length>40)undo.shift();const old=mesh.geometry;mesh.geometry=g;old.dispose();src.dispose();stats(mesh);status(`Malha subdividida: ${Math.round(out.length/9).toLocaleString('pt-BR')} triângulos`)}
 $('sculptToggle').onclick=()=>{active=!active;$('sculptToggle').textContent=active?'✅ Pincel ativo':'🖌️ Ativar pincel';$('sculptToggle').classList.toggle('primary',active);cursor.visible=false;status(active?'Pincel 3D ativo • arraste com o botão esquerdo':'Pincel 3D desativado')};
 $('sculptUndo').onclick=()=>{const u=undo.pop();if(!u)return status('Nada do pincel para desfazer',true);if(u.geometry){const old=u.mesh.geometry;u.mesh.geometry=u.geometry;old.dispose();stats(u.mesh);return status('Subdivisão desfeita')}const p=u.mesh?.geometry?.attributes?.position;if(!p||p.array.length!==u.arr.length)return status('Não foi possível desfazer esta etapa',true);p.array.set(u.arr);p.needsUpdate=true;u.mesh.geometry.computeVertexNormals();u.mesh.geometry.computeBoundingBox();u.mesh.geometry.computeBoundingSphere();status('Pincel desfeito')};
 $('sculptReset').onclick=()=>{if(!undo.length)return status('Nenhum detalhe para limpar',true);while(undo.length){const u=undo.shift();if(u.geometry){const old=u.mesh.geometry;u.mesh.geometry=u.geometry;old.dispose();break}if(u.mesh?.geometry?.attributes?.position&&u.mesh.geometry.attributes.position.array.length===u.arr.length){u.mesh.geometry.attributes.position.array.set(u.arr);u.mesh.geometry.attributes.position.needsUpdate=true;u.mesh.geometry.computeVertexNormals();break}}undo=[];status('Detalhes do pincel limpos')};
 $('sculptSubdivide').onclick=()=>subdivide(lastHovered);
 canvas.addEventListener('pointermove',e=>{const h=hitAt(e);if(h){lastHovered=h.object;stats(lastHovered)}updateCursor(e);if(active&&painting&&e.buttons===1){const hit=hitAt(e);if(hit)deform(hit)}},true);
 canvas.addEventListener('pointerdown',e=>{if(!active||e.button!==0)return;const h=hitAt(e);if(!h)return;e.preventDefault();e.stopPropagation();painting=true;currentMesh=h.object;lastHovered=h.object;saveStroke(currentMesh);deform(h)},true);
 window.addEventListener('pointerup',()=>{if(painting){painting=false;finishStroke();currentMesh=null}},true);
 canvas.addEventListener('mouseleave',()=>cursor.visible=false);
}
setTimeout(init,0);
})();