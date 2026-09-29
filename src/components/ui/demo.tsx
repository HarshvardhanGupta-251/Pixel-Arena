export default function Demo() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black overflow-hidden">
      <img
        src="/images/Ground.svg"
        alt="Ground"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
