import fitz
import json
import os
import re
import sys

PDF_PATH = os.path.join("neet", "Neet 2016.pdf")
OUT_DIR = os.path.join("neet-out", "2016")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(os.path.join(OUT_DIR, "images"), exist_ok=True)

doc = fitz.open(PDF_PATH)

# Original Code Q Answers from booklet / official key
PDF_ANSWERS = {
    1: "3", 2: "4", 3: "4", 4: "4", 5: "1", 6: "3", 7: "4", 8: "3", 9: "4", 10: "3",
    11: "1", 12: "4", 13: "3", 14: "2", 15: "4", 16: "4", 17: "1", 18: "3", 19: "1", 20: "3",
    21: "2", 22: "4", 23: "1", 24: "4", 25: "Bonus", 26: "4", 27: "1", 28: "4", 29: "1", 30: "4",
    31: "2", 32: "1", 33: "4", 34: "1", 35: "1", 36: "4", 37: "4", 38: "1", 39: "3", 40: "3",
    41: "3", 42: "1", 43: "2", 44: "4", 45: "4", 46: "3", 47: "3", 48: "3", 49: "1", 50: "2",
    51: "2", 52: "3", 53: "2", 54: "1", 55: "1", 56: "4", 57: "1", 58: "3", 59: "1", 60: "1",
    61: "2", 62: "1", 63: "2", 64: "3", 65: "2", 66: "3", 67: "3", 68: "4", 69: "1", 70: "3",
    71: "2", 72: "1", 73: "4", 74: "4", 75: "3", 76: "4", 77: "1", 78: "2", 79: "3", 80: "3",
    81: "3", 82: "4", 83: "3", 84: "1", 85: "1", 86: "3", 87: "3", 88: "2", 89: "4", 90: "2",
    91: "4", 92: "4", 93: "1", 94: "2", 95: "1", 96: "1", 97: "2", 98: "1", 99: "1", 100: "4",
    101: "1", 102: "1", 103: "4", 104: "Bonus", 105: "2", 106: "2", 107: "2", 108: "4", 109: "4", 110: "1",
    111: "3", 112: "3", 113: "1", 114: "2", 115: "1", 116: "2", 117: "3", 118: "4", 119: "4", 120: "3",
    121: "4", 122: "2", 123: "1", 124: "3", 125: "3", 126: "1", 127: "2", 128: "2", 129: "4", 130: "2",
    131: "4", 132: "4", 133: "2", 134: "1", 135: "3", 136: "3", 137: "3", 138: "3", 139: "3", 140: "3",
    141: "3", 142: "4", 143: "4", 144: "3", 145: "3", 146: "2", 147: "1", 148: "3", 149: "1", 150: "4",
    151: "2", 152: "3", 153: "1", 154: "3", 155: "4", 156: "3", 157: "2", 158: "1", 159: "1", 160: "1",
    161: "3", 162: "4", 163: "1", 164: "2", 165: "4", 166: "2", 167: "1", 168: "2", 169: "2", 170: "2",
    171: "4", 172: "4", 173: "1", 174: "1", 175: "4", 176: "4", 177: "4", 178: "2", 179: "4", 180: "1"
}

def standard_to_pdf_qnum(qnum):
    if 1 <= qnum <= 45:
        return qnum + 135  # 1 -> 136, 45 -> 180
    elif 46 <= qnum <= 90:
        return qnum - 45   # 46 -> 1, 90 -> 45
    else:
        return qnum - 45   # 91 -> 46, 180 -> 135

def get_section(qnum):
    if 1 <= qnum <= 45:
        return "Physics"
    elif 46 <= qnum <= 90:
        return "Chemistry"
    else:
        return "Biology"

STEM_IMAGES = {
    1: ["Q1.png"],    # PDF Q136
    2: ["Q2.png"],    # PDF Q137
    20: ["Q20.png"],  # PDF Q155
    24: ["Q24.png"],  # PDF Q159
    50: ["Q50.png"],  # PDF Q5
    52: ["Q52.png"],  # PDF Q7
}

OPTION_FIGURES = {
    87: { # PDF Q42
        1: "Q87_opt_1.png",
        2: "Q87_opt_2.png",
        3: "Q87_opt_3.png",
        4: "Q87_opt_4.png",
    }
}

