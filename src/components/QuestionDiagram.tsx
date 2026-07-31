interface QuestionDiagramProps {
  questionId: number;
}

export default function QuestionDiagram({ questionId }: QuestionDiagramProps) {
  switch (questionId) {
    // Q32: Parallel Plate Capacitor with Dielectric (K=5)
    case 32:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 240 160" className="w-56 h-36">
            {/* Top Plate (+) */}
            <rect x="40" y="20" width="160" height="8" fill="#1b365d" rx="2" />
            <text x="120" y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1b365d">+</text>

            {/* Dielectric Half (K=5, d/2) */}
            <rect x="40" y="28" width="160" height="50" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
            <text x="120" y="58" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">
              K = 5
            </text>

            {/* Dimension d/2 top */}
            <line x1="25" y1="28" x2="25" y2="78" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
            <text x="15" y="56" fontSize="11" fontWeight="bold" fill="#333">d/2</text>

            {/* Air Half (d/2) */}
            <rect x="40" y="78" width="160" height="50" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="120" y="108" textAnchor="middle" fontSize="12" fill="#64748b">Air (K=1)</text>

            {/* Dimension d/2 bottom */}
            <line x1="25" y1="78" x2="25" y2="128" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
            <text x="15" y="106" fontSize="11" fontWeight="bold" fill="#333">d/2</text>

            {/* Total height d */}
            <line x1="215" y1="28" x2="215" y2="128" stroke="#1b365d" strokeWidth="1.5" />
            <text x="225" y="82" fontSize="13" fontWeight="bold" fill="#1b365d">d</text>

            {/* Bottom Plate (-) */}
            <rect x="40" y="128" width="160" height="8" fill="#1b365d" rx="2" />
            <text x="120" y="150" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1b365d">-</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Capacitor half-filled with dielectric K=5</span>
        </div>
      );

    // Q36: Perpendicular Dipoles A and B
    case 36:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-md flex flex-col items-center">
          <svg viewBox="0 0 280 180" className="w-64 h-40">
            {/* Origin O */}
            <circle cx="80" cy="120" r="4" fill="#1b365d" />
            <text x="70" y="135" fontSize="12" fontWeight="bold" fill="#1b365d">O</text>

            {/* Dipole A along x-axis */}
            <line x1="80" y1="120" x2="140" y2="120" stroke="#2563eb" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <text x="105" y="140" fontSize="12" fontWeight="bold" fill="#2563eb">A (p₁)</text>

            {/* Dipole B along y-axis */}
            <line x1="80" y1="120" x2="80" y2="50" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
            <text x="55" y="85" fontSize="12" fontWeight="bold" fill="#dc2626">B (p₂)</text>

            {/* Point x on x-axis */}
            <circle cx="190" cy="120" r="4" fill="#059669" />
            <text x="190" y="140" fontSize="13" fontWeight="bold" fill="#059669">x</text>
            <line x1="80" y1="120" x2="190" y2="120" stroke="#64748b" strokeWidth="1" strokeDasharray="4,4" />

            {/* E_A vector to right */}
            <line x1="190" y1="120" x2="240" y2="120" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="220" y="112" fontSize="10" fill="#2563eb">E_A</text>

            {/* E_B vector upwards */}
            <line x1="190" y1="120" x2="190" y2="70" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="195" y="85" fontSize="10" fill="#dc2626">E_B</text>

            {/* Resultant E at 60 deg */}
            <line x1="190" y1="120" x2="240" y2="60" stroke="#7c3aed" strokeWidth="2.5" />
            <text x="245" y="60" fontSize="12" fontWeight="bold" fill="#7c3aed">E_net</text>

            {/* Angle 60 deg */}
            <path d="M 210 120 A 20 20 0 0 0 205 102" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
            <text x="215" y="110" fontSize="11" fontWeight="bold" fill="#7c3aed">60°</text>

            {/* Arrowhead markers */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
              </marker>
            </defs>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Perpendicular dipoles A &amp; B with resultant E_net at 60°</span>
        </div>
      );

    // Q37: Zener Diode Clipper Network
    case 37:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-lg flex flex-col items-center space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-center text-xs">
            {/* Part A Circuit */}
            <div className="bg-white p-2 border rounded shadow-xs">
              <span className="font-bold text-[#1b365d] block mb-1">Part (A): Circuit</span>
              <svg viewBox="0 0 160 100" className="w-full h-24">
                <text x="10" y="55" fontSize="10" fontWeight="bold" fill="#2563eb">v_in(t)</text>
                <circle cx="35" cy="50" r="10" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                <path d="M 30 50 Q 35 43 35 50 T 40 50" fill="none" stroke="#2563eb" strokeWidth="1.5" />

                {/* Resistor R */}
                <line x1="45" y1="50" x2="60" y2="50" stroke="#333" strokeWidth="1.5" />
                <path d="M 60 50 L 63 43 L 68 57 L 73 43 L 78 57 L 83 43 L 86 50" fill="none" stroke="#333" strokeWidth="1.5" />
                <line x1="86" y1="50" x2="110" y2="50" stroke="#333" strokeWidth="1.5" />

                <text x="110" y="45" fontSize="10" fontWeight="bold" fill="#1b365d">X</text>

                {/* Vertical branch X to Y with Back-to-Back Zeners */}
                <line x1="110" y1="50" x2="110" y2="90" stroke="#333" strokeWidth="1.5" />
                <text x="110" y="98" fontSize="10" fontWeight="bold" fill="#1b365d">Y</text>

                {/* Output terminals */}
                <line x1="110" y1="50" x2="145" y2="50" stroke="#059669" strokeWidth="1.5" />
                <line x1="110" y1="90" x2="145" y2="90" stroke="#059669" strokeWidth="1.5" />
                <text x="148" y="73" fontSize="10" fontWeight="bold" fill="#059669">v_o(t)</text>
              </svg>
            </div>

            {/* Part B Input Wave */}
            <div className="bg-white p-2 border rounded shadow-xs">
              <span className="font-bold text-[#1b365d] block mb-1">Part (B): Input v_in</span>
              <svg viewBox="0 0 140 100" className="w-full h-24">
                <line x1="15" y1="50" x2="130" y2="50" stroke="#94a3b8" strokeWidth="1" />
                <line x1="20" y1="10" x2="20" y2="90" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 20 50 Q 45 10 70 50 T 120 50" fill="none" stroke="#2563eb" strokeWidth="2" />
                <text x="5" y="20" fontSize="9" fill="#2563eb">+20V</text>
                <text x="5" y="85" fontSize="9" fill="#2563eb">-20V</text>
              </svg>
            </div>

            {/* Part C Output Wave */}
            <div className="bg-white p-2 border rounded shadow-xs">
              <span className="font-bold text-[#1b365d] block mb-1">Part (C): Output v_o</span>
              <svg viewBox="0 0 140 100" className="w-full h-24">
                <line x1="15" y1="50" x2="130" y2="50" stroke="#94a3b8" strokeWidth="1" />
                <line x1="20" y1="10" x2="20" y2="90" stroke="#94a3b8" strokeWidth="1" />
                {/* Clipped wave */}
                <path d="M 20 50 L 30 30 L 60 30 L 70 50 L 80 70 L 110 70 L 120 50" fill="none" stroke="#059669" strokeWidth="2" />
                <line x1="25" y1="30" x2="65" y2="30" stroke="#dc2626" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="75" y1="70" x2="115" y2="70" stroke="#dc2626" strokeWidth="1" strokeDasharray="2,2" />
                <text x="5" y="33" fontSize="9" fontWeight="bold" fill="#059669">+5V</text>
                <text x="5" y="73" fontSize="9" fontWeight="bold" fill="#059669">-5V</text>
              </svg>
            </div>
          </div>
          <span className="text-[11px] text-gray-500 font-semibold">Figure: Zener Diode Clipper Circuit and Waveforms</span>
        </div>
      );

    // Q39: Curved Wires Magnetic Field (P vs Q)
    case 39:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-md flex flex-col items-center">
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Figure I: Point P */}
            <div className="bg-white p-2 border rounded text-center">
              <span className="font-bold text-[#1b365d] block text-xs mb-1">Figure (I) at P</span>
              <svg viewBox="0 0 140 100" className="w-full h-24">
                {/* Straight top */}
                <line x1="10" y1="30" x2="70" y2="30" stroke="#2563eb" strokeWidth="2" />
                {/* Semicircle */}
                <path d="M 70 30 A 25 25 0 0 1 70 80" fill="none" stroke="#2563eb" strokeWidth="2" />
                {/* Straight bottom */}
                <line x1="70" y1="80" x2="10" y2="80" stroke="#2563eb" strokeWidth="2" />
                {/* Point P */}
                <circle cx="70" cy="55" r="3.5" fill="#dc2626" />
                <text x="65" y="58" fontSize="12" fontWeight="bold" fill="#dc2626">P</text>
                {/* Arrows */}
                <text x="40" y="24" fontSize="10" fill="#2563eb">I →</text>
                <text x="40" y="92" fontSize="10" fill="#2563eb">← I</text>
              </svg>
            </div>

            {/* Figure II: Point Q */}
            <div className="bg-white p-2 border rounded text-center">
              <span className="font-bold text-[#1b365d] block text-xs mb-1">Figure (II) at Q</span>
              <svg viewBox="0 0 140 100" className="w-full h-24">
                {/* Straight top */}
                <line x1="10" y1="30" x2="70" y2="30" stroke="#2563eb" strokeWidth="2" />
                {/* Semicircle */}
                <path d="M 70 30 A 25 25 0 0 1 70 80" fill="none" stroke="#2563eb" strokeWidth="2" />
                {/* Straight going right */}
                <line x1="70" y1="80" x2="130" y2="80" stroke="#2563eb" strokeWidth="2" />
                {/* Point Q */}
                <circle cx="70" cy="55" r="3.5" fill="#dc2626" />
                <text x="65" y="58" fontSize="12" fontWeight="bold" fill="#dc2626">Q</text>
                {/* Arrows */}
                <text x="40" y="24" fontSize="10" fill="#2563eb">I →</text>
                <text x="90" y="92" fontSize="10" fill="#2563eb">I →</text>
              </svg>
            </div>
          </div>
          <span className="text-[11px] text-gray-500 font-semibold mt-2">Figure: Semicircular Wires (P) and (Q)</span>
        </div>
      );

    // Q41: Lens Refraction Height of Image
    case 41:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-sm flex flex-col items-center">
          <svg viewBox="0 0 260 140" className="w-60 h-32">
            {/* Principal Axis */}
            <line x1="10" y1="70" x2="250" y2="70" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />

            {/* Lens Surface */}
            <path d="M 130 20 A 90 90 0 0 1 130 120 L 230 120 L 230 20 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <text x="90" y="50" fontSize="11" fontWeight="bold" fill="#0369a1">μ₁ = 1</text>
            <text x="155" y="50" fontSize="11" fontWeight="bold" fill="#0369a1">μ₂ = 1.54</text>

            {/* Object Arrow (2 cm height) */}
            <line x1="30" y1="70" x2="30" y2="35" stroke="#dc2626" strokeWidth="2.5" />
            <polygon points="26,37 30,27 34,37" fill="#dc2626" />
            <text x="10" y="30" fontSize="10" fontWeight="bold" fill="#dc2626">2 cm</text>
            <text x="25" y="85" fontSize="11" fontWeight="bold" fill="#1b365d">O</text>

            {/* Pole P and Center C */}
            <circle cx="130" cy="70" r="3" fill="#1b365d" />
            <text x="125" y="85" fontSize="11" fontWeight="bold" fill="#1b365d">P</text>

            <circle cx="80" cy="70" r="3" fill="#1b365d" />
            <text x="75" y="85" fontSize="11" fontWeight="bold" fill="#1b365d">C</text>

            {/* Dimensions */}
            <line x1="30" y1="110" x2="130" y2="110" stroke="#333" strokeWidth="1" />
            <text x="70" y="105" fontSize="10" fontWeight="bold" fill="#333">40 cm</text>

            <line x1="80" y1="125" x2="130" y2="125" stroke="#333" strokeWidth="1" />
            <text x="95" y="122" fontSize="10" fontWeight="bold" fill="#333">20 cm</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Refraction at Curved Surface (Object height = 2 cm)</span>
        </div>
      );

    // Q66: Electrophilic Attack Preferred Site
    case 66:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-sm flex flex-col items-center">
          <svg viewBox="0 0 260 140" className="w-60 h-32">
            {/* Benzene Ring */}
            <polygon points="40,40 70,25 100,40 100,75 70,90 40,75" fill="none" stroke="#1b365d" strokeWidth="2" />
            <circle cx="70" cy="57" r="18" fill="none" stroke="#1b365d" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Bridge / Thiophene Ring */}
            <line x1="100" y1="40" x2="135" y2="40" stroke="#1b365d" strokeWidth="2" />
            <text x="140" y="44" fontSize="12" fontWeight="bold" fill="#1b365d">N-H</text>

            <line x1="100" y1="75" x2="140" y2="85" stroke="#1b365d" strokeWidth="2" />
            <text x="142" y="90" fontSize="12" fontWeight="bold" fill="#d97706">S</text>

            <line x1="170" y1="40" x2="195" y2="60" stroke="#1b365d" strokeWidth="2" />
            <line x1="155" y1="85" x2="195" y2="60" stroke="#1b365d" strokeWidth="2" />

            {/* Position Labels: p, r, s, u */}
            <text x="25" y="40" fontSize="11" fontWeight="bold" fill="#dc2626">p</text>
            <text x="70" y="20" fontSize="11" fontWeight="bold" fill="#dc2626">r</text>
            <text x="25" y="80" fontSize="11" fontWeight="bold" fill="#dc2626">s</text>
            <text x="205" y="65" fontSize="13" fontWeight="bold" fill="#059669">u (Preferred)</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Preferred electrophilic attack positions (p, r, s, u)</span>
        </div>
      );

    // Q68: Aromatic Molecules P, Q, R
    case 68:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-md flex flex-col items-center">
          <div className="grid grid-cols-3 gap-3 w-full text-center">
            {/* Molecule P */}
            <div className="bg-white p-2 border rounded">
              <span className="font-bold text-[#1b365d] block text-xs mb-1">P</span>
              <svg viewBox="0 0 100 100" className="w-full h-20">
                <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke="#1b365d" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="#1b365d" strokeWidth="1" />
                <text x="50" y="15" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#2563eb">-NMe₂</text>
              </svg>
            </div>

            {/* Molecule Q */}
            <div className="bg-white p-2 border rounded">
              <span className="font-bold text-[#1b365d] block text-xs mb-1">Q</span>
              <svg viewBox="0 0 100 100" className="w-full h-20">
                <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke="#1b365d" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="#1b365d" strokeWidth="1" />
                <text x="50" y="15" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#2563eb">-NMe₂</text>
                <text x="80" y="70" fontSize="9" fontWeight="bold" fill="#dc2626">-Me</text>
              </svg>
            </div>

            {/* Molecule R */}
            <div className="bg-white p-2 border rounded">
              <span className="font-bold text-[#1b365d] block text-xs mb-1">R</span>
              <svg viewBox="0 0 100 100" className="w-full h-20">
                <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke="#1b365d" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="#1b365d" strokeWidth="1" />
                <text x="50" y="15" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#2563eb">-NMe₂</text>
                <text x="80" y="35" fontSize="9" fontWeight="bold" fill="#dc2626">-Me</text>
                <text x="20" y="35" fontSize="9" fontWeight="bold" fill="#dc2626">-Me</text>
              </svg>
            </div>
          </div>
          <span className="text-[11px] text-gray-500 font-semibold mt-2">Figure: Aromatic Molecule Structures P, Q, and R</span>
        </div>
      );

    // Q28: Pulley system with 2 kg and 1 kg masses
    case 28:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 200 160" className="w-52 h-36">
            {/* Ceiling */}
            <line x1="20" y1="20" x2="180" y2="20" stroke="#333" strokeWidth="4" />
            {/* Hatching lines */}
            <path d="M 30 20 L 20 10 M 60 20 L 50 10 M 90 20 L 80 10 M 120 20 L 110 10 M 150 20 L 140 10" stroke="#666" strokeWidth="1.5" />
            {/* Pulley support */}
            <line x1="100" y1="20" x2="100" y2="50" stroke="#333" strokeWidth="3" />
            {/* Pulley wheel */}
            <circle cx="100" cy="65" r="15" fill="#e2e8f0" stroke="#333" strokeWidth="2" />
            <circle cx="100" cy="65" r="3" fill="#333" />
            {/* String left (2 kg) */}
            <line x1="85" y1="65" x2="85" y2="120" stroke="#2563eb" strokeWidth="2" />
            <rect x="70" y="120" width="30" height="25" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" rx="3" />
            <text x="85" y="136" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">2 kg</text>
            {/* String right (1 kg) */}
            <line x1="115" y1="65" x2="115" y2="120" stroke="#2563eb" strokeWidth="2" />
            <rect x="103" y="120" width="24" height="20" fill="#10b981" stroke="#047857" strokeWidth="1.5" rx="3" />
            <text x="115" y="134" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">1 kg</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Pulley system with 2 kg and 1 kg masses</span>
        </div>
      );

    // Q30: NOR gate logic circuit
    case 30:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-sm flex flex-col items-center">
          <svg viewBox="0 0 280 120" className="w-64 h-28">
            <text x="15" y="35" fontSize="12" fontWeight="bold" fill="#1b365d">X</text>
            <line x1="30" y1="30" x2="60" y2="30" stroke="#333" strokeWidth="2" />
            {/* NAND Gate 1 */}
            <path d="M 60 20 L 75 20 A 15 15 0 0 1 75 50 L 60 50 Z" fill="#ffffff" stroke="#333" strokeWidth="2" />
            <circle cx="93" cy="35" r="3" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
            
            <text x="15" y="95" fontSize="12" fontWeight="bold" fill="#1b365d">Y</text>
            <line x1="30" y1="90" x2="60" y2="90" stroke="#333" strokeWidth="2" />
            {/* NAND Gate 2 */}
            <path d="M 60 80 L 75 80 A 15 15 0 0 1 75 110 L 60 110 Z" fill="#ffffff" stroke="#333" strokeWidth="2" />
            <circle cx="93" cy="95" r="3" fill="#ffffff" stroke="#333" strokeWidth="1.5" />

            {/* Combined outputs to NOR gate */}
            <line x1="96" y1="35" x2="140" y2="45" stroke="#333" strokeWidth="2" />
            <line x1="96" y1="95" x2="140" y2="75" stroke="#333" strokeWidth="2" />
            <path d="M 140 40 Q 155 60 140 80 Q 170 80 190 60 Q 170 40 140 40 Z" fill="#ffffff" stroke="#333" strokeWidth="2" />
            <circle cx="193" cy="60" r="3" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
            <line x1="196" y1="60" x2="230" y2="60" stroke="#333" strokeWidth="2" />
            <text x="235" y="64" fontSize="11" fontWeight="bold" fill="#059669">Output</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Equivalent Logic Gate Circuit</span>
        </div>
      );

    // Q50: Rod and Parallel Axis Sphere
    case 50:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 200 160" className="w-52 h-36">
            {/* Axis AB */}
            <line x1="150" y1="10" x2="150" y2="150" stroke="#dc2626" strokeWidth="2" strokeDasharray="4,4" />
            <text x="155" y="20" fontSize="11" fontWeight="bold" fill="#dc2626">A</text>
            <text x="155" y="145" fontSize="11" fontWeight="bold" fill="#dc2626">B</text>

            {/* Rod 3m */}
            <rect x="40" y="30" width="110" height="12" fill="#3b82f6" rx="2" />
            <text x="85" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1d4ed8">3 m (M=40 kg)</text>

            {/* Sphere radius R at 3m */}
            <circle cx="70" cy="100" r="20" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
            <line x1="70" y1="100" x2="90" y2="100" stroke="#78350f" strokeWidth="1.5" />
            <text x="78" y="96" fontSize="10" fontWeight="bold" fill="#78350f">R</text>

            {/* Distance 3m */}
            <line x1="70" y1="100" x2="150" y2="100" stroke="#666" strokeWidth="1" strokeDasharray="3,3" />
            <text x="110" y="115" fontSize="10" fontWeight="bold" fill="#333">3 m</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Rod and Solid Sphere about axis AB</span>
        </div>
      );

    // Q32: Stopping potential graph for metals X1, X2, X3
    case 32:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 220 160" className="w-56 h-40">
            {/* Axes */}
            <line x1="30" y1="130" x2="200" y2="130" stroke="#333" strokeWidth="2" />
            <line x1="30" y1="20" x2="30" y2="130" stroke="#333" strokeWidth="2" />
            <text x="18" y="30" fontSize="11" fontWeight="bold" fill="#1b365d">V₀</text>
            <text x="195" y="145" fontSize="11" fontWeight="bold" fill="#1b365d">ν</text>

            {/* Line X1 */}
            <line x1="50" y1="130" x2="130" y2="25" stroke="#2563eb" strokeWidth="2" />
            <text x="135" y="25" fontSize="11" fontWeight="bold" fill="#2563eb">X₁</text>

            {/* Line X2 */}
            <line x1="80" y1="130" x2="160" y2="25" stroke="#059669" strokeWidth="2" />
            <text x="165" y="25" fontSize="11" fontWeight="bold" fill="#059669">X₂</text>

            {/* Line X3 */}
            <line x1="110" y1="130" x2="190" y2="25" stroke="#d97706" strokeWidth="2" />
            <text x="195" y="25" fontSize="11" fontWeight="bold" fill="#d97706">X₃</text>

            {/* Ticks on ν axis */}
            <text x="50" y="145" fontSize="9" textAnchor="middle" fill="#666">1.0</text>
            <text x="80" y="145" fontSize="9" textAnchor="middle" fill="#666">1.5</text>
            <text x="110" y="145" fontSize="9" textAnchor="middle" fill="#666">2.0 (×10¹⁴ Hz)</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Stopping potential V₀ vs frequency ν for X₁, X₂, X₃</span>
        </div>
      );

    // Q38: Logic circuit for 4-bit numbers A and B
    case 38:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 220 100" className="w-52 h-24">
            <text x="15" y="35" fontSize="12" fontWeight="bold" fill="#1b365d">A</text>
            <line x1="30" y1="30" x2="60" y2="30" stroke="#333" strokeWidth="2" />
            <path d="M 60 20 Q 75 30 60 40 Z" fill="none" stroke="#333" strokeWidth="2" />
            <circle cx="78" cy="30" r="3" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
            
            <text x="15" y="75" fontSize="12" fontWeight="bold" fill="#1b365d">B</text>
            <line x1="30" y1="70" x2="100" y2="70" stroke="#333" strokeWidth="2" />

            <line x1="81" y1="30" x2="100" y2="30" stroke="#333" strokeWidth="2" />
            
            {/* AND Gate */}
            <path d="M 100 20 L 120 20 A 20 20 0 0 1 120 80 L 100 80 Z" fill="#ffffff" stroke="#333" strokeWidth="2" />
            <line x1="140" y1="50" x2="175" y2="50" stroke="#333" strokeWidth="2" />
            <text x="180" y="54" fontSize="12" fontWeight="bold" fill="#059669">Y</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Logic Circuit for inputs A and B</span>
        </div>
      );

    // Q39: Rod along principal axis of concave mirror
    case 39:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-sm flex flex-col items-center">
          <svg viewBox="0 0 260 120" className="w-60 h-28">
            {/* Principal Axis */}
            <line x1="10" y1="60" x2="250" y2="60" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />

            {/* Concave Mirror */}
            <path d="M 210 15 A 60 60 0 0 0 210 105" fill="none" stroke="#1b365d" strokeWidth="3" />
            {/* Hatching behind mirror */}
            <path d="M 212 15 L 218 10 M 214 30 L 220 25 M 216 45 L 222 40 M 216 60 L 222 55 M 214 75 L 220 70 M 212 90 L 218 85" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Rod of length 10 cm */}
            <rect x="70" y="53" width="70" height="14" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" rx="2" />
            <text x="105" y="47" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1d4ed8">10 cm</text>

            {/* Dimension 20 cm */}
            <line x1="140" y1="85" x2="210" y2="85" stroke="#333" strokeWidth="1" />
            <text x="175" y="80" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">20 cm</text>
            <circle cx="210" cy="60" r="3" fill="#1b365d" />
            <text x="215" y="65" fontSize="10" fontWeight="bold" fill="#1b365d">P (f = 10 cm)</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Rod along principal axis of concave mirror</span>
        </div>
      );

    // Q42: Circuit with capacitor, resistor and diodes
    case 42:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 200 140" className="w-52 h-32">
            {/* Voltage source V */}
            <line x1="20" y1="30" x2="20" y2="110" stroke="#333" strokeWidth="1.5" />
            <line x1="10" y1="65" x2="30" y2="65" stroke="#2563eb" strokeWidth="2" />
            <line x1="14" y1="75" x2="26" y2="75" stroke="#2563eb" strokeWidth="1.5" />
            <text x="5" y="72" fontSize="10" fontWeight="bold" fill="#2563eb">V</text>

            {/* Top branch with Capacitor C = 20uF */}
            <line x1="20" y1="30" x2="70" y2="30" stroke="#333" strokeWidth="1.5" />
            <line x1="70" y1="20" x2="70" y2="40" stroke="#1b365d" strokeWidth="2" />
            <line x1="78" y1="20" x2="78" y2="40" stroke="#1b365d" strokeWidth="2" />
            <text x="74" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1b365d">C = 20μF</text>
            <line x1="78" y1="30" x2="160" y2="30" stroke="#333" strokeWidth="1.5" />

            {/* Resistor R = 100 ohm */}
            <line x1="160" y1="30" x2="160" y2="50" stroke="#333" strokeWidth="1.5" />
            <path d="M 160 50 L 153 53 L 167 58 L 153 63 L 167 68 L 153 73 L 160 76" fill="none" stroke="#333" strokeWidth="1.5" />
            <text x="175" y="65" fontSize="9" fontWeight="bold" fill="#333">R = 100Ω</text>
            <line x1="160" y1="76" x2="160" y2="110" stroke="#333" strokeWidth="1.5" />

            {/* Diodes in parallel */}
            <polygon points="100,55 115,45 115,65" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
            <line x1="100" y1="45" x2="100" y2="65" stroke="#b91c1c" strokeWidth="1.5" />

            <polygon points="115,95 100,85 100,105" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
            <line x1="115" y1="85" x2="115" y2="105" stroke="#b91c1c" strokeWidth="1.5" />

            {/* Bottom branch */}
            <line x1="20" y1="110" x2="160" y2="110" stroke="#333" strokeWidth="1.5" />
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: RC Circuit with parallel Diodes</span>
        </div>
      );

    // Q29: Three masses pulley system (m1, m2, m3)
    case 29:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 200 160" className="w-52 h-40">
            {/* Rigid Ceiling */}
            <line x1="40" y1="20" x2="160" y2="20" stroke="#333" strokeWidth="2" />
            <line x1="100" y1="20" x2="100" y2="35" stroke="#333" strokeWidth="2" />
            <circle cx="100" cy="45" r="10" fill="#e2e8f0" stroke="#333" strokeWidth="2" />
            
            {/* Rope 1 */}
            <line x1="90" y1="45" x2="90" y2="75" stroke="#1b365d" strokeWidth="2" />
            <line x1="110" y1="45" x2="110" y2="75" stroke="#1b365d" strokeWidth="2" />

            {/* Mass m1 = 4kg */}
            <rect x="78" y="75" width="24" height="20" fill="#3b82f6" stroke="#1d4ed8" rx="2" />
            <text x="90" y="89" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">m₁ (4kg)</text>

            {/* Mass m2 = 4kg */}
            <rect x="98" y="75" width="24" height="20" fill="#3b82f6" stroke="#1d4ed8" rx="2" />
            <text x="110" y="89" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">m₂ (4kg)</text>

            {/* Rope 2 to m3 */}
            <line x1="110" y1="95" x2="110" y2="125" stroke="#1b365d" strokeWidth="2" />
            <circle cx="110" cy="135" r="10" fill="#10b981" stroke="#047857" />
            <text x="110" y="139" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">m₃ (6kg)</text>

            {/* Tensions */}
            <text x="70" y="65" fontSize="10" fontWeight="bold" fill="#dc2626">T₁</text>
            <text x="120" y="110" fontSize="10" fontWeight="bold" fill="#dc2626">T₂</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Pulley system with masses m₁, m₂, m₃</span>
        </div>
      );

    // Q30: Wedge Y (10kg, 37 deg) and Block X (2kg)
    case 30:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 220 120" className="w-56 h-28">
            {/* Ground */}
            <line x1="10" y1="100" x2="210" y2="100" stroke="#333" strokeWidth="2" />

            {/* Wedge Y */}
            <polygon points="30,100 170,100 30,30" fill="#e2e8f0" stroke="#1b365d" strokeWidth="2" />
            <text x="60" y="80" fontSize="11" fontWeight="bold" fill="#1b365d">Y (10 kg)</text>
            <text x="65" y="95" fontSize="10" fontWeight="bold" fill="#333">37°</text>

            {/* Force f = 24N to right */}
            <line x1="120" y1="75" x2="160" y2="75" stroke="#dc2626" strokeWidth="2" />
            <polygon points="160,75 152,70 152,80" fill="#dc2626" />
            <text x="120" y="68" fontSize="10" fontWeight="bold" fill="#dc2626">f = 24 N</text>

            {/* Block X at top */}
            <rect x="35" y="22" width="20" height="15" fill="#3b82f6" stroke="#1d4ed8" transform="rotate(-26, 45, 30)" rx="2" />
            <text x="40" y="15" fontSize="10" fontWeight="bold" fill="#1d4ed8">X (2 kg)</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Wedge Y and Block X sliding down 37° slope</span>
        </div>
      );

    // Q34: Resistor bridge with 5V source
    case 34:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 200 140" className="w-52 h-32">
            {/* Bridge Diamond */}
            <polygon points="100,20 160,70 100,120 40,70" fill="none" stroke="#333" strokeWidth="2" />
            <line x1="100" y1="20" x2="100" y2="120" stroke="#333" strokeWidth="2" />

            {/* Labels */}
            <text x="60" y="40" fontSize="10" fontWeight="bold" fill="#1b365d">4 Ω</text>
            <text x="130" y="40" fontSize="10" fontWeight="bold" fill="#1b365d">2 Ω</text>
            <text x="60" y="105" fontSize="10" fontWeight="bold" fill="#1b365d">4 Ω</text>
            <text x="130" y="105" fontSize="10" fontWeight="bold" fill="#1b365d">2 Ω</text>
            <text x="105" y="70" fontSize="10" fontWeight="bold" fill="#2563eb">1 Ω</text>

            <text x="165" y="75" fontSize="11" fontWeight="bold" fill="#dc2626">5 V</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Resistor bridge circuit with 5V supply</span>
        </div>
      );

    // Q45: Logic circuit with LED-1 and LED-2
    case 45:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 220 120" className="w-56 h-28">
            <text x="10" y="30" fontSize="11" fontWeight="bold" fill="#1b365d">A</text>
            <text x="10" y="60" fontSize="11" fontWeight="bold" fill="#1b365d">B</text>
            <text x="10" y="90" fontSize="11" fontWeight="bold" fill="#1b365d">C</text>

            <line x1="25" y1="25" x2="60" y2="25" stroke="#333" strokeWidth="1.5" />
            <line x1="25" y1="55" x2="60" y2="55" stroke="#333" strokeWidth="1.5" />
            
            {/* NOR Gate */}
            <path d="M 60 15 Q 75 40 60 65 L 75 40 Z" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
            <circle cx="80" cy="40" r="3" stroke="#333" fill="#fff" />
            
            {/* LED-1 */}
            <line x1="83" y1="40" x2="110" y2="40" stroke="#333" strokeWidth="1.5" />
            <polygon points="110,35 120,40 110,45" fill="#dc2626" />
            <text x="110" y="25" fontSize="9" fontWeight="bold" fill="#dc2626">LED-1</text>

            {/* LED-2 */}
            <line x1="150" y1="60" x2="180" y2="60" stroke="#333" strokeWidth="1.5" />
            <polygon points="180,55 190,60 180,65" fill="#10b981" />
            <text x="175" y="45" fontSize="9" fontWeight="bold" fill="#10b981">LED-2</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Logic circuit with LED-1 and LED-2</span>
        </div>
      );

    // Q46: Resistor circuit with 6 ohm, 3 ohm, 4 ohm, 3V, 2V
    case 46:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 220 140" className="w-56 h-32">
            {/* Top Branch */}
            <line x1="20" y1="30" x2="60" y2="30" stroke="#333" strokeWidth="1.5" />
            <path d="M 60 30 L 65 25 L 73 35 L 81 25 L 89 35 L 97 25 L 102 30" fill="none" stroke="#333" strokeWidth="1.5" />
            <text x="75" y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1b365d">6 Ω</text>
            <line x1="102" y1="30" x2="140" y2="30" stroke="#333" strokeWidth="1.5" />
            
            {/* 3V battery */}
            <line x1="140" y1="20" x2="140" y2="40" stroke="#2563eb" strokeWidth="2" />
            <line x1="146" y1="25" x2="146" y2="35" stroke="#2563eb" strokeWidth="1.5" />
            <text x="150" y="20" fontSize="10" fontWeight="bold" fill="#2563eb">3 V</text>
            <line x1="146" y1="30" x2="200" y2="30" stroke="#333" strokeWidth="1.5" />

            {/* Middle Branch */}
            <line x1="20" y1="70" x2="40" y2="70" stroke="#333" strokeWidth="1.5" />
            <path d="M 40 70 L 45 65 L 53 75 L 61 65 L 69 75 L 77 65 L 82 70" fill="none" stroke="#333" strokeWidth="1.5" />
            <text x="60" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1b365d">3 Ω</text>
            <line x1="82" y1="70" x2="120" y2="70" stroke="#333" strokeWidth="1.5" />
            <path d="M 120 70 L 125 65 L 133 75 L 141 65 L 149 75 L 157 65 L 162 70" fill="none" stroke="#333" strokeWidth="1.5" />
            <text x="140" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1b365d">4 Ω</text>
            <line x1="162" y1="70" x2="200" y2="70" stroke="#333" strokeWidth="1.5" />

            {/* Bottom Branch 2V battery */}
            <line x1="20" y1="110" x2="90" y2="110" stroke="#333" strokeWidth="1.5" />
            <line x1="90" y1="100" x2="90" y2="120" stroke="#2563eb" strokeWidth="2" />
            <line x1="96" y1="105" x2="96" y2="115" stroke="#2563eb" strokeWidth="1.5" />
            <text x="100" y="102" fontSize="10" fontWeight="bold" fill="#2563eb">2 V</text>
            <line x1="96" y1="110" x2="200" y2="110" stroke="#333" strokeWidth="1.5" />

            {/* Verticals */}
            <line x1="20" y1="30" x2="20" y2="110" stroke="#333" strokeWidth="1.5" />
            <line x1="200" y1="30" x2="200" y2="110" stroke="#333" strokeWidth="1.5" />
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Resistor network circuit with 3V and 2V sources</span>
        </div>
      );

    // Q33 (06 Apr Evening): Extension vs Load W graph
    case 33:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 200 150" className="w-52 h-36">
            <line x1="30" y1="120" x2="180" y2="120" stroke="#333" strokeWidth="2" />
            <line x1="30" y1="20" x2="30" y2="120" stroke="#333" strokeWidth="2" />
            <text x="10" y="25" fontSize="10" fontWeight="bold" fill="#1b365d">Δl (×10⁻⁴ m)</text>
            <text x="150" y="135" fontSize="10" fontWeight="bold" fill="#1b365d">W (N)</text>

            <line x1="30" y1="120" x2="160" y2="30" stroke="#2563eb" strokeWidth="2" />
            <line x1="160" y1="30" x2="160" y2="120" stroke="#94a3b8" strokeDasharray="3,3" />
            <line x1="30" y1="30" x2="160" y2="30" stroke="#94a3b8" strokeDasharray="3,3" />

            <text x="160" y="135" fontSize="9" textAnchor="middle" fill="#666">60</text>
            <text x="20" y="33" fontSize="9" textAnchor="end" fill="#666">6</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Extension Δl vs Load W for 1 m wire</span>
        </div>
      );

    // Q37 (06 Apr Evening): Steady state capacitor circuit
    case 37:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 200 140" className="w-52 h-32">
            <line x1="20" y1="30" x2="160" y2="30" stroke="#333" strokeWidth="1.5" />
            <text x="90" y="22" fontSize="10" fontWeight="bold" fill="#1b365d">2 Ω</text>
            
            <line x1="20" y1="30" x2="20" y2="110" stroke="#333" strokeWidth="1.5" />
            <line x1="20" y1="65" x2="12" y2="65" stroke="#1b365d" strokeWidth="2" />
            <line x1="20" y1="75" x2="12" y2="75" stroke="#1b365d" strokeWidth="2" />
            <text x="28" y="72" fontSize="9" fontWeight="bold" fill="#1b365d">2 μF</text>

            <line x1="160" y1="30" x2="160" y2="110" stroke="#333" strokeWidth="1.5" />
            <text x="165" y="70" fontSize="10" fontWeight="bold" fill="#1b365d">6 Ω</text>

            <line x1="20" y1="110" x2="160" y2="110" stroke="#333" strokeWidth="1.5" />
            <line x1="85" y1="110" x2="85" y2="100" stroke="#2563eb" strokeWidth="2" />
            <line x1="95" y1="110" x2="95" y2="105" stroke="#2563eb" strokeWidth="1.5" />
            <text x="85" y="125" fontSize="10" fontWeight="bold" fill="#2563eb">2 V</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Steady state RC circuit</span>
        </div>
      );

    // Q49 (08 Apr Evening): Circuit with 100 uF capacitor and resistor bridge
    case 49:
      return (
        <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded max-w-xs flex flex-col items-center">
          <svg viewBox="0 0 220 140" className="w-56 h-36">
            {/* Top resistors */}
            <line x1="20" y1="30" x2="50" y2="30" stroke="#333" strokeWidth="1.5" />
            <path d="M 50 30 L 55 25 L 63 35 L 71 25 L 79 35 L 87 25 L 92 30" fill="none" stroke="#333" strokeWidth="1.5" />
            <text x="70" y="20" fontSize="9" fontWeight="bold" fill="#1b365d">5 Ω</text>
            <line x1="92" y1="30" x2="120" y2="30" stroke="#333" strokeWidth="1.5" />
            <path d="M 120 30 L 125 25 L 133 35 L 141 25 L 149 35 L 157 25 L 162 30" fill="none" stroke="#333" strokeWidth="1.5" />
            <text x="140" y="20" fontSize="9" fontWeight="bold" fill="#1b365d">4 Ω</text>
            <line x1="162" y1="30" x2="190" y2="30" stroke="#333" strokeWidth="1.5" />
            <path d="M 190 30 L 193 25 L 197 35 L 201 25 L 205 35 L 209 25 L 211 30" fill="none" stroke="#333" strokeWidth="1.5" />
            <text x="200" y="20" fontSize="8" fontWeight="bold" fill="#1b365d">10 Ω</text>

            {/* Vertical resistors */}
            <line x1="92" y1="30" x2="92" y2="70" stroke="#333" strokeWidth="1.5" />
            <text x="75" y="55" fontSize="9" fontWeight="bold" fill="#1b365d">12 Ω</text>
            <line x1="162" y1="30" x2="162" y2="70" stroke="#333" strokeWidth="1.5" />
            <text x="145" y="55" fontSize="9" fontWeight="bold" fill="#1b365d">10 Ω</text>
            <line x1="211" y1="30" x2="211" y2="70" stroke="#333" strokeWidth="1.5" />
            <line x1="207" y1="50" x2="215" y2="50" stroke="#2563eb" strokeWidth="2" />
            <line x1="207" y1="55" x2="215" y2="55" stroke="#2563eb" strokeWidth="2" />
            <text x="215" y="65" fontSize="8" fontWeight="bold" fill="#2563eb">100 μF</text>

            {/* Bottom branch */}
            <line x1="20" y1="110" x2="211" y2="110" stroke="#333" strokeWidth="1.5" />
            <line x1="20" y1="30" x2="20" y2="110" stroke="#333" strokeWidth="1.5" />
            <line x1="20" y1="70" x2="15" y2="70" stroke="#2563eb" strokeWidth="2" />
            <line x1="20" y1="76" x2="15" y2="76" stroke="#2563eb" strokeWidth="1.5" />
            <text x="28" y="75" fontSize="10" fontWeight="bold" fill="#2563eb">12 V</text>
          </svg>
          <span className="text-[11px] text-gray-500 font-semibold mt-1">Figure: Resistor bridge circuit with 100 μF capacitor</span>
        </div>
      );

    default:
      return null;
  }
}
