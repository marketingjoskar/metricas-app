/**
 * AnimatedBackground
 * Renders a fixed fullscreen layer of blurred, drifting orbs that create
 * an organic mesh-gradient look matching the dark/light palette.
 * Theme is read directly from the <html data-theme> attribute so it
 * reacts instantly without React context subscription.
 */
export default function AnimatedBackground() {
  return (
    <div className="mesh-bg" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
      {/* Grain overlay for depth — matches the noise texture in the reference */}
      <div className="mesh-grain" />
    </div>
  )
}
