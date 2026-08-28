#!/usr/bin/env python3
"""
build_chapter_tests.py

Generates curated chapter-wise question paper JSONs for JEE and NEET under public/chapters/.
Extracts and curates between 15 and 25 questions per chapter test from our 21 full papers.
Leaves all paper-wise papers untouched and isolated.
"""

import os
import sys
import json
import glob
import re
import random

sys.stdout.reconfigure(encoding='utf-8')

# Keyword rules for classifying questions into chapters
JEE_CHAPTER_RULES = [
    # Physics
    {
        "id": "jee-phy-1",
        "title": "Kinematics",
        "subject": "Physics",
        "chapter": "Kinematics",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Easy",
        "keywords": [
            r"velocity", r"acceleration", r"projectile", r"displacement", r"speed",
            r"trajectory", r"motion in a straight line", r"relative velocity", r"position vector",
            r"distance travelled", r"uniform acceleration", r"v\s*=", r"x\(t\)"
        ]
    },
    {
        "id": "jee-phy-2",
        "title": "Laws of Motion",
        "subject": "Physics",
        "chapter": "Laws of Motion",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"friction", r"newton", r"pulley", r"tension", r"normal reaction",
            r"momentum", r"impulse", r"coefficient of friction", r"inclined plane",
            r"spring balance", r"free body", r"pseudo force", r"block of mass"
        ]
    },
    {
        "id": "jee-phy-3",
        "title": "Work, Energy & Power",
        "subject": "Physics",
        "chapter": "Work, Energy & Power",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"work done", r"kinetic energy", r"potential energy", r"power", r"collision",
            r"coefficient of restitution", r"conservative force", r"elastic collision",
            r"vertical circle", r"spring potential"
        ]
    },
    {
        "id": "jee-phy-4",
        "title": "Rotational Motion",
        "subject": "Physics",
        "chapter": "Rotational Motion",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Hard",
        "keywords": [
            r"moment of inertia", r"torque", r"angular momentum", r"rolling",
            r"radius of gyration", r"centre of mass", r"angular velocity", r"angular acceleration",
            r"disc", r"sphere", r"cylinder", r"rod of mass"
        ]
    },
    {
        "id": "jee-phy-5",
        "title": "Thermodynamics",
        "subject": "Physics",
        "chapter": "Thermodynamics",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"isothermal", r"adiabatic", r"isobaric", r"isochoric", r"carnot",
            r"heat engine", r"entropy", r"internal energy", r"molar specific heat",
            r"c_p", r"c_v", r"efficiency of engine", r"first law of thermodynamics", r"p-v diagram"
        ]
    },
    {
        "id": "jee-phy-6",
        "title": "Electrostatics",
        "subject": "Physics",
        "chapter": "Electrostatics",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Hard",
        "keywords": [
            r"coulomb", r"electric field", r"electric potential", r"electric dipole",
            r"gauss", r"flux", r"capacitor", r"capacitance", r"dielectric",
            r"point charge", r"equipotential"
        ]
    },
    {
        "id": "jee-phy-7",
        "title": "Current Electricity",
        "subject": "Physics",
        "chapter": "Current Electricity",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"resistance", r"resistor", r"ohm", r"kirchhoff", r"potentiometer",
            r"wheatstone", r"drift velocity", r"resistivity", r"internal resistance",
            r"galvanometer", r"meter bridge", r"emf"
        ]
    },
    {
        "id": "jee-phy-8",
        "title": "Magnetism & Matter",
        "subject": "Physics",
        "chapter": "Magnetism & Matter",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"magnetic field", r"biot-savart", r"ampere", r"lorentz force",
            r"solenoid", r"magnetic dipole", r"susceptibility", r"permeability",
            r"hysteresis", r"cyclotron", r"magnetic flux"
        ]
    },
    {
        "id": "jee-phy-9",
        "title": "Electromagnetic Induction & AC",
        "subject": "Physics",
        "chapter": "EMI & AC",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Hard",
        "keywords": [
            r"faraday", r"lenz", r"induced emf", r"self-inductance", r"mutual inductance",
            r"alternating current", r"lcr", r"resonance", r"impedance", r"power factor",
            r"transformer", r"inductor"
        ]
    },
    {
        "id": "jee-phy-10",
        "title": "Modern Physics",
        "subject": "Physics",
        "chapter": "Modern Physics",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"photoelectric", r"work function", r"de broglie", r"bohr", r"hydrogen atom",
            r"radioactive", r"half-life", r"binding energy", r"nuclear", r"x-ray",
            r"semiconductor", r"diode", r"logic gate", r"transistor"
        ]
    },

    # Chemistry
    {
        "id": "jee-chem-1",
        "title": "Some Basic Concepts",
        "subject": "Chemistry",
        "chapter": "Some Basic Concepts of Chemistry",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Easy",
        "keywords": [
            r"mole", r"molarity", r"molality", r"stoichiometry", r"empirical formula",
            r"limiting reagent", r"equivalent weight", r"mass percent", r"normality",
            r"ppm", r"atomic mass", r"avogadro"
        ]
    },
    {
        "id": "jee-chem-2",
        "title": "Atomic Structure",
        "subject": "Chemistry",
        "chapter": "Atomic Structure",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"quantum number", r"orbital", r"heisenberg", r"de broglie", r"photoelectric",
            r"electronic configuration", r"bohr radius", r"rydberg", r"lyman", r"balmer",
            r"radial node", r"angular node", r"psi", r"spin"
        ]
    },
    {
        "id": "jee-chem-3",
        "title": "Chemical Bonding",
        "subject": "Chemistry",
        "chapter": "Chemical Bonding & Molecular Structure",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Hard",
        "keywords": [
            r"hybridization", r"vsepr", r"dipole moment", r"molecular orbital",
            r"bond order", r"hydrogen bonding", r"resonance", r"formal charge",
            r"geometry", r"paramagnetic", r"diamagnetic", r"lattice energy"
        ]
    },
    {
        "id": "jee-chem-4",
        "title": "Thermodynamics",
        "subject": "Chemistry",
        "chapter": "Chemical Thermodynamics",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"enthalpy", r"entropy", r"gibbs", r"hess", r"heat of combustion",
            r"heat of formation", r"spontaneity", r"delta\s*h", r"delta\s*g", r"delta\s*s",
            r"first law", r"internal energy"
        ]
    },
    {
        "id": "jee-chem-5",
        "title": "Equilibrium",
        "subject": "Chemistry",
        "chapter": "Equilibrium",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Hard",
        "keywords": [
            r"k_p", r"k_c", r"k_sp", r"equilibrium constant", r"le chatelier",
            r"ph\b", r"buffer", r"solubility product", r"common ion", r"hydrolysis",
            r"acidic strength", r"base", r"dissociation"
        ]
    },
    {
        "id": "jee-chem-6",
        "title": "Hydrocarbons",
        "subject": "Chemistry",
        "chapter": "Hydrocarbons",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Easy",
        "keywords": [
            r"alkane", r"alkene", r"alkyne", r"aromatic", r"benzene", r"markovnikov",
            r"ozonolysis", r"friedel-crafts", r"wurtz", r"electrophilic addition",
            r"halogenation", r"conformation"
        ]
    },
    {
        "id": "jee-chem-7",
        "title": "Coordination Compounds",
        "subject": "Chemistry",
        "chapter": "Coordination Compounds",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Hard",
        "keywords": [
            r"coordination", r"ligand", r"crystal field", r"d-block", r"isomerism",
            r"magnetic moment", r"bohr magneton", r"werner", r"chelating",
            r"spectrochemical", r"t_2g", r"e_g", r"complex ion"
        ]
    },
    {
        "id": "jee-chem-8",
        "title": "Aldehydes, Ketones & Carboxylic Acids",
        "subject": "Chemistry",
        "chapter": "Carbonyl Compounds",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"aldehyde", r"ketone", r"carboxylic", r"carbonyl", r"aldol", r"cannizzaro",
            r"grignard", r"nucleophilic addition", r"clemmensen", r"wolf-kishner",
            r"fehling", r"tollens", r"esterification"
        ]
    },

    # Mathematics
    {
        "id": "jee-math-1",
        "title": "Sets, Relations & Functions",
        "subject": "Mathematics",
        "chapter": "Sets & Relations",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Easy",
        "keywords": [
            r"domain", r"range", r"bijection", r"injective", r"surjective",
            r"reflexive", r"symmetric", r"transitive", r"equivalence",
            r"composite function", r"f\(x\)", r"g\(x\)", r"subset"
        ]
    },
    {
        "id": "jee-math-2",
        "title": "Complex Numbers & Quadratics",
        "subject": "Mathematics",
        "chapter": "Complex Numbers",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"complex number", r"argand", r"modulus", r"argument", r"roots of unity",
            r"quadratic", r"roots of equation", r"discriminant", r"alpha\s*\+\s*beta",
            r"i\s*=\s*\\sqrt{-1}", r"z\s*="
        ]
    },
    {
        "id": "jee-math-3",
        "title": "Matrices & Determinants",
        "subject": "Mathematics",
        "chapter": "Matrices & Determinants",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"matrix", r"matrices", r"determinant", r"adjoint", r"inverse of matrix",
            r"system of equations", r"cramer", r"orthogonal matrix", r"symmetric matrix",
            r"trace", r"eigen"
        ]
    },
    {
        "id": "jee-math-4",
        "title": "Differential Calculus",
        "subject": "Mathematics",
        "chapter": "Differential Calculus",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Hard",
        "keywords": [
            r"limit", r"continuity", r"differentiable", r"derivative", r"dy/dx",
            r"tangent", r"normal", r"maxima", r"minima", r"increasing", r"decreasing",
            r"rolle", r"lagrange"
        ]
    },
    {
        "id": "jee-math-5",
        "title": "Integral Calculus",
        "subject": "Mathematics",
        "chapter": "Integral Calculus",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Hard",
        "keywords": [
            r"integral", r"integration", r"definite integral", r"area bounded",
            r"differential equation", r"integrating factor", r"dx", r"\\int"
        ]
    },
    {
        "id": "jee-math-6",
        "title": "Coordinate Geometry",
        "subject": "Mathematics",
        "chapter": "Coordinate Geometry",
        "exam": "jee",
        "duration": 60,
        "difficulty": "Medium",
        "keywords": [
            r"straight line", r"circle", r"parabola", r"ellipse", r"hyperbola",
            r"eccentricity", r"focus", r"directrix", r"latus rectum", r"tangent to circle"
        ]
    },
    {
        "id": "jee-math-7",
        "title": "Vectors & 3D Geometry",
        "subject": "Mathematics",
        "chapter": "Vectors & 3D",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"vector", r"dot product", r"cross product", r"plane", r"line in 3d",
            r"shortest distance", r"direction cosines", r"direction ratios",
            r"coplanar", r"\\vec{a}"
        ]
    },
    {
        "id": "jee-math-8",
        "title": "Probability & Statistics",
        "subject": "Mathematics",
        "chapter": "Probability",
        "exam": "jee",
        "duration": 50,
        "difficulty": "Medium",
        "keywords": [
            r"probability", r"bayes", r"conditional probability", r"binomial distribution",
            r"variance", r"standard deviation", r"mean", r"median", r"dice", r"cards"
        ]
    }
]

