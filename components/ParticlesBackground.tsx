// components/ParticlesBackground.tsx
export function ParticlesBackground() {
  const blobs = [
    { top: "-10%", left: "-5%", size: "18rem" },
    { top: "20%", left: "70%", size: "20rem" },
    { top: "65%", left: "-10%", size: "22rem" },
    { top: "75%", left: "60%", size: "18rem", gold: true },
    { top: "5%", left: "40%", size: "16rem", gold: true },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={`particle ${blob.gold ? "particle--gold" : ""}`}
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
          }}
        />
      ))}
    </div>
  );
}
