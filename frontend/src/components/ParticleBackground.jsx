import React from "react";

// Pure-CSS particle/grid background — no extra dep cost.
export default function ParticleBackground({ variant = "default" }) {
  const nodes = Array.from({ length: 28 });
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" data-testid="particle-bg">
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="absolute inset-0">
        {nodes.map((_, i) => {
          const size = 2 + Math.random() * 3;
          const top = Math.random() * 100;
          const left = Math.random() * 100;
          const delay = Math.random() * 6;
          const dur = 6 + Math.random() * 8;
          const color = i % 3 === 0 ? "#B026FF" : "#00F0FF";
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                top: `${top}%`,
                left: `${left}%`,
                background: color,
                boxShadow: `0 0 ${size * 4}px ${color}`,
                opacity: 0.6,
                animation: `float-y ${dur}s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>
      {variant === "default" && (
        <>
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full"
               style={{ background: "radial-gradient(closest-side, rgba(176,38,255,0.18), transparent 70%)" }} />
          <div className="absolute -bottom-40 -right-40 w-[620px] h-[620px] rounded-full"
               style={{ background: "radial-gradient(closest-side, rgba(0,240,255,0.14), transparent 70%)" }} />
        </>
      )}
    </div>
  );
}
