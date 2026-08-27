#!/usr/bin/env python3
"""
Comprehensive, high-precision text refinement for NEET 2019.
Applies common-sense physical/chemical formula notation, subscripts, superscripts,
replaces all raw dollar signs ($), standardizes KaTeX expressions and match tables.
"""
import os
import re
import json

QUESTIONS_FILE = os.path.join("neet-out", "2019", "questions.json")

def clean_general_text(t):
    if not t:
        return t
    # Strip any stray dollar signs
    t = t.replace("$", "")
    # Fix bare ^\circ degree symbols
    t = re.sub(r'(\w+)\s*\^\\circ', r'\1°', t)
    t = re.sub(r'([+-]?\d+(?:\.\d+)?)\s*\^\\circ', r'\1°', t)
    t = t.replace("^\\circ", "°")
    # Fix thermodynamic superscript circle
    t = t.replace("E_{\\text{cell}}°", "E_{\\text{cell}}^{\\circ}")
    t = t.replace("\\Delta_r G°", "\\Delta_r G^{\\circ}")
    t = t.replace("\\Delta_{\\text{mix}} G°", "\\Delta_{\\text{mix}} G^{\\circ}")
    # Clean non-breaking / weird spaces
    t = t.replace("\u00a0", " ").replace("\u2013", "-").replace("\u2212", "-")
    # Clean multiple spaces
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()