CURATED_QUESTIONS = {
    # =========================================================================
    # PHYSICS (Q1 to Q45)
    # =========================================================================
    1: { # PDF Q136
        "text": "A capacitor of 2 \\mu\\text{F} is charged as shown in the diagram. When the switch S is turned to position 2, the percentage of its stored energy dissipated is :",
        "options": [
            {"label": "1", "text": "20 %"},
            {"label": "2", "text": "75 %"},
            {"label": "3", "text": "80 %"},
            {"label": "4", "text": "0 %"}
        ]
    },
    2: { # PDF Q137
        "text": "To get output 1 for the following circuit, the correct choice for the input is :",
        "options": [
            {"label": "1", "text": "A = 1, B = 0, C = 0"},
            {"label": "2", "text": "A = 1, B = 1, C = 0"},
            {"label": "3", "text": "A = 1, B = 0, C = 1"},
            {"label": "4", "text": "A = 0, B = 1, C = 0"}
        ]
    },
    3: { # PDF Q138
        "text": "A potentiometer wire is 100 cm long and a constant potential difference is maintained across it. Two cells are connected in series first to support one another and then in opposite direction. The balance points are obtained at 50 cm and 10 cm from the positive end of the wire in the two cases. The ratio of emf's is :",
        "options": [
            {"label": "1", "text": "5 : 4"},
            {"label": "2", "text": "3 : 4"},
            {"label": "3", "text": "3 : 2"},
            {"label": "4", "text": "5 : 1"}
        ]
    },
    4: { # PDF Q139
        "text": "When a metallic surface is illuminated with radiation of wavelength \\lambda, the stopping potential is V. If the same surface is illuminated with radiation of wavelength 2\\lambda, the stopping potential is \\frac{V}{4}. The threshold wavelength for the metallic surface is :",
        "options": [
            {"label": "1", "text": "5\\lambda"},
            {"label": "2", "text": "\\frac{5}{2}\\lambda"},
            {"label": "3", "text": "3\\lambda"},
            {"label": "4", "text": "4\\lambda"}
        ]
    },
    5: { # PDF Q140
        "text": "Two non-mixing liquids of densities \\rho and n\\rho (n > 1) are put in a container. The height of each liquid is h. A solid cylinder of length L and density d is put in this container. The cylinder floats with its axis vertical and length pL (p < 1) in the denser liquid. The density d is equal to :",
        "options": [
            {"label": "1", "text": "[1 + (n + 1)p]\\rho"},
            {"label": "2", "text": "[2 + (n + 1)p]\\rho"},
            {"label": "3", "text": "[1 + (n - 1)p]\\rho"},
            {"label": "4", "text": "[2 + (n - 1)p]\\rho"}
        ]
    },
    6: { # PDF Q141
        "text": "Out of the following options which one can be used to produce a propagating electromagnetic wave ?",
        "options": [
            {"label": "1", "text": "A stationary charge"},
            {"label": "2", "text": "A chargeless particle"},
            {"label": "3", "text": "An accelerating charge"},
            {"label": "4", "text": "A charge moving at constant velocity"}
        ]
    },
    7: { # PDF Q142
        "text": "The charge flowing through a resistance R varies with time t as Q = at - bt^{2}, where a and b are positive constants. The total heat produced in R is :",
        "options": [
            {"label": "1", "text": "\\frac{a^{3} R}{3b}"},
            {"label": "2", "text": "\\frac{a^{3} R}{2b}"},
            {"label": "3", "text": "\\frac{a^{3} R}{b}"},
            {"label": "4", "text": "\\frac{a^{3} R}{6b}"}
        ]
    },
    8: { # PDF Q143
        "text": "At what height from the surface of earth the gravitation potential and the value of g are -5.4 \\times 10^{7} \\text{ J kg}^{-2} and 6.0 \\text{ ms}^{-2} respectively ? (Take the radius of earth as 6400 km)",
        "options": [
            {"label": "1", "text": "1600 km"},
            {"label": "2", "text": "1400 km"},
            {"label": "3", "text": "2000 km"},
            {"label": "4", "text": "2600 km"}
        ]
    },
    9: { # PDF Q144
        "text": "Coefficient of linear expansion of brass and steel rods are \\alpha_{1} and \\alpha_{2}. Lengths of brass and steel rods are l_{1} and l_{2} respectively. If (l_{2} - l_{1}) is maintained same at all temperatures, which one of the following relations holds good ?",
        "options": [
            {"label": "1", "text": "\\alpha_{1} l_{2} = \\alpha_{2} l_{1}"},
            {"label": "2", "text": "\\alpha_{1} l_{2}^{2} = \\alpha_{2} l_{1}^{2}"},
            {"label": "3", "text": "\\alpha_{1} l_{1} = \\alpha_{2} l_{2}"},
            {"label": "4", "text": "\\alpha_{1}^{2} l_{2} = \\alpha_{2}^{2} l_{1}"}
        ]
    },
    10: { # PDF Q145
        "text": "The intensity at the maximum in a Young's double slit experiment is I_{0}. Distance between two slits is d = 5\\lambda, where \\lambda is the wavelength of light used in the experiment. What will be the intensity in front of one of the slits on the screen placed at a distance D = 10d ?",
        "options": [
            {"label": "1", "text": "\\frac{3}{4} I_{0}"},
            {"label": "2", "text": "\\frac{I_{0}}{4}"},
            {"label": "3", "text": "\\frac{I_{0}}{2}"},
            {"label": "4", "text": "I_{0}"}
        ]
    },
    11: { # PDF Q146
        "text": "Given the value of Rydberg constant is 10^{7} \\text{ m}^{-1}, the wave number of the last line of the Balmer series in hydrogen spectrum will be :",
        "options": [
            {"label": "1", "text": "0.5 \\times 10^{7} \\text{ m}^{-1}"},
            {"label": "2", "text": "0.25 \\times 10^{7} \\text{ m}^{-1}"},
            {"label": "3", "text": "2.5 \\times 10^{7} \\text{ m}^{-1}"},
            {"label": "4", "text": "0.025 \\times 10^{4} \\text{ m}^{-1}"}
        ]
    },
    12: { # PDF Q147
        "text": "The ratio of escape velocity at earth (v_{e}) to the escape velocity at a planet (v_{p}) whose radius and mean density are twice as that of earth is :",
        "options": [
            {"label": "1", "text": "1 : 2\\sqrt{2}"},
            {"label": "2", "text": "1 : 4"},
            {"label": "3", "text": "1 : \\sqrt{2}"},
            {"label": "4", "text": "1 : 2"}
        ]
    },
    13: { # PDF Q148
        "text": "A long solenoid has 1000 turns. When a current of 4 A flows through it, the magnetic flux linked with each turn of the solenoid is 4 \\times 10^{-3} \\text{ Wb}. The self-inductance of the solenoid is :",
        "options": [
            {"label": "1", "text": "3 H"},
            {"label": "2", "text": "2 H"},
            {"label": "3", "text": "1 H"},
            {"label": "4", "text": "4 H"}
        ]
    },
    14: { # PDF Q149
        "text": "A car is negotiating a curved road of radius R. The road is banked at an angle \\theta. The coefficient of friction between the tyres of the car and the road is \\mu_{s}. The maximum safe velocity on this road is :",
        "options": [
            {"label": "1", "text": "\\sqrt{gR (\\frac{\\mu_{s} + \\tan\\theta}{1 - \\mu_{s}\\tan\\theta})}"},
            {"label": "2", "text": "\\sqrt{\\frac{g}{R} (\\frac{\\mu_{s} + \\tan\\theta}{1 - \\mu_{s}\\tan\\theta})}"},
            {"label": "3", "text": "\\sqrt{\\frac{g}{R^{2}} (\\frac{\\mu_{s} + \\tan\\theta}{1 - \\mu_{s}\\tan\\theta})}"},
            {"label": "4", "text": "\\sqrt{gR^{2} (\\frac{\\mu_{s} + \\tan\\theta}{1 - \\mu_{s}\\tan\\theta})}"}
        ]
    },
    15: { # PDF Q150
        "text": "The magnetic susceptibility is negative for :",
        "options": [
            {"label": "1", "text": "paramagnetic material only"},
            {"label": "2", "text": "ferromagnetic material only"},
            {"label": "3", "text": "paramagnetic and ferromagnetic materials"},
            {"label": "4", "text": "diamagnetic material only"}
        ]
    },
    16: { # PDF Q151
        "text": "A siren emitting a sound of frequency 800 Hz moves away from an observer towards a cliff at a speed of 15 \\text{ ms}^{-1}. Then, the frequency of sound that the observer hears in the echo reflected from the cliff is : (Take velocity of sound in air = 330 \\text{ ms}^{-1})",
        "options": [
            {"label": "1", "text": "800 Hz"},
            {"label": "2", "text": "838 Hz"},
            {"label": "3", "text": "885 Hz"},
            {"label": "4", "text": "765 Hz"}
        ]
    },
    17: { # PDF Q152
        "text": "A body of mass 1 kg begins to move under the action of a time dependent force \\vec{F} = (2t\\hat{i} + 3t^{2}\\hat{j}) \\text{ N}, where \\hat{i} and \\hat{j} are unit vectors along x and y axis. What power will be developed by the force at the time t ?",
        "options": [
            {"label": "1", "text": "(2t^{2} + 4t^{4}) \\text{ W}"},
            {"label": "2", "text": "(2t^{3} + 3t^{4}) \\text{ W}"},
            {"label": "3", "text": "(2t^{3} + 3t^{5}) \\text{ W}"},
            {"label": "4", "text": "(2t + 3t^{3}) \\text{ W}"}
        ]
    },
    18: { # PDF Q153
        "text": "From a disc of radius R and mass M, a circular hole of diameter R, whose rim passes through the centre is cut. What is the moment of inertia of the remaining part of the disc about a perpendicular axis, passing through the centre ?",
        "options": [
            {"label": "1", "text": "\\frac{13}{32} MR^{2}"},
            {"label": "2", "text": "\\frac{11}{32} MR^{2}"},
            {"label": "3", "text": "\\frac{9}{32} MR^{2}"},
            {"label": "4", "text": "\\frac{15}{32} MR^{2}"}
        ]
    },
    19: { # PDF Q154
        "text": "In a diffraction pattern due to a single slit of width 'a', the first minimum is observed at an angle 30^\\circ when light of wavelength 5000 \\text{ \\AA} is incident on the slit. The first secondary maximum is observed at an angle of :",
        "options": [
            {"label": "1", "text": "\\sin^{-1}(\\frac{2}{3})"},
            {"label": "2", "text": "\\sin^{-1}(\\frac{1}{2})"},
            {"label": "3", "text": "\\sin^{-1}(\\frac{3}{4})"},
            {"label": "4", "text": "\\sin^{-1}(\\frac{1}{4})"}
        ]
    },
    20: { # PDF Q155
        "text": "A square loop ABCD carrying a current i is placed near and coplanar with a long straight conductor XY carrying a current I, the net force on the loop will be :",
        "options": [
            {"label": "1", "text": "\\frac{\\mu_{0} I i}{2\\pi}"},
            {"label": "2", "text": "\\frac{2\\mu_{0} I i L}{3\\pi}"},
            {"label": "3", "text": "\\frac{\\mu_{0} I i L}{2\\pi}"},
            {"label": "4", "text": "\\frac{2\\mu_{0} I i}{3\\pi}"}
        ]
    },
    21: { # PDF Q156
        "text": "A black body is at a temperature of 5760 K. The energy of radiation emitted by the body at wavelength 250 nm is U_{1}, at wavelength 500 nm is U_{2} and that at 1000 nm is U_{3}. Wien's constant, b = 2.88 \\times 10^{6} \\text{ nm}\\cdot\\text{K}. Which of the following is correct ?",
        "options": [
            {"label": "1", "text": "U_{3} = 0"},
            {"label": "2", "text": "U_{1} > U_{2}"},
            {"label": "3", "text": "U_{2} > U_{1}"},
            {"label": "4", "text": "U_{1} = 0"}
        ]
    },
    22: { # PDF Q157
        "text": "An air column, closed at one end and open at the other, resonates with a tuning fork when the smallest length of the column is 50 cm. The next larger length of the column resonating with the same tuning fork is :",
        "options": [
            {"label": "1", "text": "100 cm"},
            {"label": "2", "text": "150 cm"},
            {"label": "3", "text": "200 cm"},
            {"label": "4", "text": "66.7 cm"}
        ]
    },
    23: { # PDF Q158
        "text": "The molecules of a given mass of a gas have r.m.s velocity of 200 \\text{ ms}^{-1} at 27^\\circ\\text{C} and 1.0 \\times 10^{5} \\text{ Nm}^{-2} pressure. When the temperature and pressure of the gas are respectively, 127^\\circ\\text{C} and 0.05 \\times 10^{5} \\text{ Nm}^{-2}, the r.m.s. velocity of its molecules in \\text{ms}^{-1} is :",
        "options": [
            {"label": "1", "text": "\\frac{400}{\\sqrt{3}}"},
            {"label": "2", "text": "\\frac{100\\sqrt{2}}{3}"},
            {"label": "3", "text": "\\frac{100}{3}"},
            {"label": "4", "text": "100\\sqrt{2}"}
        ]
    },
    24: { # PDF Q159
        "text": "Consider the junction diode as ideal. The value of current flowing through AB is :",
        "options": [
            {"label": "1", "text": "10^{-2} \\text{ A}"},
            {"label": "2", "text": "10^{-1} \\text{ A}"},
            {"label": "3", "text": "10^{-3} \\text{ A}"},
            {"label": "4", "text": "0 \\text{ A}"}
        ]
    },
    25: { # PDF Q160
        "text": "If the magnitude of sum of two vectors is equal to the magnitude of difference of the two vectors, the angle between these vectors is :",
        "options": [
            {"label": "1", "text": "90^\\circ"},
            {"label": "2", "text": "45^\\circ"},
            {"label": "3", "text": "180^\\circ"},
            {"label": "4", "text": "0^\\circ"}
        ]
    },
    26: { # PDF Q161
        "text": "An astronomical telescope has objective and eyepiece of focal lengths 40 cm and 4 cm respectively. To view an object 200 cm away from the objective, the lenses must be separated by a distance :",
        "options": [
            {"label": "1", "text": "46.0 cm"},
            {"label": "2", "text": "50.0 cm"},
            {"label": "3", "text": "54.0 cm"},
            {"label": "4", "text": "37.3 cm"}
        ]
    },
    27: { # PDF Q162
        "text": "A npn transistor is connected to common emitter configuration in a given amplifier. A load resistance of 800 \\Omega is connected in the collector circuit and the voltage drop across it is 0.8 V. If the current amplification factor is 0.96 and the input resistance of the circuit is 192 \\Omega, the voltage gain and the power gain of the amplifier will respectively be :",
        "options": [
            {"label": "1", "text": "3.69, 3.84"},
            {"label": "2", "text": "4, 4"},
            {"label": "3", "text": "4, 3.69"},
            {"label": "4", "text": "4, 3.84"}
        ]
    },
    28: { # PDF Q163
        "text": "A gas is compressed isothermally to half its initial volume. The same gas is compressed separately through an adiabatic process until its volume is again reduced to half. Then :",
        "options": [
            {"label": "1", "text": "Compressing the gas through adiabatic process will require more work to be done."},
            {"label": "2", "text": "Compressing the gas isothermally or adiabatically will require the same amount of work."},
            {"label": "3", "text": "Which of the case (whether compression through isothermal or through adiabatic process) requires more work will depend upon the atomicity of the gas."},
            {"label": "4", "text": "Compressing the gas through isothermal process will require more work to be done."}
        ]
    },
    29: { # PDF Q164
        "text": "A long straight wire of radius a carries a steady current I. The current is uniformly distributed over its cross-section. The ratio of the magnetic fields B and B' at radial distance \\frac{a}{2} and 2a respectively, from the axis of the wire is :",
        "options": [
            {"label": "1", "text": "\\frac{1}{2}"},
            {"label": "2", "text": "1"},
            {"label": "3", "text": "4"},
            {"label": "4", "text": "\\frac{1}{4}"}
        ]
    },
    30: { # PDF Q165
        "text": "Match the corresponding entries of Column 1 with Column 2 [where m is the magnification produced by the mirror] :\n\n| Column 1 | Column 2 |\n| :--- | :--- |\n| (A) m = -2 | (a) Convex mirror |\n| (B) m = -\\frac{1}{2} | (b) Concave mirror |\n| (C) m = +2 | (c) Real image |\n| (D) m = +\\frac{1}{2} | (d) Virtual image |",
        "options": [
            {"label": "1", "text": "\\text{A} \\rightarrow \\text{a and c}; \\text{B} \\rightarrow \\text{a and d}; \\text{C} \\rightarrow \\text{a and b}; \\text{D} \\rightarrow \\text{c and d}"},
            {"label": "2", "text": "\\text{A} \\rightarrow \\text{a and d}; \\text{B} \\rightarrow \\text{b and c}; \\text{C} \\rightarrow \\text{b and d}; \\text{D} \\rightarrow \\text{b and c}"},
            {"label": "3", "text": "\\text{A} \\rightarrow \\text{c and d}; \\text{B} \\rightarrow \\text{b and d}; \\text{C} \\rightarrow \\text{b and c}; \\text{D} \\rightarrow \\text{a and d}"},
            {"label": "4", "text": "\\text{A} \\rightarrow \\text{b and c}; \\text{B} \\rightarrow \\text{b and c}; \\text{C} \\rightarrow \\text{b and d}; \\text{D} \\rightarrow \\text{a and d}"}
        ]
    },
    31: { # PDF Q166
        "text": "If the velocity of a particle is v = At + Bt^{2}, where A and B are constants, then the distance travelled by it between 1 s and 2 s is :",
        "options": [
            {"label": "1", "text": "3A + 7B"},
            {"label": "2", "text": "\\frac{3}{2}A + \\frac{7}{3}B"},
            {"label": "3", "text": "\\frac{A}{2} + \\frac{B}{3}"},
            {"label": "4", "text": "\\frac{3}{2}A + 4B"}
        ]
    },
    32: { # PDF Q167
        "text": "A disk and a sphere of same radius but different masses roll off on two inclined planes of the same altitude and length. Which one of the two objects gets to the bottom of the plane first ?",
        "options": [
            {"label": "1", "text": "Sphere"},
            {"label": "2", "text": "Both reach at the same time"},
            {"label": "3", "text": "Depends on their masses"},
            {"label": "4", "text": "Disk"}
        ]
    },
    33: { # PDF Q168
        "text": "Two identical charged spheres suspended from a common point by two massless strings of length l, are initially at a distance d (d \\ll l) apart because of their mutual repulsion. The charges begin to leak from both the spheres at a constant rate. As a result, the spheres approach each other with a velocity v. Then v varies as a function of the distance x between the spheres, as :",
        "options": [
            {"label": "1", "text": "v \\propto x"},
            {"label": "2", "text": "v \\propto x^{-1/2}"},
            {"label": "3", "text": "v \\propto x^{-1}"},
            {"label": "4", "text": "v \\propto x^{1/2}"}
        ]
    },
    34: { # PDF Q169
        "text": "A particle moves so that its position vector is given by \\vec{r} = \\cos\\omega t\\hat{x} + \\sin\\omega t\\hat{y}, where \\omega is a constant.\n\nWhich of the following is true ?",
        "options": [
            {"label": "1", "text": "Velocity and acceleration both are parallel to \\vec{r}"},
            {"label": "2", "text": "Velocity is perpendicular to \\vec{r} and acceleration is directed towards the origin"},
            {"label": "3", "text": "Velocity is perpendicular to \\vec{r} and acceleration is directed away from the origin"},
            {"label": "4", "text": "Velocity and acceleration both are perpendicular to \\vec{r}"}
        ]
    },
    35: { # PDF Q170
        "text": "A piece of ice falls from a height h so that it melts completely. Only one-quarter of the heat produced is absorbed by the ice and all energy of ice gets converted into heat during its fall. The value of h is : [Latent heat of ice is 3.4 \\times 10^{5} \\text{ J/kg} and g = 10 \\text{ N/kg}]",
        "options": [
            {"label": "1", "text": "544 km"},
            {"label": "2", "text": "136 km"},
            {"label": "3", "text": "68 km"},
            {"label": "4", "text": "34 km"}
        ]
    },
    36: { # PDF Q171
        "text": "A uniform circular disc of radius 50 cm at rest is free to turn about an axis which is perpendicular to its plane and passes through its centre. It is subjected to a torque which produces a constant angular acceleration of 2.0 \\text{ rad s}^{-2}. Its net acceleration in \\text{ms}^{-2} at the end of 2.0 s is approximately :",
        "options": [
            {"label": "1", "text": "7.0"},
            {"label": "2", "text": "6.0"},
            {"label": "3", "text": "3.0"},
            {"label": "4", "text": "8.0"}
        ]
    },
    37: { # PDF Q172
        "text": "What is the minimum velocity with which a body of mass m must enter a vertical loop of radius R so that it can complete the loop ?",
        "options": [
            {"label": "1", "text": "\\sqrt{2gR}"},
            {"label": "2", "text": "\\sqrt{3gR}"},
            {"label": "3", "text": "\\sqrt{5gR}"},
            {"label": "4", "text": "\\sqrt{gR}"}
        ]
    },
    38: { # PDF Q173
        "text": "A small signal voltage V(t) = V_{0} \\sin\\omega t is applied across an ideal capacitor C :",
        "options": [
            {"label": "1", "text": "Over a full cycle the capacitor C does not consume any energy from the voltage source"},
            {"label": "2", "text": "Current I(t) is in phase with voltage V(t)"},
            {"label": "3", "text": "Current I(t) leads voltage V(t) by 180^\\circ"},
            {"label": "4", "text": "Current I(t) lags voltage V(t) by 90^\\circ"}
        ]
    },
    39: { # PDF Q174
        "text": "A uniform rope of length L and mass m_{1} hangs vertically from a rigid support. A block of mass m_{2} is attached to the free end of the rope. A transverse pulse of wavelength \\lambda_{1} is produced at the lower end of the rope. The wavelength of the pulse when it reaches the top of the rope is \\lambda_{2}. The ratio \\lambda_{2}/\\lambda_{1} is :",
        "options": [
            {"label": "1", "text": "\\sqrt{\\frac{m_{1} + m_{2}}{m_{2}}}"},
            {"label": "2", "text": "\\sqrt{\\frac{m_{2}}{m_{1}}}"},
            {"label": "3", "text": "\\sqrt{\\frac{m_{1} + m_{2}}{m_{1}}}"},
            {"label": "4", "text": "\\sqrt{\\frac{m_{1}}{m_{2}}}"}
        ]
    },
    40: { # PDF Q175
        "text": "An inductor 20 mH, a capacitor 50 \\mu\\text{F} and a resistor 40 \\Omega are connected in series across a source of emf V = 10 \\sin(340t). The power loss in A.C. circuit is :",
        "options": [
            {"label": "1", "text": "0.67 W"},
            {"label": "2", "text": "0.76 W"},
            {"label": "3", "text": "0.89 W"},
            {"label": "4", "text": "0.51 W"}
        ]
    },
    41: { # PDF Q176
        "text": "An electron of mass m and a photon have same energy E. The ratio of de-Broglie wavelengths associated with them is : (c being velocity of light)",
        "options": [
            {"label": "1", "text": "(\\frac{E}{2m})^{1/2}"},
            {"label": "2", "text": "c(2mE)^{1/2}"},
            {"label": "3", "text": "\\frac{1}{c}(\\frac{2m}{E})^{1/2}"},
            {"label": "4", "text": "\\frac{1}{c}(\\frac{E}{2m})^{1/2}"}
        ]
    },
    42: { # PDF Q177
        "text": "When an \\alpha-particle of mass 'm' moving with velocity 'v' bombards on a heavy nucleus of charge 'Ze', its distance of closest approach from the nucleus depends on m as :",
        "options": [
            {"label": "1", "text": "\\frac{1}{m}"},
            {"label": "2", "text": "\\frac{1}{m^{2}}"},
            {"label": "3", "text": "m"},
            {"label": "4", "text": "\\frac{1}{\\sqrt{m}}"}
        ]
    },
    43: { # PDF Q178
        "text": "A refrigerator works between 4^\\circ\\text{C} and 30^\\circ\\text{C}. It is required to remove 600 calories of heat every second in order to keep the temperature of the refrigerated space constant. The power required is : (Take 1 cal = 4.2 Joules)",
        "options": [
            {"label": "1", "text": "23.65 W"},
            {"label": "2", "text": "236.5 W"},
            {"label": "3", "text": "2365 W"},
            {"label": "4", "text": "2.365 W"}
        ]
    },
    44: { # PDF Q179
        "text": "A particle of mass 10 g moves along a circle of radius 6.4 cm with a constant tangential acceleration. What is the magnitude of this acceleration if the kinetic energy of the particle becomes equal to 8 \\times 10^{-4} \\text{ J} by the end of the second revolution after the beginning of the motion ?",
        "options": [
            {"label": "1", "text": "0.15 \\text{ m/s}^{2}"},
            {"label": "2", "text": "0.18 \\text{ m/s}^{2}"},
            {"label": "3", "text": "0.2 \\text{ m/s}^{2}"},
            {"label": "4", "text": "0.1 \\text{ m/s}^{2}"}
        ]
    },
    45: { # PDF Q180
        "text": "The angle of incidence for a ray of light at a refracting surface of a prism is 45^\\circ. The angle of prism is 60^\\circ. If the ray suffers minimum deviation through the prism, the angle of minimum deviation and refractive index of the material of the prism respectively, are :",
        "options": [
            {"label": "1", "text": "30^\\circ ; \\sqrt{2}"},
            {"label": "2", "text": "45^\\circ ; \\sqrt{2}"},
            {"label": "3", "text": "30^\\circ ; \\frac{1}{\\sqrt{2}}"},
            {"label": "4", "text": "45^\\circ ; \\frac{1}{\\sqrt{2}}"}
        ]
    },

    # =========================================================================
    # CHEMISTRY (Q46 to Q90)
    # =========================================================================
    46: { # PDF Q1
        "text": "The addition of a catalyst during a chemical reaction alters which of the following quantities ?",
        "options": [
            {"label": "1", "text": "Internal energy"},
            {"label": "2", "text": "Enthalpy"},
            {"label": "3", "text": "Activation energy"},
            {"label": "4", "text": "Entropy"}
        ]
    },
    47: { # PDF Q2
        "text": "Predict the correct order among the following :",
        "options": [
            {"label": "1", "text": "\\text{lone pair - lone pair} > \\text{bond pair - bond pair} > \\text{lone pair - bond pair}"},
            {"label": "2", "text": "\\text{bond pair - bond pair} > \\text{lone pair - bond pair} > \\text{lone pair - lone pair}"},
            {"label": "3", "text": "\\text{lone pair - bond pair} > \\text{bond pair - bond pair} > \\text{lone pair - lone pair}"},
            {"label": "4", "text": "\\text{lone pair - lone pair} > \\text{lone pair - bond pair} > \\text{bond pair - bond pair}"}
        ]
    },
    48: { # PDF Q3
        "text": "The correct statement regarding the basicity of arylamines is :",
        "options": [
            {"label": "1", "text": "Arylamines are generally more basic than alkylamines because the nitrogen lone-pair electrons are not delocalized by interaction with the aromatic ring \\pi electron system."},
            {"label": "2", "text": "Arylamines are generally more basic than alkylamines because the nitrogen atom in arylamines is \\text{sp}-hybridized."},
            {"label": "3", "text": "Arylamines are generally less basic than alkylamines because the nitrogen lone-pair electrons are delocalized by interaction with the aromatic ring \\pi electron system."},
            {"label": "4", "text": "Arylamines are generally less basic than alkylamines because the nitrogen lone-pair electrons are delocalized by interaction with the aromatic ring \\pi electron system."}
        ]
    },
    49: { # PDF Q4
        "text": "When copper is heated with conc. \\text{HNO}_{3} it produces :",
        "options": [
            {"label": "1", "text": "\\text{Cu}(\\text{NO}_{3})_{2} \\text{ and } \\text{NO}"},
            {"label": "2", "text": "\\text{Cu}(\\text{NO}_{3})_{2}, \\text{NO} \\text{ and } \\text{NO}_{2}"},
            {"label": "3", "text": "\\text{Cu}(\\text{NO}_{3})_{2} \\text{ and } \\text{N}_{2}\\text{O}"},
            {"label": "4", "text": "\\text{Cu}(\\text{NO}_{3})_{2} \\text{ and } \\text{NO}_{2}"}
        ]
    },
    50: { # PDF Q5
        "text": "For the following reactions :\n\nWhich of the following statements is correct ?",
        "options": [
            {"label": "1", "text": "(a) is elimination, (b) is substitution and (c) addition reaction."},
            {"label": "2", "text": "(a) is elimination, (b) and (c) are substitution reactions."},
            {"label": "3", "text": "(a) is substitution, (b) and (c) are addition reactions."},
            {"label": "4", "text": "(a) and (b) are elimination reactions and (c) is addition reaction."}
        ]
    },
    51: { # PDF Q6
        "text": "Two electrons occupying the same orbital are distinguished by :",
        "options": [
            {"label": "1", "text": "Magnetic quantum number"},
            {"label": "2", "text": "Azimuthal quantum number"},
            {"label": "3", "text": "Spin quantum number"},
            {"label": "4", "text": "Principal quantum number"}
        ]
    },
    52: { # PDF Q7
        "text": "The reaction\n\ncan be classified as :",
        "options": [
            {"label": "1", "text": "Alcohol formation reaction"},
            {"label": "2", "text": "Dehydration reaction"},
            {"label": "3", "text": "Williamson alcohol synthesis reaction"},
            {"label": "4", "text": "Williamson ether synthesis reaction"}
        ]
    },
    53: { # PDF Q8
        "text": "The electronic configurations of Eu (Atomic No. 63), Gd (Atomic No. 64) and Tb (Atomic No. 65) are :",
        "options": [
            {"label": "1", "text": "[\\text{Xe}] 4f^{6} 5d^{1} 6s^{2}, [\\text{Xe}] 4f^{7} 5d^{1} 6s^{2} \\text{ and } [\\text{Xe}] 4f^{8} 5d^{1} 6s^{2}"},
            {"label": "2", "text": "[\\text{Xe}] 4f^{7} 6s^{2}, [\\text{Xe}] 4f^{7} 5d^{1} 6s^{2} \\text{ and } [\\text{Xe}] 4f^{9} 6s^{2}"},
            {"label": "3", "text": "[\\text{Xe}] 4f^{7} 6s^{2}, [\\text{Xe}] 4f^{8} 6s^{2} \\text{ and } [\\text{Xe}] 4f^{8} 5d^{1} 6s^{2}"},
            {"label": "4", "text": "[\\text{Xe}] 4f^{6} 5d^{1} 6s^{2}, [\\text{Xe}] 4f^{7} 5d^{1} 6s^{2} \\text{ and } [\\text{Xe}] 4f^{9} 6s^{2}"}
        ]
    },
    54: { # PDF Q9
        "text": "At 100^\\circ\\text{C} the vapour pressure of a solution of 6.5 g of a solute in 100 g water is 732 mm. If K_{b} = 0.52 \\text{ K kg mol}^{-1}, the boiling point of this solution will be :",
        "options": [
            {"label": "1", "text": "101^\\circ\\text{C}"},
            {"label": "2", "text": "100^\\circ\\text{C}"},
            {"label": "3", "text": "102^\\circ\\text{C}"},
            {"label": "4", "text": "100.52^\\circ\\text{C}"}
        ]
    },
    55: { # PDF Q10
        "text": "The correct statement regarding the comparison of staggered and eclipsed conformations of ethane, is :",
        "options": [
            {"label": "1", "text": "The eclipsed conformation of ethane is more stable than staggered conformation, because eclipsed conformation has no torsional strain."},
            {"label": "2", "text": "The eclipsed conformation of ethane is more stable than staggered conformation even through the eclipsed conformation has torsional strain."},
            {"label": "3", "text": "The staggered conformation of ethane is more stable than eclipsed conformation, because staggered conformation has no torsional strain."},
            {"label": "4", "text": "The staggered conformation of ethane is less stable than eclipsed conformation, because staggered conformation has torsional strain."}
        ]
    },
    56: { # PDF Q11
        "text": "Which one of the following characteristics is associated with adsorption ?",
        "options": [
            {"label": "1", "text": "\\Delta G, \\Delta H \\text{ and } \\Delta S \\text{ all are negative}"},
            {"label": "2", "text": "\\Delta G \\text{ and } \\Delta H \\text{ are negative but } \\Delta S \\text{ is positive}"},
            {"label": "3", "text": "\\Delta G \\text{ and } \\Delta S \\text{ are negative but } \\Delta H \\text{ is positive}"},
            {"label": "4", "text": "\\Delta G \\text{ is negative but } \\Delta H \\text{ and } \\Delta S \\text{ are positive}"}
        ]
    },
    57: { # PDF Q12
        "text": "Match the compounds given in Column I with the hybridisation and shape given in Column II and mark the correct option.\n\n| Column I | Column II |\n| :--- | :--- |\n| (a) \\text{XeF}_{4} | (i) \\text{sp}^{3}\\text{d}^{3} \\text{ - distorted octahedral} |\n| (b) \\text{XeF}_{6} | (ii) \\text{sp}^{3}\\text{d}^{2} \\text{ - square planar} |\n| (c) \\text{XeOF}_{4} | (iii) \\text{sp}^{3} \\text{ - pyramidal} |\n| (d) \\text{XeO}_{3} | (iv) \\text{sp}^{3}\\text{d}^{2} \\text{ - square pyramidal} |",
        "options": [
            {"label": "1", "text": "(a)-(i), (b)-(ii), (c)-(iv), (d)-(iii)"},
            {"label": "2", "text": "(a)-(iv), (b)-(iii), (c)-(i), (d)-(ii)"},
            {"label": "3", "text": "(a)-(iv), (b)-(i), (c)-(ii), (d)-(iii)"},
            {"label": "4", "text": "(a)-(ii), (b)-(i), (c)-(iv), (d)-(iii)"}
        ]
    },
    58: { # PDF Q13
        "text": "The correct statement regarding a carbonyl compound with a hydrogen atom on its \\alpha-carbon, is :",
        "options": [
            {"label": "1", "text": "a carbonyl compound with a hydrogen atom on its \\alpha-carbon never equilibrates with its corresponding enol"},
            {"label": "2", "text": "a carbonyl compound with a hydrogen atom on its \\alpha-carbon rapidly equilibrates with its corresponding enol and this process is known as aldehyde-ketone equilibration"},
            {"label": "3", "text": "a carbonyl compound with a hydrogen atom on its \\alpha-carbon rapidly equilibrates with its corresponding enol and this process is known as keto-enol tautomerism"},
            {"label": "4", "text": "a carbonyl compound with a hydrogen atom on its \\alpha-carbon rapidly equilibrates with its corresponding enol and this process is known as carbonylation"}
        ]
    },
    59: { # PDF Q14
        "text": "In a protein molecule various amino acids are linked together by :",
        "options": [
            {"label": "1", "text": "dicarboxylic bond"},
            {"label": "2", "text": "peptide bond"},
            {"label": "3", "text": "peptide bond"},
            {"label": "4", "text": "\\beta\\text{-glycosidic bond}"}
        ]
    },
    60: { # PDF Q15
        "text": "Match items of Column I with the items of Column II and assign the correct code :\n\n| Column I | Column II |\n| :--- | :--- |\n| (a) Cyanide process | (i) Ultrapure Ge |\n| (b) Froth floatation process | (ii) Dressing of \\text{ZnS} |\n| (c) Electrolytic reduction | (iii) Extraction of Al |\n| (d) Zone refining | (iv) Extraction of Au |\n| | (v) Purification of Ni |",
        "options": [
            {"label": "1", "text": "(a)-(ii), (b)-(iii), (c)-(i), (d)-(v)"},
            {"label": "2", "text": "(a)-(i), (b)-(ii), (c)-(iii), (d)-(iv)"},
            {"label": "3", "text": "(a)-(iii), (b)-(iv), (c)-(v), (d)-(i)"},
            {"label": "4", "text": "(a)-(iv), (b)-(ii), (c)-(iii), (d)-(i)"}
        ]
    },
    61: { # PDF Q16
        "text": "Which of the following is an analgesic ?",
        "options": [
            {"label": "1", "text": "Penicillin"},
            {"label": "2", "text": "Streptomycin"},
            {"label": "3", "text": "Chloromycetin"},
            {"label": "4", "text": "Novalgin"}
        ]
    },
    62: { # PDF Q17
        "text": "Which is the correct statement for the given acids ?",
        "options": [
            {"label": "1", "text": "\\text{H}_{3}\\text{PO}_{2} \\text{ is a diprotic acid while } \\text{H}_{3}\\text{PO}_{3} \\text{ is a monoprotic acid}"},
            {"label": "2", "text": "\\text{H}_{3}\\text{PO}_{2} \\text{ is a monoprotic acid while } \\text{H}_{3}\\text{PO}_{3} \\text{ is a diprotic acid}"},
            {"label": "3", "text": "\\text{H}_{3}\\text{PO}_{3} \\text{ is a diprotic acid while } \\text{H}_{3}\\text{PO}_{4} \\text{ is a monoprotic acid}"},
            {"label": "4", "text": "\\text{H}_{3}\\text{PO}_{2} \\text{ and } \\text{H}_{3}\\text{PO}_{3} \\text{ are both diprotic acids}"}
        ]
    },
    63: { # PDF Q18
        "text": "The pair of electron in the given carbanion, \\text{CH}_{3}\\text{C} \\equiv \\text{C}^{-}, is present in which of the following orbitals ?",
        "options": [
            {"label": "1", "text": "\\text{sp}^{3}"},
            {"label": "2", "text": "\\text{sp}^{2}"},
            {"label": "3", "text": "\\text{sp}"},
            {"label": "4", "text": "2\\text{p}"}
        ]
    },
    64: { # PDF Q19
        "text": "Consider the molecules \\text{CH}_{4}, \\text{NH}_{3} \\text{ and } \\text{H}_{2}\\text{O}. Which of the given statements is false ?",
        "options": [
            {"label": "1", "text": "The \\text{H}-\\text{C}-\\text{H} bond angle in \\text{CH}_{4}, the \\text{H}-\\text{N}-\\text{H} bond angle in \\text{NH}_{3}, and the \\text{H}-\\text{O}-\\text{H} bond angle in \\text{H}_{2}\\text{O} are all greater than 90^\\circ"},
            {"label": "2", "text": "The \\text{H}-\\text{O}-\\text{H} bond angle in \\text{H}_{2}\\text{O} is larger than the \\text{H}-\\text{C}-\\text{H} bond angle in \\text{CH}_{4}"},
            {"label": "3", "text": "The \\text{H}-\\text{O}-\\text{H} bond angle in \\text{H}_{2}\\text{O} is smaller than the \\text{H}-\\text{N}-\\text{H} bond angle in \\text{NH}_{3}"},
            {"label": "4", "text": "The \\text{H}-\\text{C}-\\text{H} bond angle in \\text{CH}_{4} is larger than the \\text{H}-\\text{N}-\\text{H} bond angle in \\text{NH}_{3}"}
        ]
    },
    65: { # PDF Q20
        "text": "Which one of the following statements is correct when \\text{SO}_{2} is passed through acidified \\text{K}_{2}\\text{Cr}_{2}\\text{O}_{7} solution ?",
        "options": [
            {"label": "1", "text": "\\text{SO}_{2} \\text{ is reduced}"},
            {"label": "2", "text": "Green \\text{Cr}_{2}(\\text{SO}_{4})_{3} \\text{ is formed}"},
            {"label": "3", "text": "Green \\text{Cr}_{2}(\\text{SO}_{4})_{3} \\text{ is formed}"},
            {"label": "4", "text": "The solution turns blue"}
        ]
    },
    66: { # PDF Q21
        "text": "The correct thermodynamic conditions for the spontaneous reaction at all temperatures is :",
        "options": [
            {"label": "1", "text": "\\Delta H > 0 \\text{ and } \\Delta S < 0"},
            {"label": "2", "text": "\\Delta H < 0 \\text{ and } \\Delta S > 0"},
            {"label": "3", "text": "\\Delta H < 0 \\text{ and } \\Delta S < 0"},
            {"label": "4", "text": "\\Delta H < 0 \\text{ and } \\Delta S = 0"}
        ]
    },
    67: { # PDF Q22
        "text": "Natural rubber has :",
        "options": [
            {"label": "1", "text": "All trans-configuration"},
            {"label": "2", "text": "Alternate cis- and trans-configuration"},
            {"label": "3", "text": "Random cis- and trans-configuration"},
            {"label": "4", "text": "All cis-configuration"}
        ]
    },
    68: { # PDF Q23
        "text": "In which of the following options the order of arrangement does not agree with the variation of property indicated against it ?",
        "options": [
            {"label": "1", "text": "\\text{B} < \\text{C} < \\text{N} < \\text{O} \\text{ (increasing first ionisation enthalpy)}"},
            {"label": "2", "text": "\\text{I} < \\text{Br} < \\text{Cl} < \\text{F} \\text{ (increasing electron gain enthalpy)}"},
            {"label": "3", "text": "\\text{Li} < \\text{Na} < \\text{K} < \\text{Rb} \\text{ (increasing metallic radius)}"},
            {"label": "4", "text": "\\text{Al}^{3+} < \\text{Mg}^{2+} < \\text{Na}^{+} < \\text{F}^{-} \\text{ (increasing ionic size)}"}
        ]
    },
    69: { # PDF Q24
        "text": "Which of the following reagents would distinguish cis-cyclopenta-1,2-diol from the trans-isomer ?",
        "options": [
            {"label": "1", "text": "Ozone"},
            {"label": "2", "text": "\\text{MnO}_{2}"},
            {"label": "3", "text": "Aluminium isopropoxide"},
            {"label": "4", "text": "Acetone"}
        ]
    },
    70: { # PDF Q25
        "text": "The product obtained as a result of a reaction of nitrogen with \\text{CaC}_{2} is :",
        "options": [
            {"label": "1", "text": "\\text{CaCN}"},
            {"label": "2", "text": "\\text{CaCN}_{3}"},
            {"label": "3", "text": "\\text{Ca}_{2}\\text{CN}"},
            {"label": "4", "text": "\\text{Ca}(\\text{CN})_{2}"}
        ]
    },
    71: { # PDF Q26
        "text": "Fog is a colloidal solution of :",
        "options": [
            {"label": "1", "text": "Gas in liquid"},
            {"label": "2", "text": "Solid in gas"},
            {"label": "3", "text": "Gas in gas"},
            {"label": "4", "text": "Liquid in gas"}
        ]
    },
    72: { # PDF Q27
        "text": "Which one of the following orders is correct for the bond dissociation enthalpy of halogen molecules ?",
        "options": [
            {"label": "1", "text": "\\text{Cl}_{2} > \\text{Br}_{2} > \\text{F}_{2} > \\text{I}_{2}"},
            {"label": "2", "text": "\\text{Br}_{2} > \\text{I}_{2} > \\text{F}_{2} > \\text{Cl}_{2}"},
            {"label": "3", "text": "\\text{F}_{2} > \\text{Cl}_{2} > \\text{Br}_{2} > \\text{I}_{2}"},
            {"label": "4", "text": "\\text{I}_{2} > \\text{Br}_{2} > \\text{Cl}_{2} > \\text{F}_{2}"}
        ]
    },
    73: { # PDF Q28
        "text": "Equal moles of hydrogen and oxygen gases are placed in a container with a pin-hole through which both can escape. What fraction of the oxygen escapes in the time required for one-half of the hydrogen to escape ?",
        "options": [
            {"label": "1", "text": "1/4"},
            {"label": "2", "text": "3/8"},
            {"label": "3", "text": "1/2"},
            {"label": "4", "text": "1/8"}
        ]
    },
    74: { # PDF Q29
        "text": "Lithium has a bcc structure. Its density is 530 \\text{ kg m}^{-3} and its atomic mass is 6.94 \\text{ g mol}^{-1}. Calculate the edge length of a unit cell of Lithium metal. (N_{\\text{A}} = 6.02 \\times 10^{23} \\text{ mol}^{-1})",
        "options": [
            {"label": "1", "text": "352 pm"},
            {"label": "2", "text": "527 pm"},
            {"label": "3", "text": "264 pm"},
            {"label": "4", "text": "154 pm"}
        ]
    },
    75: { # PDF Q30
        "text": "Which of the following statements about the composition of the vapour over an ideal 1 : 1 molar mixture of benzene and toluene is correct ? Assume that the temperature is constant at 25^\\circ\\text{C}. (Given, Vapour Pressure Data at 25^\\circ\\text{C}, \\text{benzene} = 12.8\\text{ kPa}, \\text{toluene} = 3.85\\text{ kPa})",
        "options": [
            {"label": "1", "text": "The vapour will contain a higher percentage of toluene"},
            {"label": "2", "text": "The vapour will contain equal amounts of benzene and toluene"},
            {"label": "3", "text": "Not enough information is given to make a prediction"},
            {"label": "4", "text": "The vapour will contain a higher percentage of benzene"}
        ]
    },
    76: { # PDF Q31
        "text": "Which of the following has longest \\text{C}-\\text{O} bond length ? (Free \\text{C}-\\text{O} bond length in \\text{CO} is 1.128 \\text{ \\AA})",
        "options": [
            {"label": "1", "text": "[\\text{Co}(\\text{CO})_{4}]^{-}"},
            {"label": "2", "text": "[\\text{Fe}(\\text{CO})_{4}]^{2-}"},
            {"label": "3", "text": "[\\text{Mn}(\\text{CO})_{6}]^{+}"},
            {"label": "4", "text": "\\text{Ni}(\\text{CO})_{4}"}
        ]
    },
    77: { # PDF Q32
        "text": "Among the following the correct order of acidity is :",
        "options": [
            {"label": "1", "text": "\\text{HClO} < \\text{HClO}_{2} < \\text{HClO}_{3} < \\text{HClO}_{4}"},
            {"label": "2", "text": "\\text{HClO}_{4} < \\text{HClO} < \\text{HClO}_{3} < \\text{HClO}_{2}"},
            {"label": "3", "text": "\\text{HClO}_{4} < \\text{HClO}_{2} < \\text{HClO} < \\text{HClO}_{3}"},
            {"label": "4", "text": "\\text{HClO}_{3} < \\text{HClO}_{4} < \\text{HClO}_{2} < \\text{HClO}"}
        ]
    },
    78: { # PDF Q33
        "text": "In the reaction :\n\n\\text{H}-\\text{C}\\equiv\\text{CH} \\xrightarrow[\\text{(2) }\\text{CH}_{3}\\text{CH}_{2}\\text{Br}]{\\text{(1) }\\text{NaNH}_{2}\\text{ / liq. }\\text{NH}_{3}} \\text{X} \\xrightarrow[\\text{(2) }\\text{CH}_{3}\\text{CH}_{2}\\text{Br}]{\\text{(1) }\\text{NaNH}_{2}\\text{ / liq. }\\text{NH}_{3}} \\text{Y}\n\n\\text{X} \\text{ and } \\text{Y} \\text{ are :}",
        "options": [
            {"label": "1", "text": "\\text{X} = \\text{2-Butyne}; \\text{Y} = \\text{3-Hexyne}"},
            {"label": "2", "text": "\\text{X} = \\text{2-Butyne}; \\text{Y} = \\text{2-Hexyne}"},
            {"label": "3", "text": "\\text{X} = \\text{1-Butyne}; \\text{Y} = \\text{2-Hexyne}"},
            {"label": "4", "text": "\\text{X} = \\text{1-Butyne}; \\text{Y} = \\text{3-Hexyne}"}
        ]
    },
    79: { # PDF Q34
        "text": "\\text{MY} \\text{ and } \\text{NY}_{3}, two nearly insoluble salts, have the same K_{\\text{sp}} values of 6.2 \\times 10^{-13} at room temperature. Which statement would be true in regard to \\text{MY} \\text{ and } \\text{NY}_{3} ?",
        "options": [
            {"label": "1", "text": "The molar solubility of \\text{MY} in water is less than that of \\text{NY}_{3}"},
            {"label": "2", "text": "The salts \\text{MY} and \\text{NY}_{3} are more soluble in 0.5 M \\text{KY} than in pure water"},
            {"label": "3", "text": "The addition of the salt of \\text{KY} to solution of \\text{MY} and \\text{NY}_{3} will have no effect on their solubilities"},
            {"label": "4", "text": "The molar solubilities of \\text{MY} and \\text{NY}_{3} in water are identical"}
        ]
    },
    80: { # PDF Q35
        "text": "Consider the nitration of benzene using mixed conc. \\text{H}_{2}\\text{SO}_{4} and \\text{HNO}_{3}. If a large amount of \\text{KHSO}_{4} is added to the mixture, the rate of nitration will be :",
        "options": [
            {"label": "1", "text": "slower"},
            {"label": "2", "text": "unchanged"},
            {"label": "3", "text": "doubled"},
            {"label": "4", "text": "faster"}
        ]
    },
    81: { # PDF Q36
        "text": "The product formed by the reaction of an aldehyde with a primary amine is :",
        "options": [
            {"label": "1", "text": "Ketone"},
            {"label": "2", "text": "Carboxylic acid"},
            {"label": "3", "text": "Aromatic acid"},
            {"label": "4", "text": "Schiff base"}
        ]
    },
    82: { # PDF Q37
        "text": "The pressure of \\text{H}_{2} required to make the potential of \\text{H}_{2}-electrode zero in pure water at 298 K is :",
        "options": [
            {"label": "1", "text": "10^{-12} \\text{ atm}"},
            {"label": "2", "text": "10^{-10} \\text{ atm}"},
            {"label": "3", "text": "10^{-4} \\text{ atm}"},
            {"label": "4", "text": "10^{-14} \\text{ atm}"}
        ]
    },
    83: { # PDF Q38
        "text": "The correct statement regarding RNA and DNA respectively is :",
        "options": [
            {"label": "1", "text": "The sugar component in RNA is ribose and the sugar component in DNA is 2'-deoxyribose"},
            {"label": "2", "text": "The sugar component in RNA is arabinose and the sugar component in DNA is ribose"},
            {"label": "3", "text": "The sugar component in RNA is 2'-deoxyribose and the sugar component in DNA is arabinose"},
            {"label": "4", "text": "The sugar component in RNA is arabinose and the sugar component in DNA is 2'-deoxyribose"}
        ]
    },
    84: { # PDF Q39
        "text": "Which one given below is a non-reducing sugar ?",
        "options": [
            {"label": "1", "text": "Lactose"},
            {"label": "2", "text": "Glucose"},
            {"label": "3", "text": "Sucrose"},
            {"label": "4", "text": "Maltose"}
        ]
    },
    85: { # PDF Q40
        "text": "Which of the following statement about hydrogen is incorrect ?",
        "options": [
            {"label": "1", "text": "Hydrogen never acts as cation in ionic salts"},
            {"label": "2", "text": "Hydronium ion, \\text{H}_{3}\\text{O}^{+} exists freely in solution"},
            {"label": "3", "text": "Dihydrogen does not act as a reducing agent"},
            {"label": "4", "text": "Hydrogen has three isotopes of which tritium is the most common"}
        ]
    },
    86: { # PDF Q41
        "text": "Consider the following liquid-vapour equilibrium :\n\\text{Liquid} \\rightleftharpoons \\text{Vapour}\n\nWhich of the following relations is correct ?",
        "options": [
            {"label": "1", "text": "\\frac{d\\ln P}{dT} = -\\frac{\\Delta H_{v}}{RT}"},
            {"label": "2", "text": "\\frac{d\\ln P}{dT} = -\\frac{\\Delta H_{v}}{T^{2}}"},
            {"label": "3", "text": "\\frac{d\\ln P}{dT} = \\frac{\\Delta H_{v}}{RT^{2}}"},
            {"label": "4", "text": "\\frac{d\\ln G}{dT} = \\frac{\\Delta H_{v}}{RT^{2}}"}
        ]
    },
    87: { # PDF Q42
        "text": "Which of the following biphenyls is optically active ?",
        "options": [
            {"label": "1", "text": ""},
            {"label": "2", "text": ""},
            {"label": "3", "text": ""},
            {"label": "4", "text": ""}
        ]
    },
    88: { # PDF Q43
        "text": "Which of the following statements is false ?",
        "options": [
            {"label": "1", "text": "\\text{Ca}^{2+} \\text{ ions are important in blood clotting}"},
            {"label": "2", "text": "\\text{Ca}^{2+} \\text{ ions are not important in maintaining the regular beating of heart}"},
            {"label": "3", "text": "\\text{Mg}^{2+} \\text{ ions are important in the green parts of plants}"},
            {"label": "4", "text": "\\text{Mg}^{2+} \\text{ ions form a complex with ATP}"}
        ]
    },
    89: { # PDF Q44
        "text": "The ionic radii of \\text{A}^{+} and \\text{B}^{-} ions are 0.98 \\times 10^{-10} \\text{ m} and 1.81 \\times 10^{-10} \\text{ m}. The coordination number of each ion in AB is :",
        "options": [
            {"label": "1", "text": "4"},
            {"label": "2", "text": "8"},
            {"label": "3", "text": "2"},
            {"label": "4", "text": "6"}
        ]
    },
    90: { # PDF Q45
        "text": "The rate of a first order reaction is 0.04 \\text{ mol L}^{-1}\\text{ s}^{-1} at 10 seconds and 0.03 \\text{ mol L}^{-1}\\text{ s}^{-1} at 20 seconds after initiation of the reaction. The half-life period of the reaction is :",
        "options": [
            {"label": "1", "text": "34.1 s"},
            {"label": "2", "text": "44.1 s"},
            {"label": "3", "text": "54.1 s"},
            {"label": "4", "text": "24.1 s"}
        ]
    },

    # =========================================================================
    # BIOLOGY SPECIAL CURATIONS (Tables / Multi-statements)
    # =========================================================================
    127: { # PDF Q82
        "text": "Which type of tissue correctly matches with its locations ?\n\n| | Tissue | Location |\n| :--- | :--- | :--- |\n| (1) | Areolar tissue | Tendons |\n| (2) | Transitional epithelium | Tip of nose |\n| (3) | Cuboidal epithelium | Lining of stomach |\n| (4) | Smooth muscle | Wall of intestine |",
        "options": [
            {"label": "1", "text": "Areolar tissue - Tendons"},
            {"label": "2", "text": "Transitional epithelium - Tip of nose"},
            {"label": "3", "text": "Cuboidal epithelium - Lining of stomach"},
            {"label": "4", "text": "Smooth muscle - Wall of intestine"}
        ]
    },
    133: { # PDF Q88
        "text": "Following are the two statements regarding the origin of life :\n\n(a) The earliest organisms that appeared on the earth were non-green and presumably anaerobes.\n(b) The first autotrophic organisms were the chemoautotrophs that never released oxygen.\n\nOf the above statements which one of the following options is correct ?",
        "options": [
            {"label": "1", "text": "(a) is correct but (b) is false."},
            {"label": "2", "text": "Both (a) and (b) are correct."},
            {"label": "3", "text": "Both (a) and (b) are false."},
            {"label": "4", "text": "(a) is false but (b) is correct."}
        ]
    },
    136: { # PDF Q91
        "text": "Which of the following characteristic features always holds true for the corresponding group of animals?\n\n| | Feature | Group of animals |\n| :--- | :--- | :--- |\n| (1) | Viviparous | Mammalia |\n| (2) | Possess a mouth with an upper and a lower jaw | Chordata |\n| (3) | 3-chambered heart with one incompletely divided ventricle | Reptilia |\n| (4) | Cartilaginous endoskeleton | Chondrichthyes |",
        "options": [
            {"label": "1", "text": "Viviparous - Mammalia"},
            {"label": "2", "text": "Possess a mouth with an upper and a lower jaw - Chordata"},
            {"label": "3", "text": "3-chambered heart with one incompletely divided ventricle - Reptilia"},
            {"label": "4", "text": "Cartilaginous endoskeleton - Chondrichthyes"}
        ]
    },
    139: { # PDF Q94
        "text": "Mitochondria and chloroplast are :\n\n(a) semi-autonomous organelles\n(b) formed by division of pre-existing organelles and they contain DNA but lack protein synthesizing machinery\n\nWhich one of the following options is correct ?",
        "options": [
            {"label": "1", "text": "Both (a) and (b) are correct"},
            {"label": "2", "text": "(b) is true but (a) is false"},
            {"label": "3", "text": "(a) is true but (b) is false"},
            {"label": "4", "text": "Both (a) and (b) are false"}
        ]
    },
    162: { # PDF Q117
        "text": "Which of the following is wrongly matched in the given table?\n\n| | Microbe | Product | Application |\n| :--- | :--- | :--- | :--- |\n| (1) | *Monascus purpureus* | Statins | Lowering of blood cholesterol |\n| (2) | *Streptococcus* | Streptokinase | Removal of clot from blood vessel |\n| (3) | *Clostridium butylicum* | Lipase | Removal of oil stains |\n| (4) | *Trichoderma polysporum* | Cyclosporin A | Immunosuppressive drug |",
        "options": [
            {"label": "1", "text": "Monascus purpureus - Statins - Lowering of blood cholesterol"},
            {"label": "2", "text": "Streptococcus - Streptokinase - Removal of clot from blood vessel"},
            {"label": "3", "text": "Clostridium butylicum - Lipase - Removal of oil stains"},
            {"label": "4", "text": "Trichoderma polysporum - Cyclosporin A - Immunosuppressive drug"}
        ]
    },
    180: { # PDF Q135
        "text": "Pick out the correct statements :\n\n(a) Haemophilia is a sex-linked recessive disease.\n(b) Down's syndrome is due to aneuploidy.\n(c) Phenylketonuria is an autosomal recessive gene disorder.\n(d) Sickle cell anaemia is an X-linked recessive gene disorder.",
        "options": [
            {"label": "1", "text": "(a) and (d) are correct."},
            {"label": "2", "text": "(b) and (d) are correct."},
            {"label": "3", "text": "(a), (b) and (c) are correct."},
            {"label": "4", "text": "(a), (c) and (d) are correct."}
        ]
    }
}

