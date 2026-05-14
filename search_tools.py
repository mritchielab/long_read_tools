import urllib.request
import urllib.parse
import json
import csv
import re
from datetime import datetime, timedelta
import os

def search_europe_pmc(days_back=7):
    # Search Europe PMC for recent articles mentioning long read sequencing tools
    # Europe PMC indexes biorxiv, medrxiv, and open access papers
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
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        for result in data.get('resultList', {}).get('result', []):
            title = result.get('title', '')
            doi = result.get('doi', '')
            abstract = result.get('abstractText', '')
            
            # Basic extraction for Github links as Source
            source = ""
            github_match = re.search(r'(https?://github\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+)', abstract)
            if github_match:
                source = github_match.group(1)
                
            # Derive a short tool name from the title (usually the first word or before a colon)
            tool_name = title.split(':')[0].split(' ')[0].strip('.,!?-')
            if len(tool_name) > 20:
                tool_name = "UnknownTool"
                
            tools.append({
                'Tool': tool_name,
                'DOI': doi,
                'Details': abstract[:500] + '...' if len(abstract) > 500 else abstract,
                'Source': source
            })
    except Exception as e:
        print("Error fetching from Europe PMC:", e)
        
    return tools

def main():
    tools = search_europe_pmc()
    if not tools:
        print("No new tools found this week.")
        return
        
    print(f"Found {len(tools)} potential new tools.")
    
    # Read existing headers from new_submissions.csv
    csv_file = "new_submissions.csv"
    
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} does not exist. Cannot append.")
        return
        
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        
    # Append to new_submissions.csv
    with open(csv_file, 'a', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        for t in tools:
            row = {h: '' for h in headers}
            # Fill the known fields
            row['Tool'] = t.get('Tool', '')
            row['DOI'] = t.get('DOI', '')
            row['Details'] = t.get('Details', '')
            row['Source'] = t.get('Source', '')
            # For booleans, set FALSE by default
            for h in headers[10:]:
                row[h] = 'FALSE'
            writer.writerow(row)
            
    print("Appended new potential tools to new_submissions.csv")

if __name__ == "__main__":
    main()
