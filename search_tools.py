import urllib.request
import urllib.parse
import json
import csv
import re
from datetime import datetime, timedelta
import os

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
Read the following paper metadata and extract the tool's details.

Title: {paper['title']}
DOI: {paper['doi']}
Abstract: {paper['abstract']}

Return a JSON object with EXACTLY these keys. 
For text fields, provide a concise summary or leave empty ("") if unknown.
For boolean fields, answer strictly with the string "TRUE" or "FALSE".

Required keys:
- Tool: Name of the tool
- DOI: {paper['doi']}
- Details: A short 1-2 sentence description of what it does
- Source: Any URL for the code (e.g. GitHub) found or inferable
- Programming_Language: e.g. Python, R, C++
- License: Open source license if mentioned
- Underlying_algorithms: Main algorithms used
- Underlying_assumptions: Main assumptions
- Strengths_weaknesses: Strengths and weaknesses
- Overall_performance: Overall performance metrics if any

Boolean keys (answer "TRUE" or "FALSE"):
"""
    for h in headers[10:]:
        prompt += f"- {h}\n"
        
    prompt += "\nRespond ONLY with valid JSON."

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Clean markdown formatting if present
        text = response.text
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
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
