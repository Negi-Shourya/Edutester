#!/usr/bin/env python3
"""Rebuild the 13 match-list stems of NEET 2022 in the app's renderable
A./B./C./D. format (FormattedQuestionText parses A.-D. rows into a table),
fix extraction damage (missing rows) using the Code-S1 source, and correct
the two answers that disagreed with the NCERT facts + S1 key (Q108, Q190).
"""
import json

JSON_PATH = "neet-out/2022/questions.json"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

by_num = {q["number"]: q for q in data["questions"]}

STEMS = {
    1: (
        "Match List-I with List-II\n"
        "List-I (Electromagnetic waves)\n"
        "List-II (Wavelength)\n"
        "A. AM radio waves  I. 10^{–10} m\n"
        "B. Microwaves  II. 10^{2} m\n"
        "C. Infrared radiations  III. 10^{–2} m\n"
        "D. X-rays  IV. 10^{–4} m\n"
        "Choose the correct answer from the options given below"
    ),
    36: (
        "Match List-I with List-II\n"
        "List-I\n"
        "List-II\n"
        "A. Gravitational constant (G)  I. [L^{2}T^{–2}]\n"
        "B. Gravitational potential energy  II. [M^{–1}L^{3}T^{–2}]\n"
        "C. Gravitational potential  III. [LT^{–2}]\n"
        "D. Gravitational intensity  IV. [ML^{2}T^{–2}]\n"
        "Choose the correct answer from the options given below"
    ),
    55: (
        "Match List-I with List-II.\n"
        "List-I (Drug class)\n"
        "List-II (Drug molecule)\n"
        "A. Antacids  I. Salvarsan\n"
        "B. Antihistamines  II. Morphine\n"
        "C. Analgesics  III. Cimetidine\n"
        "D. Antimicrobials  IV. Seldane\n"
        "Choose the correct answer from the options given below :"
    ),
    56: (
        "Match List-I with List-II.\n"
        "List-I (Hydrides)\n"
        "List-II (Nature)\n"
        "A. MgH_{2}  I. Electron precise\n"
        "B. GeH_{4}  II. Electron deficient\n"
        "C. B_{2}H_{6}  III. Electron rich\n"
        "D. HF  IV. Ionic\n"
        "Choose the correct answer from the options given below"
    ),
    76: (
        "Match List-I with List-II\n"
        "List-I\n"
        "List-II\n"
        "A. Li  I. absorbent for carbon dioxide\n"
        "B. Na  II. electrochemical cells\n"
        "C. KOH  III. coolant in fast breeder reactors\n"
        "D. Cs  IV. photoelectric cell\n"
        "Choose the correct answer from the options given below :"
    ),
    84: (
        "Match List-I with List-II.\n"
        "List-I (Products formed)\n"
        "List-II (Reaction of carbonyl compound with)\n"
        "A. Cyanohydrin  I. NH_{2}OH\n"
        "B. Acetal  II. RNH_{2}\n"
        "C. Schiff's base  III. alcohol\n"
        "D. Oxime  IV. HCN\n"
        "Choose the correct answer from the options given below"
    ),
    96: (
        "Match List-I with List-II.\n"
        "List-I (Ores)\n"
        "List-II (Composition)\n"
        "A. Haematite  I. Fe_{3}O_{4}\n"
        "B. Magnetite  II. ZnCO_{3}\n"
        "C. Calamine  III. Fe_{2}O_{3}\n"
        "D. Kaolinite  IV. [Al_{2}(OH)_{4}Si_{2}O_{5}]\n"
        "Choose the correct answer from the options given below:"
    ),
    108: (
        "Match List-I with List-II\n"
        "List-I\n"
        "List-II\n"
        "A. Manganese  I. Activates the enzyme catalase\n"
        "B. Magnesium  II. Required for pollen germination\n"
        "C. Boron  III. Activates enzymes of respiration\n"
        "D. Iron  IV. Functions in splitting of water during photosynthesis\n"
        "Choose the correct answer from the options given below :"
    ),
    139: (
        "Match the plant with the kind of life cycle it exhibits:\n"
        "List-I\n"
        "List-II\n"
        "A. Spirogyra  I. Dominant diploid sporophyte vascular plant, with highly reduced male or female gametophyte\n"
        "B. Fern  II. Dominant haploid free-living gametophyte\n"
        "C. Funaria  III. Dominant diploid sporophyte alternating with reduced gametophyte called prothallus\n"
        "D. Cycas  IV. Dominant haploid leafy gametophyte alternating with partially dependent multicellular sporophyte\n"
        "Choose the correct answer from the options given below :"
    ),
    140: (
        "Match List-I with List-II.\n"
        "List-I\n"
        "List-II\n"
        "A. Metacentric chromosome  I. Centromere situated close to the end forming one extremely short and one very long arms\n"
        "B. Acrocentric chromosome  II. Centromere at the terminal end\n"
        "C. Submetacentric  III. Centromere in the middle forming two equal arms of chromosomes\n"
        "D. Telocentric chromosome  IV. Centromere slightly away from the middle forming one shorter arm and one longer arm\n"
        "Choose the correct answer from the options given below :"
    ),
    190: (
        "Match List-I with List-II\n"
        "List-I (Biological Molecules)\n"
        "List-II (Biological functions)\n"
        "A. Glycogen  I. Hormone\n"
        "B. Globulin  II. Biocatalyst\n"
        "C. Steroids  III. Antibody\n"
        "D. Thrombin  IV. Storage product\n"
        "Choose the correct answer from the options given below:"
    ),
    197: (
        "Match List-I with List-II\n"
        "List-I\n"
        "List-II\n"
        "A. Bronchioles  I. Dense Regular Connective Tissue\n"
        "B. Goblet Cell  II. Loose Connective Tissue\n"
        "C. Tendons  III. Glandular Tissue\n"
        "D. Adipose Tissue  IV. Ciliated Epithelium\n"
        "Choose the correct answer from the options given below:"
    ),
    198: (
        "Match List-I with List-II with respect to methods of Contraception and their respective actions.\n"
        "List-I\n"
        "List-II\n"
        "A. Diaphragms  I. Inhibit ovulation and Implantation\n"
        "B. Contraceptive Pills  II. Increase phagocytosis of sperm within Uterus\n"
        "C. Intra Uterine Devices  III. Absence of Menstrual cycle and ovulation following parturition\n"
        "D. Lactational Amenorrhea  IV. They cover the cervix blocking the entry of sperms\n"
        "Choose the correct answer from the options given below:"
    ),
}

# Answer fixes (verified: NCERT facts + Code-S1 answer key)
ANSWER_FIXES = {
    108: [3],  # (a)-(iv),(b)-(iii),(c)-(ii),(d)-(i): Mn→water splitting, Mg→respiration enzymes, B→pollen germination, Fe→catalase
    190: [2],  # (a)-(iv),(b)-(iii),(c)-(i),(d)-(ii): Glycogen→storage, Globulin→antibody, Steroids→hormone, Thrombin→biocatalyst
}

for num, new_text in STEMS.items():
    q = by_num[num]
    old = q["text"] or ""
    assert "Match" in old and "List" in old, f"Q{num} does not look like a match question: {old[:80]!r}"
    q["text"] = new_text
    print(f"Q{num}: stem rebuilt ({len(old)} -> {len(new_text)} chars)")

for num, ans in ANSWER_FIXES.items():
    q = by_num[num]
    old = list(q.get("answers") or [])
    q["answers"] = ans
    print(f"Q{num}: answer {old} -> {ans}")

with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=1, ensure_ascii=False)
    f.write("\n")

print("questions.json updated.")
