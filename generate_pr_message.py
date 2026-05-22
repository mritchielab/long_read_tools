import os
import csv
import json

def read_csv(filename):
    if not os.path.exists(filename):
        return []
    with open(filename, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f))

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not set. Using default message.")
        write_default()
        return

    no_conflicts = read_csv('new_submissions_no_conflicts.csv')
    conflicts = read_csv('new_submissions_conflicts.csv')

    # Minimal representation to save tokens
    def minimize(rows):
        res = []
        for r in rows:
            clean_r = {k: v for k, v in r.items() if v and v != 'FALSE' and v != 'NA' and k in ['Name', 'Tool', 'Platform', 'Platform_auto', 'License', 'License_auto', 'Duplicated', 'Code', 'Github']}
            res.append(clean_r)
        return res

    try:
        from google import genai
        
        try:
            import certifi
            os.environ['SSL_CERT_FILE'] = certifi.where()
        except ImportError:
            pass
            
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
You are a bioinformatics assistant automating a database of long-read sequencing tools.
Here is the result of this week's automated tool search.

Tools with NO CONFLICTS (ready to merge):
{json.dumps(minimize(no_conflicts), indent=2)}

Tools with CONFLICTS (need manual review):
{json.dumps(minimize(conflicts), indent=2)}

Write a concise, informative Pull Request body (markdown format).
It should:
1. Summarize which tools were found and are ready to be added.
2. Clearly explain WHY tools were placed in the CONFLICTS list. For example, explicitly state if there was a missing field, a mismatched language between the paper and GitHub, or if the tool was flagged as a duplicate.
3. Provide quick instructions for the maintainer to review and merge the files.

Do NOT wrap your entire response in markdown code blocks. Just write the raw markdown.
"""
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
        )
        
        text = response.text.strip()
        if text.startswith('```markdown'):
            text = text[11:]
        if text.endswith('```'):
            text = text[:-3]
            
        with open('pr_message.txt', 'w', encoding='utf-8') as f:
            f.write(text.strip())
            
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        write_default()

def write_default():
    with open('pr_message.txt', 'w', encoding='utf-8') as f:
        f.write("This PR contains potential new tools found during the weekly automated search.\\n\\nPlease review the generated files:\\n- `new_submissions_no_conflicts.csv`\\n- `new_submissions_conflicts.csv`\\n\\nMerge these manually into `long_read_tools_master.csv` if they are valid.")

if __name__ == "__main__":
    main()
