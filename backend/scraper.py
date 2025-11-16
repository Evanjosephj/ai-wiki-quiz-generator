import requests
from bs4 import BeautifulSoup
import re

def scrape_wikipedia(url):
    try:
        mobile_url = url.replace('en.wikipedia.org/wiki/', 'en.m.wikipedia.org/wiki/')
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
        }
        
        response = requests.get(mobile_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        title = soup.find('h1')
        title_text = title.get_text().strip() if title else "Unknown"
        
        paragraphs = soup.find_all('p')
        
        text_parts = []
        for p in paragraphs:
            text = p.get_text().strip()
            text = re.sub(r'\[\d+\]', '', text)
            if len(text) > 30:
                text_parts.append(text)
        
        clean_text = ' '.join(text_parts)
        
        if len(clean_text) < 200:
            return None, None
        
        print(f"Scraped: {title_text} ({len(clean_text)} chars)")
        return title_text, clean_text
        
    except Exception as e:
        print(f"Scraping error: {e}")
        return None, None