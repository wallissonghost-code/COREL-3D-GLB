(()=>{
  'use strict';
  const input=document.getElementById('file');
  if(!input) return;

  input.addEventListener('change',e=>{
    const file=input.files&&input.files[0];
    if(!file||!file.name.toLowerCase().endsWith('.svg')) return;

    // SVG browsers report image/svg+xml. The main importer checks generic
    // image/* first, so force only the MIME routing to the vector branch
    // while preserving the original SVG bytes and filename.
    try{
      const routed=new File([file],file.name,{type:'application/octet-stream',lastModified:file.lastModified});
      const dt=new DataTransfer();
      dt.items.add(routed);
      input.files=dt.files;
    }catch(err){
      console.warn('SVG routing fallback:',err);
    }
  },true);
})();
