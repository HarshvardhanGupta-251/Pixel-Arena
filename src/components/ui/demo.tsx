import DottedSurface from "@/components/ui/dotted-surface";

const settings = {
  size: 8,
  opacity: 0.8,
  sizeAttenuation: true,
  vertexColors: true,
};

export default function Demo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Ground image — sits at the bottom of the scene */}
      <img
        src="/images/Ground.svg"
        alt="Ground"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          objectFit: "cover",
          objectPosition: "top",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 40%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 40%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Three.js animated dot surface — layered above the ground */}
      <DottedSurface
        size={s.size}
        opacity={s.opacity}
        sizeAttenuation={s.sizeAttenuation}
        vertexColors={s.vertexColors}
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
