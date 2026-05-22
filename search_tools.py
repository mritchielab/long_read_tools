import urllib.request
import urllib.parse
import json
import csv
import re
from datetime import datetime, timedelta
import os

try:
    import certifi
    os.environ['SSL_CERT_FILE'] = certifi.where()
except ImportError:
    pass

def search_europe_pmc(days_back=7):
    today = datetime.now()
    past = today - timedelta(days=days_back)
    date_str = f"[{past.strftime('%Y-%m-%d')} TO {today.strftime('%Y-%m-%d')}]"
    
    query = '("long read sequencing" OR "nanopore" OR "pacbio") AND ("software" OR "pipeline" OR "tool") AND FIRST_PDATE:' + date_str
    encoded_query = urllib.parse.quote(query)
    url = f"https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={encoded_query}&format=json&resultType=core"
    
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'LongReadToolsBot/1.0')
    
    tools = []
    try:
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            
        for result in data.get('resultList', {}).get('result', []):
            tools.append({
                'title': result.get('title', ''),
                'doi': result.get('doi', ''),
                'abstract': result.get('abstractText', '')
            })
    except Exception as e:
        print("Error fetching from Europe PMC:", e)
        
    return tools

def classify_with_gemini(paper, headers):
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("google-genai package not installed. Skipping Gemini classification.")
        return None

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY environment variable not set. Skipping Gemini classification.")
        return None

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
You are an expert bioinformatician curating a database of long-read sequencing tools.
Your task is to analyze the following scientific paper and find/infer the correct metadata for the tool it describes.

Title: {paper['title']}
DOI: {paper['doi']}
Abstract: {paper['abstract']}

CRITICAL: Since this paper abstract or metadata alone might be missing critical information (such as the repository URL, exact programming languages, or license), you MUST use Google Search to find the tool's official code repository (typically on GitHub, GitLab, etc.), verify the programming languages used in the repository, identify the license of the repository, and determine any other missing metadata.

Please use Google Search to look up the tool name and find its official repository.

Return a JSON object with EXACTLY these keys. 
For text fields, provide a concise summary or leave empty ("") if unknown.
For boolean fields, answer strictly with the string "TRUE" or "FALSE".

Required keys:
- Tool: Name of the tool (properly capitalized)
- DOI: {paper['doi']}
- Details: A short 1-2 sentence description of what the tool does.
- Source: The official source code repository URL (prefer GitHub, GitLab, etc.). Search the web to find and verify this.
- Programming_Language: The primary programming languages used (e.g., Python, C++, R, Rust, Go). Search the repository or paper to be as accurate as possible.
- License: The open-source license of the tool (e.g., MIT, GPL-3.0, Apache-2.0). Search the repository to verify.
- Underlying_algorithms: Main algorithms or methods used by the tool.
- Underlying_assumptions: Main assumptions of the tool.
- Strengths_weaknesses: Key strengths and weaknesses of the tool.
- Overall_performance: Performance metrics if mentioned.

Boolean keys (answer strictly "TRUE" or "FALSE" based on the tool's capabilities and supported technologies/data):
"""
    for h in headers[10:]:
        prompt += f"- {h}\n"
        
    prompt += "\nRespond ONLY with a valid JSON object. Do not include markdown code block syntax (such as ```json) in your response, just the raw JSON."

    try:
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
        
        text = response.text.strip()
        # Robustly clean markdown code block if present
        if text.startswith("```"):
            text = re.sub(r'^```(json)?\s*', '', text)
        if text.endswith("```"):
            text = re.sub(r'\s*```$', '', text)
            
        result = json.loads(text.strip())
        return result
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None

def main():
    papers = search_europe_pmc()
    if not papers:
        print("No new papers found this week.")
        return
        
    print(f"Found {len(papers)} potential new papers.")
    
    csv_file = "new_submissions.csv"
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} does not exist.")
        return
        
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        
    with open(csv_file, 'a', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        
        for p in papers:
            print(f"Analyzing: {p['title']}")
            gemini_data = classify_with_gemini(p, headers)
            
            if gemini_data:
                # Ensure all headers exist in the row
                row = {h: gemini_data.get(h, 'FALSE' if h in headers[10:] else '') for h in headers}
                writer.writerow(row)
            else:
                # Fallback to basic extraction
                row = {h: 'FALSE' if h in headers[10:] else '' for h in headers}
                row['Tool'] = p['title'].split(':')[0].split(' ')[0].strip('.,!?-')
                row['DOI'] = p['doi']
                row['Details'] = p['abstract'][:500]
                writer.writerow(row)
            
    print("Finished updating new_submissions.csv")

if __name__ == "__main__":
    main()
