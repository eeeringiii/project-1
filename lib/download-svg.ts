export async function downloadSvgAsPng(svg: SVGSVGElement | null, width: number, height: number, filename: string) {
  if (!svg) return;
  const source = new XMLSerializer().serializeToString(svg);
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
