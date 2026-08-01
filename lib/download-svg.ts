const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(String(reader.result));
  reader.onerror=()=>reject(reader.error ?? new Error('画像の読み込みに失敗しました'));
  reader.readAsDataURL(blob);
});

async function inlineSvgImages(svg: SVGSVGElement) {
  const clone=svg.cloneNode(true) as SVGSVGElement;
  const images=Array.from(clone.querySelectorAll('image'));
  await Promise.all(images.map(async image=>{
    const href=image.getAttribute('href') ?? image.getAttributeNS('http://www.w3.org/1999/xlink','href');
    if(!href || href.startsWith('data:')) return;
    try {
      const absolute=new URL(href,window.location.origin).toString();
      const response=await fetch(absolute);
      if(!response.ok) throw new Error(`Character image not found: ${response.status}`);
      const dataUrl=await blobToDataUrl(await response.blob());
      image.setAttribute('href',dataUrl);
      image.removeAttributeNS('http://www.w3.org/1999/xlink','href');
    } catch {
      image.remove();
    }
  }));
  return clone;
}

export async function downloadSvgAsPng(svg: SVGSVGElement | null, width: number, height: number, filename: string) {
  if (!svg) return;
  const exportSvg=await inlineSvgImages(svg);
  const source = new XMLSerializer().serializeToString(exportSvg);
  const url = URL.createObjectURL(new Blob([source], {type:'image/svg+xml;charset=utf-8'}));
  const image = new Image();
  image.decoding = 'async';
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('画像の生成に失敗しました'));image.src=url});
  const canvas = document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const context=canvas.getContext('2d');
  if(!context){URL.revokeObjectURL(url);throw new Error('Canvasを初期化できませんでした')}
  context.drawImage(image,0,0,width,height);
  URL.revokeObjectURL(url);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png',1));
  if(!blob) throw new Error('PNGの生成に失敗しました');
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download=filename;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}
