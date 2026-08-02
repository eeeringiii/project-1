export default function Loading() {
  return (
    <main className="shell compatPage">
      <p className="eyebrow">COMPATIBILITY</p>
      <p className="loadingArt" aria-hidden style={{ fontSize: 44 }}>
        💞
      </p>
      <p className="compatLoadingText" role="status">
        相性診断を読み込み中…
      </p>
    </main>
  );
}
