import json
import os
import sys
import time
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

# Read env
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(__file__), '..', 'env')

env = open(env_path, 'r', encoding='utf-8').read()
url = [l.split('=', 1)[1].strip() for l in env.splitlines() if l.startswith('VITE_SUPABASE_URL=')][0]
key = [l.split('=', 1)[1].strip() for l in env.splitlines() if l.startswith('SUPABASE_SERVICE_ROLE_KEY=')][0]

BUCKET = "question-images"
FOLDER = "neet-2016"
PUB_BASE = f"{url}/storage/v1/object/public/{BUCKET}"
BUST = int(time.time() * 1000)

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def api_request(path, method='GET', data=None, max_retries=3):
    req_url = f"{url}/rest/v1/{path}"
    req_data = json.dumps(data).encode('utf-8') if data is not None else None
    for attempt in range(max_retries):
        req = urllib.request.Request(req_url, data=req_data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                content = resp.read().decode('utf-8')
                return json.loads(content) if content else None
        except urllib.error.HTTPError as e:
            err_content = e.read().decode('utf-8')
            print(f"HTTPError {e.code} on {method} {path}: {err_content}", file=sys.stderr)
            raise
        except (TimeoutError, urllib.error.URLError) as e:
            print(f"Attempt {attempt + 1} timed out for {method} {path}: {e}. Retrying in 2s...")
            time.sleep(2)
            if attempt == max_retries - 1:
                raise

def upload_storage(local_path, target_path, content_type="image/png"):
    storage_url = f"{url}/storage/v1/object/{BUCKET}/{target_path}"
    with open(local_path, "rb") as f:
        file_bytes = f.read()
    
    req_headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': content_type,
        'x-upsert': 'true'
    }
    req = urllib.request.Request(storage_url, data=file_bytes, headers=req_headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status in [200, 201]
    except urllib.error.HTTPError as e:
        print(f"Storage upload error {e.code} for {target_path}: {e.read().decode()}", file=sys.stderr)
        return False

# Load questions JSON
q_file = os.path.join(os.path.dirname(__file__), '..', 'neet-out', '2016', 'questions.json')
paper_data = json.load(open(q_file, 'r', encoding='utf-8'))

paper_key = paper_data["key"]
title = paper_data["title"]
full_title = paper_data["fullTitle"]
exam_date = paper_data["examDate"]
duration_minutes = paper_data["durationMinutes"]
question_count = paper_data["questionCount"]
questions = paper_data["questions"]

print(f"Seeding {paper_key} ({title}) - {len(questions)} questions...")

# Upload images
img_dir = os.path.join(os.path.dirname(__file__), '..', 'neet-out', '2016', 'images')
if os.path.exists(img_dir):
    img_files = os.listdir(img_dir)
    print(f"Uploading {len(img_files)} images to Supabase storage...")
    for f in sorted(img_files):
        fpath = os.path.join(img_dir, f)
        target = f"{FOLDER}/{f}"
        ctype = "image/png" if f.endswith(".png") else "image/jpeg"
        ok = upload_storage(fpath, target, ctype)
        if not ok:
            print(f"Failed to upload {f}")

# Check & delete existing paper
existing = api_request(f"papers?key=eq.{paper_key}&select=id")
if existing:
    for p in existing:
        print(f"Deleting existing paper id={p['id']}...")
        api_request(f"papers?id=eq.{p['id']}", method='DELETE')
    time.sleep(2)

# Insert Paper
paper_row = {
    "key": paper_key,
    "title": title,
    "full_title": full_title,
    "exam_date": exam_date,
    "session": None,
    "year": 2016,
    "duration_minutes": duration_minutes,
    "question_count": question_count,
    "exam_type": "neet",
    "is_trial": False
}
inserted_paper = api_request("papers", method='POST', data=paper_row)
paper_id = inserted_paper[0]["id"]
print(f"Inserted paper: id={paper_id}")

# Insert Sections
section_names = ["Physics", "Chemistry", "Biology"]
sec_rows = [{"paper_id": paper_id, "name": name, "position": idx + 1} for idx, name in enumerate(section_names)]
inserted_secs = api_request("sections", method='POST', data=sec_rows)
sec_map = {s["name"]: s["id"] for s in inserted_secs}
print(f"Inserted sections: {sec_map}")

LABEL_TO_LETTER = {"1": "A", "2": "B", "3": "C", "4": "D"}

def make_figure_urls(images, opt_figs):
    res = []
    for img in images:
        if img not in opt_figs:
            res.append(f"{PUB_BASE}/{FOLDER}/{img}?v={BUST}")
    return res

opt_figs_set = set()
for q in questions:
    for o in q.get("options", []):
        fig = o.get("figure") or o.get("image")
        if fig:
            opt_figs_set.add(fig)

# Insert Questions in batches of 50
q_rows = []
for idx, q in enumerate(questions):
    sec_id = sec_map[q["section"]]
    fig_urls = make_figure_urls(q.get("images", []), opt_figs_set)
    q_rows.append({
        "paper_id": paper_id,
        "section_id": sec_id,
        "subsection_id": None,
        "number": q["number"],
        "type": "mcq",
        "text": q.get("text", ""),
        "marks": 4,
        "negative_marks": -1,
        "position": idx + 1,
        "figure_url": fig_urls
    })

inserted_q_rows = []
for i in range(0, len(q_rows), 50):
    batch = q_rows[i:i+50]
    inserted = api_request("questions", method='POST', data=batch)
    inserted_q_rows.extend(inserted)
    print(f"Inserted {len(inserted_q_rows)}/{len(q_rows)} questions...")

pos_to_qid = {q["position"]: q["id"] for q in inserted_q_rows}

# Insert Options & Keys
option_rows = []
key_rows = []

for idx, q in enumerate(questions):
    qid = pos_to_qid[idx + 1]
    
    for opt in q.get("options", []):
        lbl = str(opt["label"])
        fig = opt.get("figure") or opt.get("image")
        fig_url = f"{PUB_BASE}/{FOLDER}/{fig}?v={BUST}" if fig else None
        option_rows.append({
            "question_id": qid,
            "position": int(lbl),
            "label": LABEL_TO_LETTER.get(lbl, lbl),
            "text": opt.get("text", ""),
            "figure_url": fig_url
        })
        
    ans_list = q.get("answers", [])
    correct_ans = ",".join(LABEL_TO_LETTER.get(str(a), str(a)) for a in ans_list)
    sol = q.get("solution")
    if isinstance(sol, list):
        sol = "\n".join(sol)
    key_rows.append({
        "question_id": qid,
        "correct_answer": correct_ans,
        "solution": sol.strip() if sol and sol.strip() else None
    })

print(f"Inserting {len(option_rows)} options...")
for i in range(0, len(option_rows), 100):
    batch = option_rows[i:i+100]
    api_request("question_options", method='POST', data=batch)
    print(f"Inserted {min(i+100, len(option_rows))}/{len(option_rows)} options...")

print(f"Inserting {len(key_rows)} keys...")
for i in range(0, len(key_rows), 100):
    batch = key_rows[i:i+100]
    api_request("question_keys", method='POST', data=batch)
    print(f"Inserted {min(i+100, len(key_rows))}/{len(key_rows)} keys...")

print("\nSUCCESS! NEET 2016 seeded completely into Supabase database.")