# Extract raw text from PDF
full_text = ""
for pno, page in enumerate(doc):
    txt = page.get_text("text")
    # Clean page header/footer
    cleaned_lines = []
    for l in txt.splitlines():
        if "CAREER POINT" in l or "careerpoint.ac.in" in l or "[ CODE" in l:
            continue
        cleaned_lines.append(l)
    full_text += f"\n<<<PAGE_{pno+1}>>>\n" + "\n".join(cleaned_lines)

# Parse questions blocks
q_blocks = re.split(r'\n\s*Q\.(\d+)\s*\n?', full_text)
pdf_questions_map = {}

for i in range(1, len(q_blocks), 2):
    pdf_qnum = int(q_blocks[i])
    block = q_blocks[i+1]
    
    # Extract Question body (before Students may find / Ans. / Sol.)
    cp_split = re.split(r'\n\s*(?:Students may find|Ans\.?|Sol\.)', block, maxsplit=1)
    q_body = cp_split[0].strip()
    
    # Extract solution
    sol_m = re.search(r'\n\s*Sol\.\s*(.*)', block, re.DOTALL)
    sol_text = sol_m.group(1).strip() if sol_m else ""
    sol_text = re.sub(r'\n\s*Q\.\s*\d+.*', '', sol_text, flags=re.DOTALL).strip()
    
    # Parse options
    opt_spans = []
    for om in re.finditer(r'(?:^|\n|\s)\(([1-4])\)\s*', q_body):
        opt_spans.append((int(om.group(1)), om.start(), om.end()))
        
    stem_text = ""
    options_dict = {}
    
    if len(opt_spans) >= 4:
        stem_text = q_body[:opt_spans[0][1]].strip()
        stem_text = re.sub(r'^Q\.\s*\d+\s*', '', stem_text).strip()
        
        for idx in range(len(opt_spans)):
            onum = opt_spans[idx][0]
            start_pos = opt_spans[idx][2]
            end_pos = opt_spans[idx+1][1] if idx + 1 < len(opt_spans) else len(q_body)
            opt_content = q_body[start_pos:end_pos].strip()
            opt_content = " ".join(opt_content.split())
            options_dict[onum] = opt_content
    else:
        stem_text = re.sub(r'^Q\.\s*\d+\s*', '', q_body).strip()
        for idx in range(1, 5):
            options_dict[idx] = f"Option {idx}"
            
    stem_lines = [l.strip() for l in stem_text.splitlines() if l.strip()]
    stem_clean = " ".join(stem_lines)
    
    pdf_questions_map[pdf_qnum] = {
        "stem": stem_clean,
        "options_dict": options_dict,
        "sol": sol_text
    }

