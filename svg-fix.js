(()=>{
  'use strict';
  const input=document.getElementById('file');
  if(input){
    input.addEventListener('change',()=>{
      const file=input.files&&input.files[0];
      if(!file||!file.name.toLowerCase().endsWith('.svg')) return;
      try{
        const routed=new File([file],file.name,{type:'application/octet-stream',lastModified:file.lastModified});
        const dt=new DataTransfer();
        dt.items.add(routed);
        input.files=dt.files;
      }catch(err){console.warn('SVG routing fallback:',err);}
    },true);
  }
  // This file is parsed immediately before the stable 3D core.
  // Load the sculpt capture hook synchronously so it can observe the scene,
  // camera and renderer constructors without modifying the editor core.
  if(document.readyState==='loading'){
    document.write('<script src="sculpt94.js?v=94"><\/script>');
  }else{
    const s=document.createElement('script');s.src='sculpt94.js?v=94';document.head.appendChild(s);
  }
})();
