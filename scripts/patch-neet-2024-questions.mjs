#!/usr/bin/env node
/**
 * Patches the NEET-2024 T3 questions whose stems/options were empty,
 * mangled by the original extraction, or missing sub/superscript
 * formatting (physics Q6, Q7, Q11, Q15, Q16, Q21, Q24, Q29, Q30, Q31, Q33,
 * Q36, Q39, Q42, Q46, Q48, Q49, Q50 and chemistry Q51-Q100).
 *
 * Content curated against the official NTA PDF (booklet T3) and cross-checked
 * with the official answer key. Only `text` on questions and
 * `text` on question_options are updated — answers, figures and images are
 * left untouched.
 *
 * Updates BOTH the seed source (neet-out/2024/questions.json) and the
 * Supabase database (paper key "neet-2024").
 *
 * Run:  node scripts/patch-neet-2024-questions.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  try {
    const line = readFileSync(new URL("../.env", import.meta.url), "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith(`${key}=`));
    return line ? line.slice(line.indexOf("=") + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const url = envFromFile("VITE_SUPABASE_URL") ?? envFromFile("SUPABASE_URL");
const key = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// ── Curated content (verified against official NTA 2024 T3 paper) ──────────
const PATCH = {
  6: {
    text: "A logic circuit provides the output Y as per the following truth table:\n\nA B Y\n0 0 1\n0 1 0\n1 0 1\n1 1 0",
    options: {
      1: "\\bar{B}",
      2: "B",
      3: "A \\cdot B + \\bar{A}",
      4: "A \\cdot \\bar{B} + \\bar{A}",
    },
  },
  7: {
    text: "In a vernier calipers, (N + 1) divisions of vernier scale coincide with N divisions of main scale. If 1 MSD represents 0.1 mm, the vernier constant (in cm) is:",
    options: {
      1: "100 N",
      2: "10 (N + 1)",
      3: "\\frac{1}{10N}",
      4: "\\frac{1}{100(N + 1)}",
    },
  },
  11: {
    text: "The graph which shows the variation of (\\frac{1}{λ^{2}}) and its kinetic energy, E is (where λ is de Broglie wavelength of a free particle):",
    options: { 1: "", 2: "", 3: "", 4: "" },
  },
  15: {
    text: "A light ray enters through a right angled prism at point P with the angle of incidence 30° as shown in figure. It travels through the prism parallel to its base BC and emerges along the face AC. The refractive index of the prism is:",
    options: {
      1: "\\frac{\\sqrt{3}}{4}",
      2: "\\frac{\\sqrt{3}}{2}",
      3: "\\frac{\\sqrt{5}}{4}",
      4: "\\frac{\\sqrt{5}}{2}",
    },
  },
  16: {
    text: "Given below are two statements: one is labelled as Assertion A and the other is labelled as Reason R.\nAssertion A: The potential (V) at any axial point, at 2 m distance (r) from the centre of the dipole of dipole moment vector \\vec{P} of magnitude, 4 \\times 10^{-6} C m, is ±9 \\times 10^{3} V.\n(Take \\frac{1}{4πε₀} = 9 \\times 10^{9} SI units)\nReason R: V = ± \\frac{2P}{4πε₀ r^{2}}, where r is the distance of any axial point, situated at 2 m from the centre of the dipole.\nIn the light of the above statements, choose the correct answer from the options given below:",
  },
  21: {
    text: "X_{82}^{290} \\xrightarrow{\\alpha{}} Y \\xrightarrow{e^{+}} Z \\xrightarrow{\\beta{}^{-}} P \\xrightarrow{e^{-}} Q\nIn the nuclear emission stated above, the mass number and atomic number of the product Q respectively, are:",
  },
  24: {
    text: "The mass of a planet is \\frac{1}{10}th that of the earth and its diameter is half that of the earth. The acceleration due to gravity on that planet is:",
    options: {
      1: "4.9 m s^{-2}",
      2: "3.92 m s^{-2}",
      3: "19.6 m s^{-2}",
      4: "9.8 m s^{-2}",
    },
  },
  29: {
    text: "In a uniform magnetic field of 0.049 T, a magnetic needle performs 20 complete oscillations in 5 seconds as shown. The moment of inertia of the needle is 9.8 \\times 10^{-6} kg m^{2}. If the magnitude of magnetic moment of the needle is x \\times 10^{-5} A m^{2}, then the value of 'x' is;",
    options: {
      1: "50π^{2}",
      2: "1280π^{2}",
      3: "5π^{2}",
      4: "128π^{2}",
    },
  },
  30: {
    text: "Two bodies A and B of same mass undergo completely inelastic one dimensional collision. The body A moves with velocity v_{1} while body B is at rest before collision. The velocity of the system after collision is v_{2}. The ratio v_{1} : v_{2} is;",
    options: {
      1: "4 : 1",
      2: "1 : 4",
      3: "1 : 2",
      4: "2 : 1",
    },
  },
  31: {
    text: "If x = 5 \\sin(\\pi t + \\frac{\\pi}{3}) m represents the motion of a particle executing simple harmonic motion, the amplitude and time period of motion, respectively, are;",
    options: {
      1: "5 cm, 1 s",
      2: "5 m, 1 s",
      3: "5 cm, 2 s",
      4: "5 m, 2 s",
    },
  },
  33: {
    text: "A thin spherical shell is charged by some source. The potential difference between the two points C and P (in V) shown in the figure is;\n(Take \\frac{1}{4πε₀} = 9 \\times 10^{9} SI units)",
    options: {
      1: "0.5 \\times 10^{5}",
      2: "zero",
      3: "3 \\times 10^{5}",
      4: "1 \\times 10^{5}",
    },
  },
  36: {
    text: "The following graph represents the T-V curves of an ideal gas (where T is the temperature and V the volume) at three pressures P_{1}, P_{2} and P_{3} compared with those of Charles's law represented as dotted lines.",
    options: {
      1: "P_{2} > P_{1} > P_{3}",
      2: "P_{1} > P_{2} > P_{3}",
      3: "P_{3} > P_{2} > P_{1}",
      4: "P_{1} > P_{3} > P_{2}",
    },
  },
  39: {
    text: "Choose the correct circuit which can achieve the bridge balance.",
  },
  42: {
    text: "A metallic bar of Young's modulus, 0.5 \\times 10^{11} N m^{-2} and coefficient of linear thermal expansion 10^{-5} °C^{-1}, length 1 m and area of cross-section 10^{-3} m^{2} is heated from 0°C to 100°C without expansion or bending. The compressive force developed in it is:",
    options: {
      1: "100 \\times 10^{3} N",
      2: "2 \\times 10^{3} N",
      3: "52 \\times 10^{3} N",
      4: "50 \\times 10^{3} N",
    },
  },
  46: {
    text: "Two heaters A and B have power rating of 1 kW and 2kW, respectively. Those two are first connected in series and then in parallel to a fixed power source. The ratio of power outputs for these two cases is:",
    options: {
      1: "1 : 2",
      2: "2 : 3",
      3: "1 : 1",
      4: "2 : 9",
    },
  },
  48: {
    text: "If the mass of the bob in a simple pendulum is increased to thrice its original mass and its length is made half its original length, then the new time period of oscillation is \\frac{x}{2} times its original time period. Then the value of x is:",
    options: {
      1: "2\\sqrt{3}",
      2: "4",
      3: "\\sqrt{3}",
      4: "\\sqrt{2}",
    },
  },
  49: {
    text: "The minimum energy required to launch a satellite of mass m from the surface of earth of mass M and radius R in a circular orbit at an altitude of 2R from the surface of the earth is:",
    options: {
      1: "\\frac{GmM}{2R}",
      2: "\\frac{GmM}{3R}",
      3: "\\frac{5GmM}{6R}",
      4: "\\frac{2GmM}{3R}",
    },
  },
  50: {
    text: "A sheet is placed on a horizontal surface in front of a strong magnetic pole. A force is needed to:\nA. hold the sheet there if it is magnetic.\nB. hold the sheet there if it is non-magnetic.\nC. move the sheet away from the pole with uniform velocity if it is conducting.\nD. move the sheet away from the pole with uniform velocity if it is both, non-conducting and non-polar.\n\nChoose the correct statement(s) from the options given below:",
  },
  // ── Chemistry (Q51-Q100): curated against official NTA T3 paper ────────────
  51: {
    text: "Match List I with List II.\nList I (Conversion)\nList II (Number of Faraday required)\nA. 1 mol of H_{2}O to O_{2}  I. 3F\nB. 1 mol of MnO_{4}^{-} to Mn^{2+}  II. 2F\nC. 1.5 mol of Ca from molten CaCl_{2}  III. 1F\nD. 1 mol of FeO to Fe_{2}O_{3}  IV. 5F\nChoose the correct answer from the options given below:",
  },
  52: {
    options: {
      1: "H_{2} + Cl_{2} → 2HCl",
      2: "BaCl_{2} + Na_{2}SO_{4} → BaSO_{4} + 2NaCl",
      3: "Zn + CuSO_{4} → ZnSO_{4} + Cu",
      4: "2KClO_{3} + I_{2} → 2KIO_{3} + Cl_{2}",
    },
  },
  53: {
    options: {
      1: "",
      2: "HF",
      3: "",
      4: "",
    },
  },
  56: {
    text: "Match List I with List II.\nList I (Compound)\nList II (Shape/geometry)\nA. NH_{3}  I. Trigonal Pyramidal\nB. BrF_{5}  II. Square Planar\nC. XeF_{4}  III. Octahedral\nD. SF_{6}  IV. Square Pyramidal\nChoose the correct answer from the options given below:",
  },
  60: {
    text: "A compound with a molecular formula of C_{6}H_{14} has two tertiary carbons. Its IUPAC name is:",
  },
  62: {
    text: "Arrange the following elements in increasing order of electronegativity:\nN, O, F, C, Si\nChoose the correct answer from the options given below:",
    options: {
      1: "O < F < N < C < Si",
      2: "F < O < N < C < Si",
      3: "Si < C < N < O < F",
      4: "Si < C < O < N < F",
    },
  },
  63: {
    text: "Which one of the following alcohols reacts instantaneously with Lucas reagent?",
    options: {
      1: "CH_{3}-CH_{2}-CH(OH)-CH_{3}",
      2: "(CH_{3})_{3}C-OH",
      3: "CH_{3}-CH_{2}-CH_{2}-CH_{2}-OH",
      4: "CH_{3}-CH_{2}-CH(CH_{3})-OH",
    },
  },
  64: {
    text: "Given below are two statements:\nStatement I: Both [Co(NH_{3})_{6}]^{3+} and [CoF_{6}]^{3-} complexes are octahedral but differ in their magnetic behaviour.\nStatement II: [Co(NH_{3})_{6}]^{3+} is diamagnetic whereas [CoF_{6}]^{3-} is paramagnetic.\nIn the light of the above statements, choose the correct answer from the options given below:",
  },
  65: {
    text: "Given below are two statements:\nStatement I : The boiling point of hydrides of Group 16 elements follow the order H_{2}O > H_{2}Te > H_{2}Se > H_{2}S.\nStatement II : On the basis of molecular mass, H_{2}O is expected to have lower boiling point than the other members of the group but due to the presence of extensive H-bonding in H_{2}O, it has higher boiling point.\nIn the light of the above statements, choose the correct answer from the options given below:",
  },
  66: {
    text: "Match List I with List II.\nList I (Quantum Number)\nList II (Information provided)\nA. m_{l}  I. Shape of orbital\nB. m_{s}  II. Size of orbital\nC. l  III. Orientation of orbital\nD. n  IV. Orientation of spin of electron\nChoose the correct answer from the options given below:",
  },
  68: {
    options: {
      1: "(i) BH_{3} (ii) H_{2}O_{2}/OH^{-} (iii) alk. KMnO_{4} (iv) H_{3}O^{+}",
      2: "(i) H_{2}O/H^{+} (ii) PCC",
      3: "(i) H_{2}O/H^{+} (ii) CrO_{3}",
      4: "(i) BH_{3} (ii) H_{2}O_{2}/OH^{-} (iii) PCC",
    },
  },
  69: {
    text: "The reagents with which glucose does not react to give the corresponding tests/products are\nA. Tollen's reagent\nB. Schiff's reagent\nC. HCN\nD. NH_{2}OH\nE. NaHSO_{3}\nChoose the correct options from the given below:",
  },
  70: {
    text: "Match List I with List II.\nList I (Molecule)\nList II (Number and types of bonds between two carbon atoms)\nA. ethane  I. one σ-bond and two π-bonds\nB. ethene  II. two π-bonds\nC. carbon molecule, C_{2}  III. one σ-bond\nD. ethyne  IV. one σ-bond and one π-bond\nChoose the correct answer from the options given below:",
  },
  71: {
    text: "Among Group 16 elements, which one does NOT show -2 oxidation state?",
  },
  72: {
    text: "For the reaction 2A ⇌ B + C, K_{c} = 4 \\times 10^{-3}. At a given time, the composition of reaction mixture is: [A] = [B] = [C] = 2 \\times 10^{-3} M.\nThen, which of the following is correct?",
    options: {
      4: "Reaction has a tendency to go in forward direction.",
    },
  },
  73: {
    text: "Which plot of ln k vs \\frac{1}{T} is consistent with Arrhenius equation?",
  },
  74: {
    text: "In which of the following equilibria, K_{p} and K_{c} are NOT equal?",
    options: {
      1: "CO(g) + H_{2}O(g) ⇌ CO_{2}(g) + H_{2}(g)",
      2: "2BrCl(g) ⇌ Br_{2}(g) + Cl_{2}(g)",
      3: "PCl_{5}(g) ⇌ PCl_{3}(g) + Cl_{2}(g)",
      4: "H_{2}(g) + I_{2}(g) ⇌ 2HI(g)",
    },
  },
  77: {
    text: "The energy of an electron in the ground state (n = 1) for He^{+} ion is -x J, then that for an electron in n = 2 state for Be^{3+} ion in J is:",
    options: {
      1: "-4x",
      2: "\\frac{-4x}{9}",
      3: "-x",
      4: "\\frac{-x}{9}",
    },
  },
  78: {
    text: "In which of the following processes entropy increases?\nA. A liquid evaporates to vapour.\nB. Temperature of a crystalline solid lowered from 130 K to 0 K.\nC. 2NaHCO_{3}(s) → Na_{2}CO_{3}(s) + CO_{2}(g) + H_{2}O(g)\nD. Cl_{2}(g) → 2Cl(g)\nChoose the correct answer from the options given below:",
  },
  80: {
    text: "Match List I with List II.\nList I (Complex)\nList II (Type of isomerism)\nA. [Co(NH_{3})_{5}(NO_{2})]Cl_{2}  I. Solvate Isomerism\nB. [Co(NH_{3})_{5}(SO_{4})]Br  II. Linkage Isomerism\nC. [Co(NH_{3})_{6}][Cr(CN)_{6}]  III. Ionization Isomerism\nD. [Co(H_{2}O)_{6}]Cl_{3}  IV. Coordination Isomerism\nChoose the correct answer from the options given below:",
  },
  82: {
    text: "Arrange the following elements in increasing order of first ionization enthalpy:\nLi, Be, B, C, N\nChoose the correct answer from options given below:",
    options: {
      1: "Li < Be < C < B < N",
      2: "Li < Be < N < B < C",
      3: "Li < Be < B < C < N",
      4: "Li < B < Be < C < N",
    },
  },
  85: {
    text: "The Henry's law constant (K_{H}) values of three gases (A, B, C) in water are 145, 2 \\times 10^{-5} and 35 kbar, respectively. The solubility of these gases in water follow the order:",
    options: {
      1: "A > C > B",
      2: "A > B > C",
      3: "B > A > C",
      4: "B > C > A",
    },
  },
  86: {
    options: {
      1: "AB_{2}C_{2}",
      2: "ABC_{4}",
      3: "A_{2}BC_{2}",
      4: "ABC_{3}",
    },
  },
  87: {
    text: "The products A and B obtained in the following reactions, respectively, are\n3ROH + PCl_{3} → 3RCl + A\nROH + PCl_{5} → RCl + HCl + B",
    options: {
      1: "H_{3}PO_{4} and POCl_{3}",
      2: "H_{3}PO_{3} and POCl_{3}",
      3: "POCl_{3} and H_{3}PO_{3}",
      4: "POCl_{3} and H_{3}PO_{4}",
    },
  },
  88: {
    text: "The plot of osmotic pressure (Π) vs concentration (mol L^{-1}) for a solution gives a straight line with slope 25.73 L bar mol^{-1}. The temperature at which the osmotic pressure measurement is done is:\n(Use R = 0.083 L bar mol^{-1} K^{-1})",
  },
  90: {
    text: "Given below are two statements:\nStatement I: [Co(NH_{3})_{6}]^{3+} is a homoleptic complex whereas [Co(NH_{3})_{4}Cl_{2}]^{+} is a heteroleptic complex.\nStatement II: Complex [Co(NH_{3})_{6}]^{3+} has only one kind of ligands but [Co(NH_{3})_{4}Cl_{2}]^{+} has more than one kind of ligands.\nIn the light of the above statements, choose the correct answer from the options given below:",
  },
  92: {
    options: {
      1: "Dipole moment of NF_{3} is greater than that of NH_{3}.",
      2: "Three canonical forms can be drawn for CO_{3}^{2-} ion.",
      4: "BF_{3} has non-zero dipole moment.",
    },
  },
  93: {
    text: "Given below are certain cations. Using inorganic qualitative analysis, arrange them in increasing group number from 0 to VI.\nA. Al^{3+}\nB. Cu^{2+}\nC. Ba^{2+}\nD. Co^{2+}\nE. Mg^{2+}\nChoose the correct answer from the option given below:",
    options: {
      1: "E, C, D, B, A",
      2: "E, A, B, C, D",
      3: "B, A, D, C, E",
      4: "B, C, A, D, E",
    },
  },
  94: {
    text: "Identify the major product C formed in the following reaction sequence:\nCH_{3}-CH_{2}-CH_{2}-I \\xrightarrow{NaCN} A \\xrightarrow{OH^{-}/NaOH, partial\\ hydrolysis} B \\xrightarrow{Br_{2} (major)} C",
  },
  95: {
    text: "The rate of a reaction quadruples when temperature changes from 27°C to 57°C. Calculate the energy of activation.\nGiven R = 8.314 J K^{-1} mol^{-1}, log 4 = 0.6021",
  },
  96: {
    text: "Consider the following reaction in a sealed vessel at equilibrium with concentrations of N_{2} = 3.0 \\times 10^{-3} M, O_{2} = 4.2 \\times 10^{-3} M and NO = 2.8 \\times 10^{-3} M.\n2NO(g) ⇌ N_{2}(g) + O_{2}(g)\nIf 0.1 mol L^{-1} of NO(g) is taken in a closed vessel, what will be degree of dissociation (α) of NO(g) at equilibrium?",
  },
  97: {
    text: "The work done during reversible isothermal expansion of one mole of hydrogen gas at 25°C from pressure of 20 atmosphere to 10 atmosphere is:\n(Given R = 2.0 cal K^{-1} mol^{-1})",
    options: {
      4: "-413.14 calories",
    },
  },
  98: {
    text: "Mass in grams of copper deposited by passing 9.6487 A current through a voltmeter containing copper sulphate solution for 100 seconds is:\n(Given: Molar mass of Cu : 63 g mol^{-1}, 1F = 96487 C)",
  },
   100: {
     options: {
       1: "Gd^{3+} and Eu^{3+}",
       2: "Pm^{3+} and Sm^{3+}",
       3: "Ce^{4+} and Yb^{2+}",
       4: "Ce^{3+} and Eu^{2+}",
     },
   },
  101: {
    options: {
      4: "A, B, C and D only",
    },
  },
  151: {
    options: {
      4: "A-IV, B-III, C-I, D-II",
    },
  },
  198: {
    text: "Given below are two statements:\nStatement I: Gause's competitive exclusive principle states that two closely related species competing for different resources cannot exist indefinitely.\nStatement II: According to Gause's principle, during competition, the inferior will be eliminated. This may be true if resources are limiting.\nIn the light of the above statements, choose the most approriate answer from the options given below:",
  },
};

// ── 1. Patch the seed JSON ──────────────────────────────────────────────────
const JSON_PATH = new URL("../neet-out/2024/questions.json", import.meta.url);
const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const byNumber = new Map(data.questions.map((q) => [q.number, q]));

for (const [num, patch] of Object.entries(PATCH)) {
  const q = byNumber.get(Number(num));
  if (!q) throw new Error(`Q${num} not found in JSON`);
  if (patch.text !== undefined) q.text = patch.text;
  if (patch.options) {
    for (const [label, text] of Object.entries(patch.options)) {
      const opt = q.options.find((o) => String(o.label) === label);
      if (!opt) throw new Error(`Q${num} option ${label} not found in JSON`);
      opt.text = text;
    }
  }
}
writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + "\n");
console.log("JSON updated: neet-out/2024/questions.json");

// ── 2. Patch the database ───────────────────────────────────────────────────
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: paper, error: paperErr } = await supabase
  .from("papers")
  .select("id")
  .eq("key", "neet-2024")
  .maybeSingle();
if (paperErr || !paper) {
  console.error(`Paper lookup failed: ${paperErr?.message}`);
  process.exit(1);
}

const { data: questions, error: qErr } = await supabase
  .from("questions")
  .select("id, number")
  .eq("paper_id", paper.id)
  .in("number", Object.keys(PATCH).map(Number));
if (qErr) throw new Error(`questions select failed: ${qErr.message}`);
console.log(`Fetched ${questions.length} questions from DB`);

const qIdByNumber = new Map(questions.map((q) => [q.number, q.id]));

for (const [num, patch] of Object.entries(PATCH)) {
  const qid = qIdByNumber.get(Number(num));
  if (!qid) {
    console.error(`  Q${num}: not found in DB, skipping`);
    continue;
  }
  if (patch.text !== undefined) {
    const { error } = await supabase.from("questions").update({ text: patch.text }).eq("id", qid);
    if (error) throw new Error(`Q${num} update failed: ${error.message}`);
  }
  if (patch.options) {
    const { data: opts } = await supabase
      .from("question_options")
      .select("id, position, label")
      .eq("question_id", qid);
    for (const opt of opts ?? []) {
      const pos = Number(opt.position);
      const wanted = patch.options[pos] ?? patch.options[opt.label];
      if (wanted === undefined) continue;
      const { error } = await supabase
        .from("question_options")
        .update({ text: wanted })
        .eq("id", opt.id);
      if (error) throw new Error(`Q${num} option ${opt.label} update failed: ${error.message}`);
    }
  }
  console.log(`  Q${num}: patched`);
}

console.log("\nDone. Verify with: node scripts/_check-2024-problems.mjs");