questions = []

for std_qnum in range(1, 181):
    pdf_qnum = standard_to_pdf_qnum(std_qnum)
    sec = get_section(std_qnum)
    
    raw = pdf_questions_map.get(pdf_qnum, {"stem": "", "options_dict": {}, "sol": ""})
    stem_text = raw["stem"]
    options_dict = raw["options_dict"]
    sol_text = raw["sol"]
    
    images = []
    if std_qnum in STEM_IMAGES:
        images.extend(STEM_IMAGES[std_qnum])
        
    if std_qnum in CURATED_QUESTIONS:
        stem_text = CURATED_QUESTIONS[std_qnum]["text"]
        options_list = []
        for opt in CURATED_QUESTIONS[std_qnum]["options"]:
            lbl = int(opt["label"])
            opt_entry = {"label": str(lbl), "text": opt["text"]}
            if std_qnum in OPTION_FIGURES and lbl in OPTION_FIGURES[std_qnum]:
                fig_name = OPTION_FIGURES[std_qnum][lbl]
                opt_entry["figure"] = fig_name
                images.append(fig_name)
            options_list.append(opt_entry)
    else:
        options_list = []
        for i in range(1, 5):
            opt_entry = {"label": str(i), "text": options_dict.get(i, f"Option {i}")}
            if std_qnum in OPTION_FIGURES and i in OPTION_FIGURES[std_qnum]:
                fig_name = OPTION_FIGURES[std_qnum][i]
                opt_entry["figure"] = fig_name
                images.append(fig_name)
            options_list.append(opt_entry)
            
    ans_val = PDF_ANSWERS.get(pdf_qnum, "1")
    # Handle bonuses / multiple answers
    # Std Q70 (PDF Q25): Bonus
    # Std Q85 (PDF Q40): ['3', '4']
    # Std Q149 (PDF Q104): Bonus
    if std_qnum == 70:
        ans_arr = ["1", "2", "3", "4"]
    elif std_qnum == 85:
        ans_arr = ["3", "4"]
    elif std_qnum == 149:
        ans_arr = ["1", "2", "3", "4"]
    else:
        ans_arr = [ans_val]
        
    q_entry = {
        "number": std_qnum,
        "section": sec,
        "type": "mcq",
        "text": stem_text,
        "options": options_list,
        "images": images,
        "answers": ans_arr,
        "solution": sol_text if sol_text else None
    }
    questions.append(q_entry)

questions.sort(key=lambda x: x["number"])

paper_data = {
    "key": "neet-2016",
    "title": "NEET 2016",
    "fullTitle": "National Eligibility cum Entrance Test (UG) 2016 (Phase 1)",
    "examDate": "2016-05-01",
    "session": None,
    "durationMinutes": 180,
    "questionCount": len(questions),
    "examType": "neet",
    "questions": questions
}

with open(os.path.join(OUT_DIR, "questions.json"), "w", encoding="utf-8") as f:
    json.dump(paper_data, f, indent=2, ensure_ascii=False)

print(f"Successfully generated NEET 2016 with 100% curated Chemistry & Physics questions: {len(questions)} questions written to {os.path.join(OUT_DIR, 'questions.json')}")
