(()=>{'use strict';
const LOCK_CLASS='layer-locked';
const lockedKeys=new Set(JSON.parse(localStorage.getItem('corel3d-layer-locks')||'[]'));
let currentKey=null;
const $=id=>document.getElementById(id);
const mutatingIds=new Set(['delete','deleteQuick','duplicate','move','rotate','scale','mx','my','mz','center','ground','relief','basrelief']);
const propertyIds=new Set(['name','depth','bevel','px','py','pz','rx','ry','rz','sx','sy','sz','color','finish']);
function save(){localStorage.setItem('corel3d-layer-locks',JSON.stringify([...lockedKeys]))}
function status(t){const s=$('status');if(s){s.textContent=t;s.style.color='#ffd083'}}
function layerKey(layer,index){
  const name=(layer.querySelector('span')?.textContent||`camada-${index}`).trim();
  const siblings=[...layer.parentElement.querySelectorAll('.layer')];
  const sameBefore=siblings.slice(0,index).filter(x=>(x.querySelector('span')?.textContent||'').trim()===name).length;
  return `${name}::${sameBefore}`;
}
function isCurrentLocked(){return !!currentKey&&lockedKeys.has(currentKey)}
function syncCurrent(){
  const layers=[...document.querySelectorAll('#layers .layer')];
  const active=layers.find(x=>x.classList.contains('active'));
  currentKey=active?active.dataset.lockKey||null:null;
  applyEditorState();
}
function applyEditorState(){
  const locked=isCurrentLocked();
  document.body.classList.toggle('has-locked-selection',locked);
  for(const id of mutatingIds){const el=$(id);if(el){el.classList.toggle('locked-disabled',locked);el.title=locked?'Camada bloqueada':''}}
  for(const id of propertyIds){const el=$(id);if(el){el.classList.toggle('locked-field',locked);el.title=locked?'Desbloqueie a camada para editar':''}}
  const sel=$('selected');if(sel){sel.dataset.locked=locked?'1':'0'}
}
function decorateLayers(){
  const container=$('layers');if(!container)return;
  const layers=[...container.querySelectorAll('.layer')];
  layers.forEach((layer,index)=>{
    const key=layerKey(layer,index);layer.dataset.lockKey=key;
    let btn=layer.querySelector('.layer-lock-btn');
    if(!btn){
      btn=document.createElement('button');btn.type='button';btn.className='layer-lock-btn';btn.setAttribute('aria-label','Bloquear camada');
      btn.addEventListener('pointerdown',e=>{e.stopPropagation()});
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
        const k=layer.dataset.lockKey;if(!k)return;
        if(lockedKeys.has(k)){lockedKeys.delete(k);status('Camada desbloqueada')}else{lockedKeys.add(k);status('Camada bloqueada')}
        save();decorateLayers();syncCurrent();
      },true);
      layer.appendChild(btn);
    }
    const locked=lockedKeys.has(key);layer.classList.toggle(LOCK_CLASS,locked);btn.textContent=locked?'🔒':'🔓';btn.title=locked?'Desbloquear camada':'Bloquear camada';
  });
  syncCurrent();
}
function blockIfLocked(e){
  if(!isCurrentLocked())return;
  const target=e.target.closest?.('[id]');if(!target)return;
  if(mutatingIds.has(target.id)||propertyIds.has(target.id)){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();status('🔒 Camada bloqueada — desbloqueie para editar');
  }
}
document.addEventListener('click',blockIfLocked,true);
document.addEventListener('change',blockIfLocked,true);
document.addEventListener('input',blockIfLocked,true);
document.addEventListener('keydown',e=>{
  if(!isCurrentLocked())return;
  if(e.key==='Delete'||e.key==='Backspace'){
    const tag=document.activeElement?.tagName;
    if(tag!=='INPUT'&&tag!=='TEXTAREA'){e.preventDefault();e.stopImmediatePropagation();status('🔒 Camada bloqueada — não pode excluir')}
  }
},true);
function attachCanvasGuard(){
  const canvas=document.querySelector('#stage canvas');if(!canvas||canvas.dataset.lockGuard)return;canvas.dataset.lockGuard='1';
  canvas.addEventListener('pointerdown',e=>{
    if(isCurrentLocked()&&e.button===0){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();status('🔒 Camada bloqueada — use a lista de camadas para selecionar outra')}
  },true);
}
const observer=new MutationObserver(()=>{decorateLayers();attachCanvasGuard()});
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
const style=document.createElement('style');style.textContent=`
.layer{grid-template-columns:1fr auto auto!important}.layer-lock-btn{width:28px;height:28px;border:1px solid #2a3950;background:#101824;color:#dce6f5;border-radius:7px;padding:0;display:grid;place-items:center;cursor:pointer;font-size:13px}.layer-lock-btn:hover{border-color:#536783}.layer.${LOCK_CLASS}{border-color:#7b6334!important;background:#17140d!important}.layer.${LOCK_CLASS} span:after{content:'  BLOQUEADA';font-size:8px;color:#e6bb66;letter-spacing:.08em}.locked-disabled,.locked-field{opacity:.45!important;cursor:not-allowed!important}.has-locked-selection #selected:after{content:'  🔒';color:#ffd083}
`;document.head.appendChild(style);
setInterval(()=>{decorateLayers();attachCanvasGuard()},700);
})();