NEET_CHAPTER_RULES = [
    # Physics
    {
        "id": "neet-phy-1",
        "title": "Units & Measurements",
        "subject": "Physics",
        "chapter": "Physical World & Measurement",
        "exam": "neet",
        "duration": 35,
        "difficulty": "Easy",
        "keywords": [
            r"dimension", r"dimensional formula", r"significant figures", r"vernier",
            r"screw gauge", r"percentage error", r"unit of", r"si unit"
        ]
    },
    {
        "id": "neet-phy-2",
        "title": "Kinematics",
        "subject": "Physics",
        "chapter": "Motion in a Straight Line & Plane",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Medium",
        "keywords": [
            r"velocity", r"acceleration", r"projectile", r"displacement", r"speed",
            r"height", r"time of flight", r"range", r"relative velocity", r"retardation"
        ]
    },
    {
        "id": "neet-phy-3",
        "title": "Laws of Motion",
        "subject": "Physics",
        "chapter": "Laws of Motion",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Medium",
        "keywords": [
            r"friction", r"newton", r"force", r"tension", r"pulley", r"momentum",
            r"impulse", r"banking of road", r"centripetal", r"mass m"
        ]
    },
    {
        "id": "neet-phy-4",
        "title": "Work, Energy & Power",
        "subject": "Physics",
        "chapter": "Work, Energy & Power",
        "exam": "neet",
        "duration": 40,
        "difficulty": "Medium",
        "keywords": [
            r"work done", r"kinetic energy", r"potential energy", r"power",
            r"collision", r"spring", r"conservation of energy", r"watt", r"joule"
        ]
    },
    {
        "id": "neet-phy-5",
        "title": "Gravitation",
        "subject": "Physics",
        "chapter": "Gravitation",
        "exam": "neet",
        "duration": 40,
        "difficulty": "Easy",
        "keywords": [
            r"gravitation", r"gravity", r"orbital velocity", r"escape velocity",
            r"satellite", r"kepler", r"gravitational potential", r"acceleration due to gravity",
            r"earth's surface", r"planet"
        ]
    },
    {
        "id": "neet-phy-6",
        "title": "Thermodynamics & Heat Transfer",
        "subject": "Physics",
        "chapter": "Thermal Physics",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Medium",
        "keywords": [
            r"thermal", r"calorimetry", r"heat", r"temperature", r"carnot",
            r"refrigerator", r"conduction", r"radiation", r"stefan", r"newton's law of cooling",
            r"isothermal", r"adiabatic", r"latent heat", r"specific heat"
        ]
    },
    {
        "id": "neet-phy-7",
        "title": "Electrostatics & Potential",
        "subject": "Physics",
        "chapter": "Electrostatics",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Hard",
        "keywords": [
            r"coulomb", r"electric field", r"potential", r"dipole", r"flux",
            r"gauss", r"capacitor", r"capacitance", r"dielectric", r"charge"
        ]
    },
    {
        "id": "neet-phy-8",
        "title": "Current Electricity",
        "subject": "Physics",
        "chapter": "Current Electricity",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Medium",
        "keywords": [
            r"resistance", r"resistor", r"ohm", r"kirchhoff", r"potentiometer",
            r"wheatstone", r"meter bridge", r"internal resistance", r"galvanometer",
            r"drift velocity", r"current", r"emf", r"voltmeter", r"ammeter"
        ]
    },
    {
        "id": "neet-phy-9",
        "title": "Ray Optics & Optical Instruments",
        "subject": "Physics",
        "chapter": "Ray Optics",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Hard",
        "keywords": [
            r"refraction", r"reflection", r"lens", r"mirror", r"prism", r"telescope",
            r"microscope", r"focal length", r"magnification", r"refractive index",
            r"critical angle", r"total internal reflection"
        ]
    },
    {
        "id": "neet-phy-10",
        "title": "Dual Nature & Modern Physics",
        "subject": "Physics",
        "chapter": "Modern Physics",
        "exam": "neet",
        "duration": 35,
        "difficulty": "Easy",
        "keywords": [
            r"photoelectric", r"de-broglie", r"bohr", r"hydrogen", r"radioactive",
            r"half-life", r"binding energy", r"nuclear", r"semiconductor", r"diode",
            r"p-n junction", r"logic gate", r"solar cell", r"zener"
        ]
    },

    # Chemistry
    {
        "id": "neet-chem-1",
        "title": "Basic Concepts of Chemistry",
        "subject": "Chemistry",
        "chapter": "Mole Concept & Stoichiometry",
        "exam": "neet",
        "duration": 35,
        "difficulty": "Easy",
        "keywords": [
            r"mole", r"molarity", r"molality", r"stoichiometry", r"empirical formula",
            r"molecular mass", r"percentage composition", r"limiting reagent",
            r"avogadro", r"standard temperature"
        ]
    },
    {
        "id": "neet-chem-2",
        "title": "Structure of Atom",
        "subject": "Chemistry",
        "chapter": "Atomic Structure",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Medium",
        "keywords": [
            r"quantum number", r"electronic configuration", r"bohr", r"orbital",
            r"heisenberg", r"de broglie", r"spectrum", r"node", r"principal quantum",
            r"spin quantum", r"pauli", r"hund"
        ]
    },
    {
        "id": "neet-chem-3",
        "title": "Chemical Bonding",
        "subject": "Chemistry",
        "chapter": "Chemical Bonding & Molecular Structure",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Hard",
        "keywords": [
            r"hybridization", r"vsepr", r"dipole moment", r"molecular orbital",
            r"bond order", r"hydrogen bond", r"geometry", r"covalent", r"ionic bond",
            r"paramagnetic", r"diamagnetic"
        ]
    },
    {
        "id": "neet-chem-4",
        "title": "Chemical Thermodynamics",
        "subject": "Chemistry",
        "chapter": "Thermodynamics",
        "exam": "neet",
        "duration": 40,
        "difficulty": "Medium",
        "keywords": [
            r"enthalpy", r"entropy", r"gibbs", r"hess", r"heat of formation",
            r"exothermic", r"endothermic", r"spontaneous", r"delta\s*h", r"delta\s*s",
            r"delta\s*g", r"first law"
        ]
    },
    {
        "id": "neet-chem-5",
        "title": "Equilibrium (Physical & Chemical)",
        "subject": "Chemistry",
        "chapter": "Equilibrium",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Medium",
        "keywords": [
            r"equilibrium", r"le chatelier", r"k_p", r"k_c", r"k_sp", r"ph\b",
            r"buffer", r"solubility product", r"common ion", r"hydrolysis",
            r"acid", r"base", r"dissociation constant"
        ]
    },
    {
        "id": "neet-chem-6",
        "title": "Organic Chemistry Basics",
        "subject": "Chemistry",
        "chapter": "GOC & Hydrocarbons",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Medium",
        "keywords": [
            r"iupac", r"isomerism", r"carbocation", r"inductive effect", r"resonance",
            r"electrophile", r"nucleophile", r"alkane", r"alkene", r"alkyne",
            r"markovnikov", r"ozonolysis", r"hyperconjugation"
        ]
    },
    {
        "id": "neet-chem-7",
        "title": "Biomolecules & Polymers",
        "subject": "Chemistry",
        "chapter": "Biomolecules",
        "exam": "neet",
        "duration": 35,
        "difficulty": "Easy",
        "keywords": [
            r"amino acid", r"protein", r"carbohydrate", r"glucose", r"fructose",
            r"nucleic acid", r"dna", r"rna", r"vitamin", r"peptide bond",
            r"denaturation", r"enzyme"
        ]
    },
    {
        "id": "neet-chem-8",
        "title": "Coordination & d-Block Elements",
        "subject": "Chemistry",
        "chapter": "Inorganic Chemistry",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Hard",
        "keywords": [
            r"coordination", r"ligand", r"transition element", r"d-block",
            r"lanthanoid", r"crystal field", r"magnetic moment", r"oxidation state",
            r"complex", r"chelate", r"iupac name"
        ]
    },

    # Biology
    {
        "id": "neet-bio-1",
        "title": "Cell: The Unit of Life & Cell Cycle",
        "subject": "Biology",
        "chapter": "Cell Biology",
        "exam": "neet",
        "duration": 40,
        "difficulty": "Easy",
        "keywords": [
            r"cell wall", r"membrane", r"ribosome", r"mitochondria", r"nucleus",
            r"chloroplast", r"golgi", r"endoplasmic", r"mitosis", r"meiosis",
            r"cell cycle", r"prophase", r"metaphase", r"anaphase", r"telophase", r"chromosome"
        ]
    },
    {
        "id": "neet-bio-2",
        "title": "Diversity in the Living World",
        "subject": "Biology",
        "chapter": "Biological Classification & Plant/Animal Kingdom",
        "exam": "neet",
        "duration": 40,
        "difficulty": "Easy",
        "keywords": [
            r"classification", r"monera", r"protista", r"fungi", r"algae",
            r"bryophyte", r"pteridophyte", r"gymnosperm", r"angiosperm",
            r"arthropoda", r"chordata", r"mollusca", r"annelida", r"coelenterata"
        ]
    },
    {
        "id": "neet-bio-3",
        "title": "Structural Organisation in Plants & Animals",
        "subject": "Biology",
        "chapter": "Morphology & Anatomy",
        "exam": "neet",
        "duration": 35,
        "difficulty": "Medium",
        "keywords": [
            r"xylem", r"phloem", r"cambium", r"tissue", r"epithelial", r"connective tissue",
            r"morphology", r"root", r"stem", r"flower", r"inflorescence", r"cockroach",
            r"frog", r"earthworm", r"anatomy"
        ]
    },
    {
        "id": "neet-bio-4",
        "title": "Plant Physiology",
        "subject": "Biology",
        "chapter": "Photosynthesis & Respiration in Plants",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Hard",
        "keywords": [
            r"photosynthesis", r"c3", r"c4", r"calvin cycle", r"chlorophyll",
            r"glycolysis", r"krebs cycle", r"ets", r"respiration", r"auxin",
            r"gibberellin", r"cytokinin", r"ethylene", r"abscisic", r"photoperiodism"
        ]
    },
    {
        "id": "neet-bio-5",
        "title": "Human Physiology - Digestion & Respiration",
        "subject": "Biology",
        "chapter": "Human Physiology I",
        "exam": "neet",
        "duration": 40,
        "difficulty": "Medium",
        "keywords": [
            r"digestion", r"stomach", r"pancreas", r"liver", r"enzyme", r"pepsin",
            r"trypsin", r"lungs", r"respiratory", r"tidal volume", r"alveoli",
            r"hemoglobin", r"oxygen dissociation", r"diaphragm"
        ]
    },
    {
        "id": "neet-bio-6",
        "title": "Human Physiology - Circulation & Excretion",
        "subject": "Biology",
        "chapter": "Human Physiology II",
        "exam": "neet",
        "duration": 40,
        "difficulty": "Medium",
        "keywords": [
            r"heart", r"cardiac", r"blood", r"ecg", r"artery", r"vein",
            r"nephron", r"kidney", r"glomerulus", r"urine", r"dialysis",
            r"counter current", r"renin", r"angiotensin", r"loop of henle"
        ]
    },
    {
        "id": "neet-bio-7",
        "title": "Principles of Inheritance & Variation",
        "subject": "Biology",
        "chapter": "Genetics I",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Hard",
        "keywords": [
            r"mendel", r"genetics", r"allele", r"dominant", r"recessive",
            r"monohybrid", r"dihybrid", r"linkage", r"pedigree", r"hemophilia",
            r"color blindness", r"down syndrome", r"turner", r"klinefelter", r"sex determination"
        ]
    },
    {
        "id": "neet-bio-8",
        "title": "Molecular Basis of Inheritance",
        "subject": "Biology",
        "chapter": "Genetics II",
        "exam": "neet",
        "duration": 45,
        "difficulty": "Hard",
        "keywords": [
            r"dna", r"rna", r"replication", r"transcription", r"translation",
            r"genetic code", r"codon", r"lac operon", r"mrna", r"trna",
            r"dna polymerase", r"human genome project", r"dna fingerprinting"
        ]
    },
    {
        "id": "neet-bio-9",
        "title": "Biotechnology: Principles & Applications",
        "subject": "Biology",
        "chapter": "Biotechnology",
        "exam": "neet",
        "duration": 35,
        "difficulty": "Medium",
        "keywords": [
            r"biotechnology", r"recombinant", r"restriction enzyme", r"pcr",
            r"plasmid", r"vector", r"gel electrophoresis", r"bt cotton",
            r"insulin", r"gene therapy", r"transgenic", r"bioreactor"
        ]
    },
    {
        "id": "neet-bio-10",
        "title": "Ecology & Environment",
        "subject": "Biology",
        "chapter": "Ecology",
        "exam": "neet",
        "duration": 40,
        "difficulty": "Easy",
        "keywords": [
            r"ecosystem", r"ecology", r"population", r"biodiversity", r"food chain",
            r"trophic level", r"greenhouse", r"ozone", r"pollution", r"conservation",
            r"national park", r"sanctuary", r"biomass"
        ]
    }
]