def apply_precision_formatting(q):
    num = q["number"]
    bnum = q.get("booklet_number", num)
    section = q["section"]
    text = clean_general_text(q["text"])
    options = []
    for opt in q["options"]:
        options.append({
            "label": str(opt["label"]),
            "text": clean_general_text(opt.get("text", "")),
            "figure": opt.get("figure")
        })

    # Clean stem & options of any $ signs
    text = text.replace("$", "")
    for o in options:
        o["text"] = o["text"].replace("$", "")

    # ==================== PHYSICS (Site Q1 to Q45) ====================
    if section == "Physics":
        # Q1 (Booklet 46)
        # Q2 (Booklet 47)
        if num == 3: # Booklet 48 (Electron in magnetic field / cylinder)
            text = text.replace("B = (B0 d / a) k", "\\vec{B} = \\left(\\frac{B_0 d}{a}\\right)\\hat{k}")
        elif num == 4: # Booklet 49
            text = "The correct Boolean operation represented by the circuit diagram drawn is :"
            q["images"] = ["Q4.png"]
        elif num == 5: # Booklet 50
            text = "A block of mass 10 kg is in contact against the inner wall of a hollow cylindrical drum of radius 1 m. The coefficient of friction between the block and the inner wall of the cylinder is 0.1. The minimum angular velocity needed for the cylinder to keep the block stationary when the cylinder is vertical and rotating about its axis, will be : (g = 10 m/s^2)"
            options[0]["text"] = "\\sqrt{10}\\text{ rad/s}"
            options[1]["text"] = "\\frac{10}{2\\pi}\\text{ rad/s}"
            options[2]["text"] = "10\\text{ rad/s}"
            options[3]["text"] = "10\\pi\\text{ rad/s}"
        elif num == 6: # Booklet 51
            text = "Body A of mass 4m moving with speed u collides with another body B of mass 2m, at rest. The collision is head on and elastic in nature. After the collision the fraction of energy lost by the colliding body A is :"
            options[0]["text"] = "\\frac{1}{9}"
            options[1]["text"] = "\\frac{8}{9}"
            options[2]["text"] = "\\frac{4}{9}"
            options[3]["text"] = "\\frac{5}{9}"
        elif num == 7: # Booklet 52
            text = "The speed of a swimmer in still water is 20 m/s. The speed of river water is 10 m/s and is flowing due east. If he is standing on the south bank and wishes to cross the river along the shortest path, the angle at which he should make his strokes w.r.t. north is given by :"
            options[0]["text"] = "30^\\circ\\text{ west}"
            options[1]["text"] = "0^\\circ"
            options[2]["text"] = "60^\\circ\\text{ west}"
            options[3]["text"] = "45^\\circ\\text{ west}"
        elif num == 8: # Booklet 53
            text = "A mass m is attached to a thin wire and whirled in a vertical circle. The wire is most likely to break when :"
            options[0]["text"] = "the mass is at the highest point"
            options[1]["text"] = "the wire is horizontal"
            options[2]["text"] = "the mass is at the lowest point"
            options[3]["text"] = "inclined at an angle of 60^\\circ from vertical"
        elif num == 9: # Booklet 54
            text = "The displacement of a particle executing simple harmonic motion is given by y = A_0 + A\\sin\\omega t + B\\cos\\omega t. Then the amplitude of its oscillation is given by :"
            options[0]["text"] = "\\sqrt{A_0^2 + A^2 + B^2}"
            options[1]["text"] = "\\sqrt{A^2 + B^2}"
            options[2]["text"] = "\\sqrt{A_0^2 + (A + B)^2}"
            options[3]["text"] = "A + B"
        elif num == 10: # Booklet 55
            text = "An 800 turn coil of effective area 0.05 m^2 is kept perpendicular to a magnetic field 5 \\times 10^{-5}\\text{ T}. When the plane of the coil is rotated by 90^\\circ around any of its coplanar axis in 0.1 s, the emf induced in the coil will be :"
            options[0]["text"] = "2\\text{ V}"
            options[1]["text"] = "0.2\\text{ V}"
            options[2]["text"] = "2 \\times 10^{-3}\\text{ V}"
            options[3]["text"] = "0.02\\text{ V}"
        elif num == 11: # Booklet 56
            text = "Average velocity of a particle executing SHM in one complete vibration is :"
            options[0]["text"] = "\\frac{A\\omega}{2}"
            options[1]["text"] = "A\\omega"
            options[2]["text"] = "\\frac{A\\omega^2}{2}"
            options[3]["text"] = "Zero"
        elif num == 12: # Booklet 57
            text = "A soap bubble, having radius of 1 mm, is blown from a detergent solution having a surface tension of 2.5 \\times 10^{-2}\\text{ N/m}. The pressure inside the bubble equals at a point Z_0 below the free surface of water in a container. Taking g = 10 m/s^2, density of water = 10^3\\text{ kg/m}^3, the value of Z_0 is :-"
            options[0]["text"] = "100 cm"
            options[1]["text"] = "10 cm"
            options[2]["text"] = "1 cm"
            options[3]["text"] = "0.5 cm"
        elif num == 13: # Booklet 58
            text = "A copper rod of 88 cm and an aluminum rod of unknown length have their increase in length independent of increase in temperature. The length of aluminum rod is : (\\alpha_{\\text{Cu}} = 1.7 \\times 10^{-5}\\text{ K}^{-1} and \\alpha_{\\text{Al}} = 2.2 \\times 10^{-5}\\text{ K}^{-1})"
            options[0]["text"] = "6.8 cm"
            options[1]["text"] = "113.9 cm"
            options[2]["text"] = "88 cm"
            options[3]["text"] = "68 cm"
        elif num == 14: # Booklet 59
            text = "The unit of thermal conductivity is :"
            options[0]["text"] = "\\text{J m K}^{-1}"
            options[1]["text"] = "\\text{J m}^{-1}\\text{K}^{-1}"
            options[2]["text"] = "\\text{W m K}^{-1}"
            options[3]["text"] = "\\text{W m}^{-1}\\text{K}^{-1}"
        elif num == 15: # Booklet 60
            text = "When a block of mass M is suspended by a long wire of length L, the length of the wire becomes (L + l). The elastic potential energy stored in the extended wire is :-"
            options[0]["text"] = "Mgl"
            options[1]["text"] = "MgL"
            options[2]["text"] = "\\frac{1}{2} Mgl"
            options[3]["text"] = "\\frac{1}{2} MgL"
        elif num == 16: # Booklet 61
            text = "A disc of radius 2 m and mass 100 kg rolls on a horizontal floor. Its centre of mass has speed of 20 cm/s. How much work is needed to stop it ?"
            options[0]["text"] = "3 J"
            options[1]["text"] = "30 kJ"
            options[2]["text"] = "2 J"
            options[3]["text"] = "1 J"
        elif num == 17: # Booklet 62
            text = "In an experiment, the percentage of error occurred in the measurement of physical quantities A, B, C and D are 1%, 2%, 3% and 4% respectively. Then the maximum percentage of error in the measurement X, where X = \\frac{A^2 B^{1/2}}{C^{1/3} D^3}, will be :"
            options[0]["text"] = "(\\frac{3}{13})%"
            options[1]["text"] = "16%"
            options[2]["text"] = "-10%"
            options[3]["text"] = "10%"
        elif num == 18: # Booklet 63
            text = "A body weighs 200 N on the surface of the earth. How much will it weigh half way down to the centre of the earth ?"
            options[0]["text"] = "150 N"
            options[1]["text"] = "200 N"
            options[2]["text"] = "250 N"
            options[3]["text"] = "100 N"
        elif num == 20: # Booklet 65
            text = "A solid cylinder of mass 2 kg and radius 4 cm is rotating about its axis at the rate of 3 rpm. The torque required to stop after 2\\pi revolutions is :"
            options[0]["text"] = "2 \\times 10^{-6}\\text{ N m}"
            options[1]["text"] = "2 \\times 10^{-3}\\text{ N m}"
            options[2]["text"] = "12 \\times 10^{-4}\\text{ N m}"
            options[3]["text"] = "2 \\times 10^6\\text{ N m}"
        elif num == 21: # Booklet 66
            text = "The radius of circle, the period of revolution, initial position and sense of revolution are indicated in the figure.\ny-projection of the radius vector of rotating particle P is :"
            q["images"] = ["Q21.png"]
            options[0]["text"] = "y(t) = -3\\cos 2\\pi t, where y in m"
            options[1]["text"] = "y(t) = 4\\sin(\\frac{\\pi t}{2}), where y in m"
            options[2]["text"] = "y(t) = 3\\cos(\\frac{3\\pi t}{2}), where y in m"
            options[3]["text"] = "y(t) = 3\\cos(\\frac{\\pi t}{2}), where y in m"
        elif num == 24: # Booklet 69
            text = "Six similar bulbs are connected as shown in the figure with a DC source of emf E, and zero internal resistance.\nThe ratio of power consumption by the bulbs when (i) all are glowing and (ii) in the situation when two from section A and one from section B are glowing, will be :"
            q["images"] = ["Q24.png"]
            options[0]["text"] = "4 : 9"
            options[1]["text"] = "9 : 4"
            options[2]["text"] = "1 : 2"
            options[3]["text"] = "2 : 1"
        elif num == 25: # Booklet 70
            text = "At a point A on the earth's surface the angle of dip, \\delta = +25^\\circ. At a point B on the earth's surface the angle of dip, \\delta = -25^\\circ. We can interpret that :"
            options[0]["text"] = "A and B are both located in the northern hemisphere."
            options[1]["text"] = "A is located in the southern hemisphere and B is located in the northern hemisphere."
            options[2]["text"] = "A is located in the northern hemisphere and B is located in the southern hemisphere."
            options[3]["text"] = "A and B are both located in the southern hemisphere."
        elif num == 26: # Booklet 71
            text = "A force F = 20 + 10y acts on a particle in y-direction where F is in newton and y in meter. Work done by this force to move the particle from y = 0 to y = 1 m is :"
            options[0]["text"] = "30 J"
            options[1]["text"] = "5 J"
            options[2]["text"] = "25 J"
            options[3]["text"] = "20 J"
        elif num == 28: # Booklet 73
            text = "A cylindrical conductor of radius R is carrying a constant current. The plot of the magnitude of the magnetic field, B with the distance d, from the centre of the conductor, is correctly represented by the figure :"
        elif num == 29: # Booklet 74
            text = "Two particles A and B are moving in uniform circular motion in concentric circles of radius r_A and r_B with speed u_A and u_B respectively. The time period of rotation is the same. The ratio of angular speed of A to that of B will be :"
            options[0]["text"] = "r_A : r_B"
            options[1]["text"] = "u_A : u_B"
            options[2]["text"] = "r_B : r_A"
            options[3]["text"] = "1 : 1"
        elif num == 30: # Booklet 75
            text = "Two similar thin equi-convex lenses, of focal length f each, are kept coaxially in contact with each other such that the focal length of the combination is F_1. When the space between the two lenses is filled with glycerin (which has the same refractive index (\\mu = 1.5) as that of glass) then the equivalent focal length is F_2. The ratio F_1 : F_2 will be :"
            options[0]["text"] = "2 : 1"
            options[1]["text"] = "1 : 2"
            options[2]["text"] = "2 : 3"
            options[3]["text"] = "3 : 4"
        elif num == 31: # Booklet 76
            text = "In total internal reflection when the angle of incidence is equal to the critical angle for the pair of media in contact, what will be angle of refraction?"
            options[0]["text"] = "180^\\circ"
            options[1]["text"] = "0^\\circ"
            options[2]["text"] = "equal to angle of incidence"
            options[3]["text"] = "90^\\circ"
        elif num == 32: # Booklet 77
            text = "Two parallel infinite line charges with linear charge densities +\\lambda\\text{ C/m} and -\\lambda\\text{ C/m} are placed at a distance of 2R in free space. What is the electric field mid-way between the two line charges?"
            options[0]["text"] = "zero"
            options[1]["text"] = "\\frac{\\lambda}{2\\pi\\varepsilon_0 R}\\text{ N/C}"
            options[2]["text"] = "\\frac{\\lambda}{\\pi\\varepsilon_0 R}\\text{ N/C}"
            options[3]["text"] = "\\frac{2\\lambda}{\\pi\\varepsilon_0 R}\\text{ N/C}"
        elif num == 35: # Booklet 80
            text = "A parallel plate capacitor of capacitance 20\\mu\\text{F} is being charged by a voltage source whose potential is changing at the rate of 3 V/s. The conduction current through the connecting wires, and the displacement current through the plates of the capacitor, would be, respectively :"
            options[0]["text"] = "zero, 60 mA"
            options[1]["text"] = "60 mA, 60 mA"
            options[2]["text"] = "60 mA, zero"
            options[3]["text"] = "zero, zero"
        elif num == 36: # Booklet 81
            text = "In the circuits shown below, the readings of the voltmeters and the ammeters will be :"
            q["images"] = ["Q36.png"]
            options[0]["text"] = "V_2 > V_1\\text{ and }i_1 = i_2"
            options[1]["text"] = "V_1 = V_2\\text{ and }i_1 > i_2"
            options[2]["text"] = "V_1 = V_2\\text{ and }i_1 = i_2"
            options[3]["text"] = "V_2 > V_1\\text{ and }i_1 > i_2"
        elif num == 37: # Booklet 82
            text = "\\alpha\\text{-particle consists of :}"
            options[0]["text"] = "2 protons and 2 neutrons only"
            options[1]["text"] = "2 electrons, 2 protons and 2 neutrons"
            options[2]["text"] = "2 electrons and 4 protons only"
            options[3]["text"] = "2 protons only"
        elif num == 38: # Booklet 83
            text = "An electron is accelerated through a potential difference of 10,000 V. Its de Broglie wavelength is, (nearly) : (m_e = 9 \\times 10^{-31}\\text{ kg})"
            options[0]["text"] = "12.2 \\times 10^{-13}\\text{ m}"
            options[1]["text"] = "12.2 \\times 10^{-12}\\text{ m}"
            options[2]["text"] = "12.2 \\times 10^{-14}\\text{ m}"
            options[3]["text"] = "12.2 nm"
        elif num == 39: # Booklet 84
            text = "When an object is shot from the bottom of a long smooth inclined plane kept at an angle 60^\\circ with horizontal, it can travel a distance x_1 along the plane. But when the inclination is decreased to 30^\\circ and the same object is shot with the same velocity, it can travel x_2 distance. Then x_1 : x_2 will be :"
            options[0]["text"] = "1 : 2"
            options[1]["text"] = "2 : 1"
            options[2]["text"] = "1 : \\sqrt{3}"
            options[3]["text"] = "1 : 2\\sqrt{3}"
        elif num == 40: # Booklet 85
            text = "A small hole of area of cross-section 2 mm^2 is present near the bottom of a fully filled open tank of height 2 m. Taking g = 10 m/s^2, the rate of flow of water through the open hole would be nearly :"
            options[0]["text"] = "12.6 \\times 10^{-6}\\text{ m}^3\\text{/s}"
            options[1]["text"] = "8.9 \\times 10^{-6}\\text{ m}^3\\text{/s}"
            options[2]["text"] = "2.23 \\times 10^{-6}\\text{ m}^3\\text{/s}"
            options[3]["text"] = "6.4 \\times 10^{-6}\\text{ m}^3\\text{/s}"
        elif num == 41: # Booklet 86
            text = "Two point charges A and B, having charges +Q and -Q respectively, are placed at certain distance apart and force acting between them is F. If 25% charge of A is transferred to B, then force between the charges becomes :"
            options[0]["text"] = "F"
            options[1]["text"] = "\\frac{9F}{16}"
            options[2]["text"] = "\\frac{16F}{9}"
            options[3]["text"] = "\\frac{4F}{3}"
        elif num == 42: # Booklet 87
            text = "Ionized hydrogen atoms and \\alpha-particles with same momenta enters perpendicular to a constant magnetic field B. The ratio of their radii of their paths r_{\\text{H}} : r_\\alpha will be :"
            options[0]["text"] = "2 : 1"
            options[1]["text"] = "1 : 2"
            options[2]["text"] = "4 : 1"
            options[3]["text"] = "1 : 4"
        elif num == 43: # Booklet 88
            text = "A particle moving with velocity \\vec{V} is acted by three forces shown by the vector triangle PQR. The velocity of the particle will :"
            q["images"] = ["Q43.png"]
            options[0]["text"] = "increase"
            options[1]["text"] = "decrease"
            options[2]["text"] = "remain constant"
            options[3]["text"] = "change according to the smallest force QR"
        elif num == 44: # Booklet 89
            text = "The work done to raise a mass m from the surface of the earth to a height h, which is equal to the radius of the earth, is :"
            options[0]["text"] = "mgR"
            options[1]["text"] = "2 mgR"
            options[2]["text"] = "\\frac{1}{2} mgR"
            options[3]["text"] = "\\frac{3}{2} mgR"
        elif num == 45: # Booklet 90
            text = "In a double slit experiment, when light of wavelength 400 nm was used, the angular width of the first minima formed on a screen placed 1m away, was found to be 0.2^\\circ. What will be the angular width of the first minima, if the entire experimental apparatus is immersed in water (\\mu_{\\text{water}} = 4/3) :"
            options[0]["text"] = "0.266^\\circ"
            options[1]["text"] = "0.15^\\circ"
            options[2]["text"] = "0.05^\\circ"
            options[3]["text"] = "0.1^\\circ"

    # ==================== CHEMISTRY (Site Q46 to Q90) ====================
    elif section == "Chemistry":
        if num == 46: # Booklet 1
            text = "Under isothermal condition, a gas at 300 K expands from 0.1 L to 0.25 L against a constant external pressure of 2 bar. The work done by the gas is :- [Given that 1 L bar = 100 J]"
            options[0]["text"] = "-30 J"
            options[1]["text"] = "5 kJ"
            options[2]["text"] = "25 J"
            options[3]["text"] = "30 J"
        elif num == 47: # Booklet 2
            text = "A compound is formed by cation C and anion A. The anions form hexagonal close packed (hcp) lattice and the cations occupy 75% of octahedral voids. The formula of the compound is :"
            options[0]["text"] = "\\text{C}_4\\text{A}_3"
            options[1]["text"] = "\\text{C}_2\\text{A}_3"
            options[2]["text"] = "\\text{C}_3\\text{A}_2"
            options[3]["text"] = "\\text{C}_3\\text{A}_4"
        elif num == 48: # Booklet 3
            text = "pH of a saturated solution of \\text{Ca}(\\text{OH})_2 is 9. The solubility product (K_{\\text{sp}}) of \\text{Ca}(\\text{OH})_2 is :"
            options[0]["text"] = "0.5 \\times 10^{-10}"
            options[1]["text"] = "0.5 \\times 10^{-15}"
            options[2]["text"] = "0.25 \\times 10^{-10}"
            options[3]["text"] = "0.125 \\times 10^{-15}"
        elif num == 49: # Booklet 4
            text = "The number of moles of hydrogen molecules required to produce 20 moles of ammonia through Haber's process is :-"
            options[0]["text"] = "10"
            options[1]["text"] = "20"
            options[2]["text"] = "30"
            options[3]["text"] = "40"
        elif num == 50: # Booklet 5
            text = "For an ideal solution, the correct option is :-"
            options[0]["text"] = "\\Delta_{\\text{mix}} S = 0\\text{ at constant T and P}"
            options[1]["text"] = "\\Delta_{\\text{mix}} V \\ne 0\\text{ at constant T and P}"
            options[2]["text"] = "\\Delta_{\\text{mix}} H = 0\\text{ at constant T and P}"
            options[3]["text"] = "\\Delta_{\\text{mix}} G = 0\\text{ at constant T and P}"
        elif num == 51: # Booklet 6
            text = "For a cell involving one electron E_{\\text{cell}}^\\circ = 0.59\\text{ V at }298\\text{ K}, the equilibrium constant for the cell reaction is :- [Given that \\frac{2.303 R T}{F} = 0.059\\text{ V at }T = 298\\text{ K}]"
            options[0]["text"] = "1.0 \\times 10^2"
            options[1]["text"] = "1.0 \\times 10^{30}"
            options[2]["text"] = "1.0 \\times 10^{10}"
            options[3]["text"] = "1.0 \\times 10^5"
        elif num == 52: # Booklet 7
            text = "Which of the following diatomic molecular species has only \\pi bonds according to Molecular Orbital Theory ?"
            options[0]["text"] = "\\text{Be}_2"
            options[1]["text"] = "\\text{O}_2"
            options[2]["text"] = "\\text{N}_2"
            options[3]["text"] = "\\text{C}_2"
        elif num == 54: # Booklet 9
            text = "The correct set of four quantum numbers for the valence electron of rubidium atom (Z = 37) is :-"
            options[0]["text"] = "5, 1, 0, +\\frac{1}{2}"
            options[1]["text"] = "5, 0, 0, +\\frac{1}{2}"
            options[2]["text"] = "5, 0, 1, +\\frac{1}{2}"
            options[3]["text"] = "5, 1, 1, +\\frac{1}{2}"
        elif num == 55: # Booklet 10
            text = "Which of the following is paramagnetic ?"
            options[0]["text"] = "[\\text{Fe}(\\text{CN})_6]^{3-}"
            options[1]["text"] = "[\\text{Ni}(\\text{CO})_4]"
            options[2]["text"] = "[\\text{Ni}(\\text{CN})_4]^{2-}"
            options[3]["text"] = "[\\text{Co}(\\text{NH}_3)_6]^{3+}"
        elif num == 56: # Booklet 11
            text = "The freezing point depression constant (K_f) of benzene is 5.12\\text{ K kg mol}^{-1}. The freezing point depression for the solution of molality 0.078 m containing a non-electrolyte solute in benzene is (rounded off upto two decimal places) :"
            options[0]["text"] = "0.20 K"
            options[1]["text"] = "0.80 K"
            options[2]["text"] = "0.40 K"
            options[3]["text"] = "0.60 K"
        elif num == 57: # Booklet 12
            text = "The correct order of the basic strength of methyl substituted amines in aqueous solution is :-"
            options[0]["text"] = "(\\text{CH}_3)_2\\text{NH} > \\text{CH}_3\\text{NH}_2 > (\\text{CH}_3)_3\\text{N}"
            options[1]["text"] = "(\\text{CH}_3)_3\\text{N} > \\text{CH}_3\\text{NH}_2 > (\\text{CH}_3)_2\\text{NH}"
            options[2]["text"] = "(\\text{CH}_3)_3\\text{N} > (\\text{CH}_3)_2\\text{NH} > \\text{CH}_3\\text{NH}_2"
            options[3]["text"] = "\\text{CH}_3\\text{NH}_2 > (\\text{CH}_3)_2\\text{NH} > (\\text{CH}_3)_3\\text{N}"
        elif num == 58: # Booklet 13
            text = "Which mixture of the solutions will lead to the formation of negatively charged colloidal [\\text{AgI}]\\text{I}^- sol. ?"
            options[0]["text"] = "50\\text{ mL of }1\\text{ M }\\text{AgNO}_3 + 50\\text{ mL of }1.5\\text{ M }\\text{KI}"
            options[1]["text"] = "50\\text{ mL of }1\\text{ M }\\text{AgNO}_3 + 50\\text{ mL of }2\\text{ M }\\text{KI}"
            options[2]["text"] = "50\\text{ mL of }2\\text{ M }\\text{AgNO}_3 + 50\\text{ mL of }1.5\\text{ M }\\text{KI}"
            options[3]["text"] = "50\\text{ mL of }0.1\\text{ M }\\text{AgNO}_3 + 50\\text{ mL of }0.1\\text{ M }\\text{KI}"
        elif num == 59: # Booklet 14
            text = "Conjugate base for Bronsted acids \\text{H}_2\\text{O} and \\text{HF} are :-"
            options[0]["text"] = "\\text{OH}^-\\text{ and }\\text{H}_2\\text{F}^+\\text{ respectively}"
            options[1]["text"] = "\\text{H}_3\\text{O}^+\\text{ and }\\text{F}^-,\\text{ respectively}"
            options[2]["text"] = "\\text{OH}^-\\text{ and }\\text{F}^-,\\text{ respectively}"
            options[3]["text"] = "\\text{H}_3\\text{O}^+\\text{ and }\\text{H}_2\\text{F}^+,\\text{ respectively}"
        elif num == 60: # Booklet 15
            text = "Which will make basic buffer ?"
            options[0]["text"] = "50\\text{ mL of }0.1\\text{ M }\\text{NaOH} + 25\\text{ mL of }0.1\\text{ M }\\text{CH}_3\\text{COOH}"
            options[1]["text"] = "100\\text{ mL of }0.1\\text{ M }\\text{CH}_3\\text{COOH} + 100\\text{ mL of }0.1\\text{ M }\\text{NaOH}"
            options[2]["text"] = "100\\text{ mL of }0.1\\text{ M }\\text{HCl} + 200\\text{ mL of }0.1\\text{ M }\\text{NH}_4\\text{OH}"
            options[3]["text"] = "100\\text{ mL of }0.1\\text{ M }\\text{HCl} + 100\\text{ mL of }0.1\\text{ M }\\text{NaOH}"
        elif num == 61: # Booklet 16
            text = "The compound that is most difficult to protonate is :-"
        elif num == 62: # Booklet 17
            text = "The most suitable reagent for the following conversion is :-\n\\text{H}_3\\text{C}-\\text{C}\\equiv\\text{C}-\\text{CH}_3 \\longrightarrow \\text{cis-2-butene}"
            q["images"] = ["Q62.png"]
            options[0]["text"] = "\\text{Na} / \\text{liquid }\\text{NH}_3"
            options[1]["text"] = "\\text{H}_2, \\text{Pd}/\\text{C}, \\text{quinoline}"
            options[2]["text"] = "\\text{Zn} / \\text{HCl}"
            options[3]["text"] = "\\text{Hg}^{2+} / \\text{H}^+, \\text{H}_2\\text{O}"
        elif num == 63: # Booklet 18
            text = "Which of the following species is not stable ?"
            options[0]["text"] = "[\\text{SiF}_6]^{2-}"
            options[1]["text"] = "[\\text{GeCl}_6]^{2-}"
            options[2]["text"] = "[\\text{Sn}(\\text{OH})_6]^{2-}"
            options[3]["text"] = "[\\text{SiCl}_6]^{2-}"
        elif num == 64: # Booklet 19
            text = "Which of the following is an amphoteric hydroxide?"
            options[0]["text"] = "\\text{Sr}(\\text{OH})_2"
            options[1]["text"] = "\\text{Ca}(\\text{OH})_2"
            options[2]["text"] = "\\text{Mg}(\\text{OH})_2"
            options[3]["text"] = "\\text{Be}(\\text{OH})_2"
        elif num == 65: # Booklet 20
            text = "The structure of intermediate A in the following reaction is :-"
            q["images"] = ["Q65.png"]
        elif num == 66: # Booklet 21
            text = "The manganate and permanganate ions are tetrahedral, due to :"
            options[0]["text"] = "The \\pi\\text{-bonding involves overlap of p-orbitals of oxygen with d-orbitals of manganese}"
            options[1]["text"] = "There is no \\pi\\text{-bonding}"
            options[2]["text"] = "The \\pi\\text{-bonding involves overlap of p-orbitals of oxygen with p-orbitals of manganese}"
            options[3]["text"] = "The \\pi\\text{-bonding involves overlap of d-orbitals of oxygen with d-orbitals of manganese}"
        elif num == 68: # Booklet 23
            text = "If the rate constant for a first order reaction is k, the time (t) required for the completion of 99% of the reaction is given by :-"
            options[0]["text"] = "t = \\frac{0.693}{k}"
            options[1]["text"] = "t = \\frac{6.909}{k}"
            options[2]["text"] = "t = \\frac{4.606}{k}"
            options[3]["text"] = "t = \\frac{2.303}{k}"
        elif num == 69: # Booklet 24
            text = "Identify the incorrect statement related to \\text{PCl}_5 from the following :-"
            options[0]["text"] = "Three equatorial P-Cl bonds make an angle of 120^\\circ with each other"
            options[1]["text"] = "Two axial P-Cl bonds make an angle of 180^\\circ with each other"
            options[2]["text"] = "Axial P-Cl bonds are longer than equatorial P-Cl bonds"
            options[3]["text"] = "\\text{PCl}_5\\text{ molecule is non-reactive}"
        elif num == 72: # Booklet 27
            text = "Match the Xenon compounds in Column-I with its structure in Column-II and assign the correct code:-\n| Column-I | Column-II |\n|---|---|\n| (a) \\text{XeF}_4 | (i) Pyramidal |\n| (b) \\text{XeF}_6 | (ii) Square planar |\n| (c) \\text{XeOF}_4 | (iii) Distorted octahedral |\n| (d) \\text{XeO}_3 | (iv) Square pyramidal |\n\nCode :"
            options[0]["text"] = "(a) - (i), (b) - (ii), (c) - (iii), (d) - (iv)"
            options[1]["text"] = "(a) - (ii), (b) - (iii), (c) - (iv), (d) - (i)"
            options[2]["text"] = "(a) - (ii), (b) - (iii), (c) - (i), (d) - (iv)"
            options[3]["text"] = "(a) - (iii), (b) - (iv), (c) - (i), (d) - (ii)"
        elif num == 73: # Booklet 28
            text = "Which is the correct thermal stability order for \\text{H}_2\\text{E} (\\text{E} = \\text{O, S, Se, Te and Po}) ?"
            options[0]["text"] = "\\text{H}_2\\text{S} < \\text{H}_2\\text{O} < \\text{H}_2\\text{Se} < \\text{H}_2\\text{Te} < \\text{H}_2\\text{Po}"
            options[1]["text"] = "\\text{H}_2\\text{O} < \\text{H}_2\\text{S} < \\text{H}_2\\text{Se} < \\text{H}_2\\text{Te} < \\text{H}_2\\text{Po}"
            options[2]["text"] = "\\text{H}_2\\text{Po} < \\text{H}_2\\text{Te} < \\text{H}_2\\text{Se} < \\text{H}_2\\text{S} < \\text{H}_2\\text{O}"
            options[3]["text"] = "\\text{H}_2\\text{Se} < \\text{H}_2\\text{Te} < \\text{H}_2\\text{Po} < \\text{H}_2\\text{O} < \\text{H}_2\\text{S}"
        elif num == 74: # Booklet 29
            text = "The correct structure of tribromooctaoxide (\\text{Br}_3\\text{O}_8) is :-"
            q["answers"] = ["1"] # Booklet Q29 answer in PDF is Ans. (1)
        elif num == 75: # Booklet 30
            text = 'An alkene "A" on reaction with \\text{O}_3 and \\text{Zn}-\\text{H}_2\\text{O} gives propanone and ethanal in equimolar ratio. Addition of \\text{HCl} to alkene "A" gives "B" as the major product. The structure of product "B" is :-'
            options[0]["text"] = "\\text{Cl}-\\text{CH}_2-\\text{CH}_2-\\text{CH}(\\text{CH}_3)_2"
            options[1]["text"] = "\\text{H}_3\\text{C}-\\text{CH}_2-\\text{CH}(\\text{CH}_3)-\\text{CH}_2\\text{Cl}"
            options[2]["text"] = "\\text{H}_3\\text{C}-\\text{CH}_2-\\text{C}(\\text{Cl})(\\text{CH}_3)_2"
            options[3]["text"] = "\\text{H}_3\\text{C}-\\text{CH}(\\text{CH}_3)-\\text{CH}(\\text{Cl})-\\text{CH}_3"
        elif num == 77: # Booklet 32
            text = "Which one is malachite from the following ?"
            options[0]["text"] = "\\text{CuFeS}_2"
            options[1]["text"] = "\\text{Cu}(\\text{OH})_2"
            options[2]["text"] = "\\text{Fe}_3\\text{O}_4"
            options[3]["text"] = "\\text{CuCO}_3\\cdot\\text{Cu}(\\text{OH})_2"
        elif num == 80: # Booklet 35
            text = "For the cell reaction 2\\text{Fe}^{3+}(\\text{aq}) + 2\\text{I}^-(\\text{aq}) \\rightarrow 2\\text{Fe}^{2+}(\\text{aq}) + \\text{I}_2(\\text{aq}), E_{\\text{cell}}^\\circ = 0.24\\text{ V at }298\\text{ K}. The standard Gibbs energy (\\Delta_r G^\\circ) of the cell reaction is : [Given that Faraday constant F = 96500\\text{ C mol}^{-1}]"
            options[0]["text"] = "-46.32\\text{ kJ mol}^{-1}"
            options[1]["text"] = "-23.16\\text{ kJ mol}^{-1}"
            options[2]["text"] = "46.32\\text{ kJ mol}^{-1}"
            options[3]["text"] = "23.16\\text{ kJ mol}^{-1}"
        elif num == 81: # Booklet 36
            text = "In which case change in entropy is negative ?"
            options[0]["text"] = "Evaporation of water"
            options[1]["text"] = "Expansion of a gas at constant temperature"
            options[2]["text"] = "Sublimation of solid to gas"
            options[3]["text"] = "2\\text{H}(\\text{g}) \\rightarrow \\text{H}_2(\\text{g})"
        elif num == 82: # Booklet 37
            text = "Match the following :\n| Column-I | Column-II |\n|---|---|\n| (a) Pure nitrogen | (i) Chlorine |\n| (b) Haber process | (ii) Sulphuric acid |\n| (c) Contact process | (iii) Ammonia |\n| (d) Deacon's process | (iv) Sodium azide or Barium azide |\n\nWhich of the following is the correct option ?"
            options[0]["text"] = "(a) - (i), (b) - (ii), (c) - (iii), (d) - (iv)"
            options[1]["text"] = "(a) - (ii), (b) - (iv), (c) - (i), (d) - (iii)"
            options[2]["text"] = "(a) - (iii), (b) - (iv), (c) - (ii), (d) - (i)"
            options[3]["text"] = "(a) - (iv), (b) - (iii), (c) - (ii), (d) - (i)"
        elif num == 83: # Booklet 38
            text = "Which of the following is incorrect statement ?"
            options[0]["text"] = "\\text{PbF}_4\\text{ is covalent in nature}"
            options[1]["text"] = "\\text{SiCl}_4\\text{ is easily hydrolysed}"
            options[2]["text"] = "\\text{GeX}_4\\text{ (X = F, Cl, Br, I) is more stable than }\\text{GeX}_2"
            options[3]["text"] = "\\text{SnF}_4\\text{ is ionic in nature}"
        elif num == 85: # Booklet 40
            text = "A gas at 350 K and 15 bar has molar volume 20 percent smaller than that for an ideal gas under the same conditions. The correct option about the gas and its compressibility factor (Z) is :"
            options[0]["text"] = "Z > 1\\text{ and attractive forces are dominant}"
            options[1]["text"] = "Z > 1\\text{ and repulsive forces are dominant}"
            options[2]["text"] = "Z < 1\\text{ and attractive forces are dominant}"
            options[3]["text"] = "Z < 1\\text{ and repulsive forces are dominant}"
        elif num == 86: # Booklet 41
            text = "Among the following, the reaction that proceeds through an electrophilic substitution is :"
            options[0]["text"] = "\\text{C}_6\\text{H}_5\\text{N}_2^+\\text{Cl}^- \\xrightarrow{\\text{Cu}_2\\text{Cl}_2} \\text{C}_6\\text{H}_5\\text{Cl} + \\text{N}_2"
            options[1]["text"] = "\\text{C}_6\\text{H}_6 + \\text{Cl}_2 \\xrightarrow{\\text{AlCl}_3} \\text{C}_6\\text{H}_5\\text{Cl} + \\text{HCl}"
            options[2]["text"] = "\\text{C}_6\\text{H}_6 + 3\\text{Cl}_2 \\xrightarrow{\\text{UV light}} \\text{C}_6\\text{H}_6\\text{Cl}_6"
            options[3]["text"] = "\\text{C}_6\\text{H}_5\\text{CH}_2\\text{OH} + \\text{HCl} \\xrightarrow{\\text{heat}} \\text{C}_6\\text{H}_5\\text{CH}_2\\text{Cl} + \\text{H}_2\\text{O}"
        elif num == 87: # Booklet 42
            text = "The major product of the following reaction is :"
            q["images"] = ["Q87.png"]
        elif num == 88: # Booklet 43
            text = "For the chemical reaction \\text{N}_2(\\text{g}) + 3\\text{H}_2(\\text{g}) \\rightleftharpoons 2\\text{NH}_3(\\text{g}) the correct option is :"
            options[0]["text"] = "-\\frac{1}{3} \\frac{d[\\text{H}_2]}{dt} = -\\frac{1}{2} \\frac{d[\\text{NH}_3]}{dt}"
            options[1]["text"] = "-\\frac{d[\\text{N}_2]}{dt} = 2 \\frac{d[\\text{NH}_3]}{dt}"
            options[2]["text"] = "-\\frac{d[\\text{N}_2]}{dt} = \\frac{1}{2} \\frac{d[\\text{NH}_3]}{dt}"
            options[3]["text"] = "\\frac{d[\\text{H}_2]}{dt} = \\frac{2}{3} \\frac{d[\\text{NH}_3]}{dt}"
        elif num == 89: # Booklet 44
            text = "What is the correct electronic configuration of the central atom in \\text{K}_4[\\text{Fe}(\\text{CN})_6] based on crystal field theory ?"
            options[0]["text"] = "t_{2g}^4 e_g^2"
            options[1]["text"] = "t_{2g}^6 e_g^0"
            options[2]["text"] = "e^3 t_2^3"
            options[3]["text"] = "e^4 t_2^2"

    # ==================== BIOLOGY (Site Q91 to Q180) ====================
    elif section == "Biology":
        if num == 93:
            text = "Which of the following glucose transporters is insulin-dependent ?"
            options[0]["text"] = "GLUT I"
            options[1]["text"] = "GLUT II"
            options[2]["text"] = "GLUT III"
            options[3]["text"] = "GLUT IV"
        elif num == 98:
            text = "Under which of the following conditions will there be no change in the reading frame of following mRNA ?\n\\text{5'-AACAGCGGUGCUAUU-3'}"
            options[0]["text"] = "Insertion of G at 5th position"
            options[1]["text"] = "Deletion of G from 5th position"
            options[2]["text"] = "Insertion of A and G at 4th and 5th positions respectively"
            options[3]["text"] = "Deletion of GGU from 7th, 8th and 9th positions"
        elif num == 100:
            text = "Match the following organisms with the products they produce :-\n| Column-I | Column-II |\n|---|---|\n| (a) Lactobacillus | (i) Cheese |\n| (b) Saccharomyces cerevisiae | (ii) Curd |\n| (c) Aspergillus niger | (iii) Citric Acid |\n| (d) Acetobacter aceti | (iv) Bread |\n| | (v) Acetic Acid |\n\nSelect the correct option."
        elif num == 109:
            text = "Match the following organisms with their respective characteristics :-\n| Column-I | Column-II |\n|---|---|\n| (a) Pila | (i) Flame cells |\n| (b) Bombyx | (ii) Comb plates |\n| (c) Pleurobrachia | (iii) Radula |\n| (d) Taenia | (iv) Malpighian tubules |\n\nSelect the correct option from the following :"
        elif num == 130:
            text = "Which of the following is true for the correct sequence of stages in cell cycle ?"
            options[0]["text"] = "\\text{M} \\rightarrow \\text{G}_1 \\rightarrow \\text{G}_2 \\rightarrow \\text{S}"
            options[1]["text"] = "\\text{G}_1 \\rightarrow \\text{G}_2 \\rightarrow \\text{S} \\rightarrow \\text{M}"
            options[2]["text"] = "\\text{S} \\rightarrow \\text{G}_1 \\rightarrow \\text{G}_2 \\rightarrow \\text{M}"
            options[3]["text"] = "\\text{G}_1 \\rightarrow \\text{S} \\rightarrow \\text{G}_2 \\rightarrow \\text{M}"
        elif num == 136:
            text = "In Antirrhinum (Snapdragon), a red flower was crossed with a white flower and in \\text{F}_1\\text{ generation}, pink flowers were obtained. When pink flowers were selfed, the \\text{F}_2\\text{ generation} showed white, red and pink flowers. Choose the incorrect statement from the following :"
            options[0]["text"] = "This experiment does not follow the Principle of Dominance"
            options[1]["text"] = "Pink colour in \\text{F}_1\\text{ is due to incomplete dominance.}"
            options[2]["text"] = "Ratio of \\text{F}_2\\text{ is }\\frac{1}{4}\\text{ (Red) } : \\frac{2}{4}\\text{ (Pink) } : \\frac{1}{4}\\text{ (White)}"
            options[3]["text"] = "Law of Segregation does not apply in this experiment."
        elif num == 138:
            text = "The correct sequence of phases of cell cycle is :"
            options[0]["text"] = "\\text{M} \\rightarrow \\text{G}_1 \\rightarrow \\text{G}_2 \\rightarrow \\text{S}"
            options[1]["text"] = "\\text{G}_1 \\rightarrow \\text{G}_2 \\rightarrow \\text{S} \\rightarrow \\text{M}"
            options[2]["text"] = "\\text{S} \\rightarrow \\text{G}_1 \\rightarrow \\text{G}_2 \\rightarrow \\text{M}"
            options[3]["text"] = "\\text{G}_1 \\rightarrow \\text{S} \\rightarrow \\text{G}_2 \\rightarrow \\text{M}"
        elif num == 146:
            text = "Which of the following protocols was signed to reduce greenhouse gas emissions ?"
            options[0]["text"] = "to reduce \\text{CO}_2 emissions and global warming."
        elif num == 149:
            text = "Match the following structures with their respective locations in organs :-\n| Column-I | Column-II |\n|---|---|\n| (a) Crypts of Lieberkuhn | (i) Pancreas |\n| (b) Glisson's Capsule | (ii) Duodenum |\n| (c) Islets of Langerhans | (iii) Small intestine |\n| (d) Brunner's Glands | (iv) Liver |\n\nSelect the correct option from the following :"
        elif num == 150:
            text = "Match the following hormones with the respective disease :-\n| Column-I | Column-II |\n|---|---|\n| (a) Insulin | (i) Addison's disease |\n| (b) Thyroxin | (ii) Diabetes insipidus |\n| (c) Corticoids | (iii) Acromegaly |\n| (d) Growth Hormone | (iv) Goitre |\n| | (v) Diabetes mellitus |\n\nSelect the correct option."
        elif num == 163:
            text = "Cells in \\text{G}_0 phase :"
            options[0]["text"] = "exit the cell cycle"
            options[1]["text"] = "enter the cell cycle"
            options[2]["text"] = "suspend the cell cycle"
            options[3]["text"] = "terminate the cell cycle"
        elif num == 164:
            text = "Match Column - I with Column - II :-\n| Column-I | Column-II |\n|---|---|\n| (a) Saprophyte | (i) Symbiotic association of fungi with plant roots |\n| (b) Parasite | (ii) Decomposition of dead organic materials |\n| (c) Lichens | (iii) Living on living plants or animals |\n| (d) Mycorrhiza | (iv) Symbiotic association of algae and fungi |\n\nChoose the correct answer from the options given below :"
        elif num == 170:
            text = "Match the following genes of the Lac operon with their respective products :-\n| Column-I | Column-II |\n|---|---|\n| (a) i gene | (i) \\beta-galactosidase |\n| (b) z gene | (ii) Permease |\n| (c) a gene | (iii) Repressor |\n| (d) y gene | (iv) Transacetylase |\n\nSelect the correct option."
        elif num == 171:
            text = "Select the correct sequence of organs in the alimentary canal of cockroach starting from mouth :"
            options[0]["text"] = "\\text{Pharynx} \\rightarrow \\text{Oesophagus} \\rightarrow \\text{Crop} \\rightarrow \\text{Gizzard} \\rightarrow \\text{Ileum} \\rightarrow \\text{Colon} \\rightarrow \\text{Rectum}"
            options[1]["text"] = "\\text{Pharynx} \\rightarrow \\text{Oesophagus} \\rightarrow \\text{Gizzard} \\rightarrow \\text{Crop} \\rightarrow \\text{Ileum} \\rightarrow \\text{Colon} \\rightarrow \\text{Rectum}"
            options[2]["text"] = "\\text{Pharynx} \\rightarrow \\text{Oesophagus} \\rightarrow \\text{Gizzard} \\rightarrow \\text{Ileum} \\rightarrow \\text{Crop} \\rightarrow \\text{Colon} \\rightarrow \\text{Rectum}"
            options[3]["text"] = "\\text{Pharynx} \\rightarrow \\text{Oesophagus} \\rightarrow \\text{Ileum} \\rightarrow \\text{Crop} \\rightarrow \\text{Gizzard} \\rightarrow \\text{Colon} \\rightarrow \\text{Rectum}"
        elif num == 172:
            text = "Match the hominids with their correct brain size :-\n| Column-I | Column-II |\n|---|---|\n| (a) Homo habilis | (i) 900 cc |\n| (b) Homo neanderthalensis | (ii) 1350 cc |\n| (c) Homo erectus | (iii) 650-800 cc |\n| (d) Homo sapiens | (iv) 1400 cc |\n\nSelect the correct option."
        elif num == 178:
            text = "Match Column - I with Column - II :-\n| Column-I | Column-II |\n|---|---|\n| (a) P - wave | (i) Depolarisation of ventricles |\n| (b) QRS complex | (ii) Repolarisation of ventricles |\n| (c) T - wave | (iii) Coronary ischemia |\n| (d) Reduction in the size of T - wave | (iv) Depolarisation of atria |\n| | (v) Repolarisation of atria |\n\nSelect the correct option."

    # Update question dict with final clean text
    q["text"] = clean_general_text(text)
    for opt in options:
        opt["text"] = clean_general_text(opt.get("text", ""))
    q["options"] = options
    return q

def main():
    data = json.load(open(QUESTIONS_FILE, "r", encoding="utf-8"))
    questions = data["questions"]
    
    refined_questions = []
    for q in questions:
        refined_questions.append(apply_precision_formatting(q))
        
    data["questions"] = refined_questions
    
    with open(QUESTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Refined all {len(refined_questions)} questions in {QUESTIONS_FILE}!")

if __name__ == "__main__":
    main()
