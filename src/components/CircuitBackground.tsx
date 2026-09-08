export function CircuitBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="pcb-grid absolute inset-0 opacity-40" />
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-accent-500/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-700/5 blur-3xl" />
    </div>
  );
}