def load_all_questions():
    jee_qs = []
    neet_qs = []
    
    for f in glob.glob("public/papers/*.json"):
        with open(f, "r", encoding="utf-8") as fp:
            data = json.load(fp)
        
        is_neet = "neet" in f.lower() or data.get("exam_type") == "neet"
        qs = data.get("questions", [])
        paper_key = data.get("key", os.path.basename(f).replace(".json", ""))
        paper_title = data.get("title", paper_key)
        
        for q in qs:
            item = dict(q)
            item["_paper_key"] = paper_key
            item["_paper_title"] = paper_title
            if is_neet:
                neet_qs.append(item)
            else:
                jee_qs.append(item)
                
    return jee_qs, neet_qs

def match_question_score(question, rule):
    # Match subject
    q_sec = question.get("sections", {})
    sec_name = q_sec.get("name") if isinstance(q_sec, dict) else str(q_sec or "")
    
    rule_sub = rule["subject"].lower()
    sec_lower = sec_name.lower()
    
    if rule_sub not in sec_lower and sec_lower not in rule_sub:
        # Biology special case (Botany / Zoology)
        if rule_sub == "biology" and ("botany" in sec_lower or "zoology" in sec_lower or "biology" in sec_lower):
            pass
        else:
            return 0
            
    text = (question.get("text") or "").lower()
    for opt in question.get("question_options") or []:
        text += " " + (opt.get("text") or "").lower()
        
    score = 0
    for kw in rule["keywords"]:
        matches = len(re.findall(kw, text, re.IGNORECASE))
        score += matches
        
    return score

