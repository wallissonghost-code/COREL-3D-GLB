(()=>{
'use strict';
function click(id){const el=document.getElementById(id);if(el&&!el.disabled){el.click();return true}return false}
window.addEventListener('keydown',e=>{
  const key=(e.key||'').toLowerCase();
  const cmd=e.ctrlKey||e.metaKey;
  if(cmd&&key==='z'){
    e.preventDefault();e.stopImmediatePropagation();
    if(e.shiftKey) click('redo'); else click('undo');
    return;
  }
  if(cmd&&key==='y'){
    e.preventDefault();e.stopImmediatePropagation();
    click('redo');
    return;
  }
  if((e.key==='Delete'||e.key==='Backspace')){
    const tag=document.activeElement?.tagName;
    const editing=tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||document.activeElement?.isContentEditable;
    if(!editing){e.preventDefault();e.stopImmediatePropagation();click('deleteQuick')}
  }
},true);
})();