def build_chapter_tests():
    os.makedirs("public/chapters", exist_ok=True)
    if os.path.exists("dist"):
        os.makedirs("dist/chapters", exist_ok=True)
        
    jee_pool, neet_pool = load_all_questions()
    print(f"Loaded {len(jee_pool)} JEE questions and {len(neet_pool)} NEET questions.")
    
    all_rules = JEE_CHAPTER_RULES + NEET_CHAPTER_RULES
    manifest = []
    
    for rule in all_rules:
        pool = jee_pool if rule["exam"] == "jee" else neet_pool
        scored = []
        
        for q in pool:
            s = match_question_score(q, rule)
            if s > 0:
                scored.append((s, q))
                
        # Sort by score descending
        scored.sort(key=lambda x: x[0], reverse=True)
        
        # Select target count between 15 and 25 questions
        target_count = min(25, max(15, len(scored)))
        selected_raw = [q for _, q in scored[:target_count]]
        
        # If pool has fewer than 15 with direct keyword match, grab questions from the same subject to fill up to 15
        if len(selected_raw) < 15:
            same_subj = [
                q for q in pool
                if rule["subject"].lower() in str(q.get("sections") or "").lower()
                and q not in selected_raw
            ]
            needed = 15 - len(selected_raw)
            selected_raw.extend(same_subj[:needed])
            
        # Ensure at most 25 questions
        selected_raw = selected_raw[:25]
        
        # Format questions with clean numbers 1..N
        formatted_questions = []
        for idx, q in enumerate(selected_raw, 1):
            sec_name = q.get("sections", {}).get("name") if isinstance(q.get("sections"), dict) else rule["subject"]
            subsec_name = q.get("subsections", {}).get("name") if isinstance(q.get("subsections"), dict) else "Section A"
            
            opts = []
            for o in q.get("question_options") or []:
                opts.append({
                    "position": o.get("position", 1),
                    "label": o.get("label", "A"),
                    "text": o.get("text", ""),
                    "figure_url": o.get("figure_url")
                })
                
            formatted_questions.append({
                "id": q.get("id", idx),
                "number": idx,
                "type": q.get("type", "mcq"),
                "text": q.get("text", ""),
                "marks": q.get("marks", 4),
                "negative_marks": q.get("negative_marks", -1),
                "position": idx,
                "sections": {"name": sec_name or rule["subject"]},
                "subsections": {"name": subsec_name or "Section A"},
                "question_options": opts,
                "figure_url": q.get("figure_url")
            })
            
        TRIAL_IDS = {
            "jee-phy-1", "jee-phy-2",
            "jee-chem-1", "jee-chem-2",
            "jee-math-1", "jee-math-2",
            "neet-phy-1", "neet-phy-2",
            "neet-chem-1", "neet-chem-2",
            "neet-bio-1", "neet-bio-2",
        }
        is_trial = rule["id"] in TRIAL_IDS

        chapter_data = {
            "key": rule["id"],
            "title": f"{rule['title']} ({'JEE Main' if rule['exam'] == 'jee' else 'NEET'})",
            "full_title": f"{'JEE Main' if rule['exam'] == 'jee' else 'NEET (UG)'} Chapter Test - {rule['title']}",
            "subject": rule["subject"],
            "chapter": rule["chapter"],
            "exam_type": rule["exam"],
            "is_trial": is_trial,
            "duration_minutes": rule["duration"],
            "difficulty": rule["difficulty"],
            "question_count": len(formatted_questions),
            "questions": formatted_questions
        }
        
        out_path = f"public/chapters/{rule['id']}.json"
        with open(out_path, "w", encoding="utf-8") as out_fp:
            json.dump(chapter_data, out_fp, indent=2, ensure_ascii=False)
            
        if os.path.exists("dist/chapters"):
            with open(f"dist/chapters/{rule['id']}.json", "w", encoding="utf-8") as out_fp:
                json.dump(chapter_data, out_fp, indent=2, ensure_ascii=False)
                
        manifest.append({
            "id": rule["id"],
            "title": rule["title"],
            "subject": rule["subject"],
            "chapter": rule["chapter"],
            "exam": rule["exam"],
            "questions": len(formatted_questions),
            "duration": rule["duration"],
            "difficulty": rule["difficulty"]
        })
        
        print(f"✓ [{rule['exam'].upper()}] {rule['id']}: {rule['title']} ({rule['subject']}) -> {len(formatted_questions)} questions written to {out_path}")
        
    print(f"\nSuccessfully generated all {len(manifest)} chapter tests with 15-25 curated questions!")

if __name__ == "__main__":
    build_chapter_tests()
