#!/usr/bin/env python3
"""
Ditto Insurance Scraper
Scrapes insurance providers, plans, and Ditto ratings from joinditto.in/health-insurance/

Usage:
    python scrape_ditto.py                          # Scrape all providers
    python scrape_ditto.py --providers tata-aig hdfc-ergo  # Scrape specific providers
    python scrape_ditto.py --company "HDFC" --min-rating 4.0  # Filter results
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
import time
from datetime import datetime
import argparse
import json
from urllib.parse import urljoin, urlparse
import sys

BASE_URL = "https://joinditto.in/health-insurance/"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# All providers available on Ditto (as per user list)
# Note: Some providers use different URL paths than their display names
KNOWN_PROVIDERS = [
    'acko',
    'aditya-birla',
    'bajaj-allianz',
    'care',
    'digit',
    'hdfc-ergo',
    'icici-lombard',
    'iffco-tokio',
    'manipal-cigna',
    'national-insurance',
    'navi',
    'new-india-assurance',  # New India Assurance uses 'new-india-assurance' in URL
    'max-bupa',  # Niva Bupa uses 'max-bupa' in URL (formerly Max Bupa)
    'oriental-insurance',
    'reliance',  # Reliance uses 'reliance' in URL
    'royal-sundaram',
    'sbi',  # SBI uses 'sbi' in URL
    'star-health',
    'tata-aig',
    'united-india',
    'universal-sompo',
    'edelweiss',  # Zuno (erstwhile Edelweiss) - uses edelweiss in URL
]

class DittoInsuranceScraper:
    def __init__(self, delay=1):
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.data = []
        
    def get_page(self, url, return_status=False):
        """Fetch a page with error handling"""
        try:
            time.sleep(self.delay)
            response = self.session.get(url, timeout=30)
            if return_status:
                return response.text, response.status_code
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            if return_status:
                return None, getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None
            return None
    
    def extract_plan_links(self, html, provider_url):
        """Extract all plan links from a provider page"""
        soup = BeautifulSoup(html, 'html.parser')
        plan_links = []
        provider_name = urlparse(provider_url).path.strip('/').split('/')[-1]
        
        # Pages to exclude (not actual insurance plans)
        exclude_pages = {'reviews', 'review', 'faq', 'faqs', 'about', 'contact', 'terms', 
                        'privacy', 'claims', 'claim', 'renewal', 'compare', 'comparison'}
        
        # Find all links
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href', '')
            # Skip anchor links, javascript, etc.
            if href.startswith('#') or href.startswith('javascript:') or 'mailto:' in href:
                continue
            
            # Match pattern: /health-insurance/{provider}/{plan}/
            pattern = rf'/health-insurance/{re.escape(provider_name)}/([^/#\?]+)/?$'
            match = re.search(pattern, href)
            if match:
                plan = match.group(1).lower()
                # Filter out common non-plan patterns and excluded pages
                if (plan and len(plan) > 2 and plan not in ['', 'health-insurance'] 
                    and plan not in exclude_pages):
                    full_url = urljoin(BASE_URL, href.split('#')[0].split('?')[0])
                    if full_url not in plan_links and '#' not in full_url:
                        plan_links.append(full_url)
        
        return sorted(list(set(plan_links)))
    
    def extract_rating(self, html):
        """Extract the Ditto rating from a plan page"""
        soup = BeautifulSoup(html, 'html.parser')
        page_text = soup.get_text()
        
        # Pattern 1: Look for number directly before "Rated by Ditto" (most common pattern)
        # Example: "4.59Rated by Ditto Insurance" or "3.44Rated by Ditto"
        # Also handle cases like "3603.76Rated" where plan name ends with number
        ditto_rating_patterns = [
            r'(\d+\.\d{1,2})Rated\s+by\s+Ditto',  # Number directly before "Rated by Ditto"
            r'(\d+\.\d{1,2})\s+Rated\s+by\s+Ditto',  # Number with space before
            r'rated\s+by\s+ditto[:\s]+(\d+\.?\d*)',  # "Rated by Ditto: 3.44"
            r'(\d+\.?\d*)\s+rated\s+by\s+ditto',  # "3.44 rated by ditto"
            r'ditto[:\s]+(\d+\.?\d*)',  # "Ditto: 3.44"
            r'(\d+\.?\d*)\s+ditto',  # "3.44 ditto"
        ]
        
        for pattern in ditto_rating_patterns:
            matches = re.findall(pattern, page_text, re.I)
            for match in matches:
                try:
                    rating = float(match)
                    if 0 <= rating <= 5:
                        return rating
                except ValueError:
                    continue
        
        # Pattern 1.5: Handle cases where plan name ends with number and rating follows
        # Example: "Health Shield 3603.76Rated" - extract "3.76" not "3603.76"
        # Look for pattern: [any digits][decimal number between 0-5]Rated by Ditto
        # We need to find a decimal number (like 3.76) that appears right before "Rated by Ditto"
        # even if there's a number before it (like 360)
        complex_pattern = r'(\d+)([1-5]\.\d{1,2})Rated\s+by\s+Ditto'
        matches = re.finditer(complex_pattern, page_text, re.I)
        for match in matches:
            prefix_num = match.group(1)
            rating_str = match.group(2)  # This should be like "3.76"
            try:
                rating = float(rating_str)
                if 0 <= rating <= 5:
                    # Verify it's actually a rating by checking context
                    start = max(0, match.start() - 50)
                    end = min(len(page_text), match.end() + 50)
                    context = page_text[start:end].lower()
                    if 'ditto' in context:
                        return rating
            except ValueError:
                continue
        
        # Also try: any number ending with a decimal rating pattern before "Rated by Ditto"
        # This handles cases like "3603.76" where we want "3.76"
        complex_pattern2 = r'(\d*[1-5]\.\d{1,2})Rated\s+by\s+Ditto'
        matches2 = re.finditer(complex_pattern2, page_text, re.I)
        for match in matches2:
            full_match = match.group(1)
            # Extract the last decimal number (rating) from the match
            # If it's something like "3603.76", extract "3.76"
            decimal_match = re.search(r'([1-5]\.\d{1,2})$', full_match)
            if decimal_match:
                try:
                    rating = float(decimal_match.group(1))
                    if 0 <= rating <= 5:
                        start = max(0, match.start() - 50)
                        end = min(len(page_text), match.end() + 50)
                        context = page_text[start:end].lower()
                        if 'ditto' in context:
                            return rating
                except ValueError:
                    continue
        
        # Pattern 2: Look for rating elements
        rating_elements = soup.find_all(['div', 'span', 'p', 'h1', 'h2', 'h3'], 
                                       class_=re.compile(r'rating|score|ditto', re.I))
        
        for element in rating_elements:
            text = element.get_text()
            matches = re.findall(r'(\d+\.?\d*)', text)
            for match in matches:
                try:
                    rating = float(match)
                    if 0 <= rating <= 5:
                        element_text_lower = text.lower()
                        if 'ditto' in element_text_lower or 'rating' in element_text_lower:
                            return rating
                except ValueError:
                    continue
        
        # Pattern 3: Look for numbers near "ditto" in the page
        number_pattern = r'\b(\d+\.\d{1,2})\b'
        number_matches = re.finditer(number_pattern, page_text)
        
        for match in number_matches:
            try:
                rating = float(match.group(1))
                if 0 <= rating <= 5:
                    start = max(0, match.start() - 100)
                    end = min(len(page_text), match.end() + 100)
                    context = page_text[start:end].lower()
                    if 'ditto' in context or ('rated' in context and 'ditto' in page_text.lower()):
                        return rating
            except ValueError:
                continue
        
        return None
    
    def extract_provider_name(self, url):
        """Extract provider name from URL"""
        path = urlparse(url).path.strip('/')
        parts = path.split('/')
        if len(parts) >= 2 and parts[-2] == 'health-insurance':
            return parts[-1].replace('-', ' ').title()
        return None
    
    def extract_plan_name(self, url):
        """Extract plan name from URL"""
        path = urlparse(url).path.strip('/')
        parts = path.split('/')
        if len(parts) >= 3:
            return parts[-1].replace('-', ' ').title()
        return None
    
    def scrape(self, providers=None):
        """Main scraping function"""
        if providers is None:
            providers = KNOWN_PROVIDERS
        
        print("=" * 70)
        print("Starting Ditto Insurance Scraper...")
        print("=" * 70)
        print(f"Processing {len(providers)} provider(s)")
        sys.stdout.flush()
        
        total_plans = 0
        
        for idx, provider in enumerate(providers, 1):
            provider_url = urljoin(BASE_URL, f"{provider}/")
            # Map URL path to display name (e.g., edelweiss -> Zuno, max-bupa -> Niva Bupa)
            provider_name_map = {
                'edelweiss': 'Zuno',
                'max-bupa': 'Niva Bupa',
                'new-india-assurance': 'New India Assurance',
                'sbi': 'SBI',
                'reliance': 'Reliance',
                'hdfc-ergo': 'HDFC Ergo',
                'tata-aig': 'TATA AIG',
            }
            provider_name = provider_name_map.get(provider, provider.replace('-', ' ').title())
            
            print(f"\n[{idx}/{len(providers)}] Processing provider: {provider_name}")
            print(f"  URL: {provider_url}")
            sys.stdout.flush()
            
            provider_html, status_code = self.get_page(provider_url, return_status=True)
            
            # Special handling for providers with blocked listing pages (like edelweiss)
            # Try to discover plans from a known working plan page
            if not provider_html or status_code == 403 or ('404' in provider_html.lower()[:500] if provider_html else False):
                if provider == 'edelweiss':
                    print(f"  ⚠ Provider listing page blocked, trying to discover plans from known plan page...")
                    # Try to get plans from a known working plan page
                    known_plan_url = urljoin(BASE_URL, f"{provider}/health-insurance-silver/")
                    known_plan_html = self.get_page(known_plan_url)
                    if known_plan_html:
                        # Try to extract other plan links from this page
                        soup = BeautifulSoup(known_plan_html, 'html.parser')
                        # Look for navigation or links to other plans
                        all_links = soup.find_all('a', href=True)
                        discovered_plans = []
                        # Common edelweiss plan patterns
                        common_plans = ['health-insurance-silver', 'health-insurance-gold', 'health-insurance-platinum']
                        for plan_name in common_plans:
                            test_url = urljoin(BASE_URL, f"{provider}/{plan_name}/")
                            test_html = self.get_page(test_url)
                            if test_html and '404' not in test_html.lower()[:500]:
                                discovered_plans.append(test_url)
                        if discovered_plans:
                            plan_links = discovered_plans
                            print(f"  ✓ Discovered {len(plan_links)} plan(s) via fallback method")
                            total_plans += len(plan_links)
                        else:
                            print(f"  ❌ Could not discover plans, skipping...")
                            sys.stdout.flush()
                            continue
                    else:
                        print(f"  ❌ Failed to fetch provider page, skipping...")
                        sys.stdout.flush()
                        continue
                else:
                    if not provider_html:
                        print(f"  ❌ Failed to fetch provider page, skipping...")
                    else:
                        print(f"  ❌ Page not found (404), skipping...")
                    sys.stdout.flush()
                    continue
            else:
                # Check for 404
                if '404' in provider_html.lower()[:500] or 'not found' in provider_html.lower()[:500]:
                    print(f"  ❌ Page not found (404), skipping...")
                    sys.stdout.flush()
                    continue
                
                print(f"  ✓ Provider page fetched")
                plan_links = self.extract_plan_links(provider_html, provider_url)
                print(f"  ✓ Found {len(plan_links)} plan(s)")
                total_plans += len(plan_links)
                sys.stdout.flush()
                
                if not plan_links:
                    print(f"  ⚠ No plan links found")
                    continue
            
            # Process each plan
            for plan_idx, plan_url in enumerate(plan_links, 1):
                plan_name = self.extract_plan_name(plan_url) or urlparse(plan_url).path.split('/')[-1]
                
                # Skip non-plan pages (Reviews, FAQ, etc.)
                plan_name_lower = plan_name.lower()
                exclude_plan_names = {'reviews', 'review', 'faq', 'faqs', 'about', 'contact', 
                                    'terms', 'privacy', 'claims', 'claim', 'renewal', 
                                    'compare', 'comparison'}
                if plan_name_lower in exclude_plan_names:
                    print(f"    [{plan_idx}/{len(plan_links)}] Skipping non-plan page: {plan_name}")
                    sys.stdout.flush()
                    continue
                
                print(f"    [{plan_idx}/{len(plan_links)}] Processing plan: {plan_name}")
                print(f"      URL: {plan_url}")
                sys.stdout.flush()
                
                plan_html = self.get_page(plan_url)
                if not plan_html:
                    print(f"      ❌ Failed to fetch plan page, skipping...")
                    sys.stdout.flush()
                    continue
                
                print(f"      ✓ Plan page fetched")
                rating = self.extract_rating(plan_html)
                if rating:
                    print(f"      ✓ Rating found: {rating}")
                else:
                    print(f"      ⚠ Rating: Not found")
                
                sys.stdout.flush()
                
                self.data.append({
                    'Company': provider_name,
                    'Policy Name': plan_name,
                    'Rating By Ditto': rating,
                    'Plan URL': plan_url,
                    'Last Updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
        
        print("\n" + "=" * 70)
        print(f"✓ Scraping complete!")
        print(f"  - Processed {len(providers)} provider(s)")
        print(f"  - Processed {total_plans} plan(s)")
        print(f"  - Collected {len(self.data)} record(s)")
        print("=" * 70)
        sys.stdout.flush()
    
    def save_to_csv(self, filename='ditto_insurance_data.csv'):
        """Save data to CSV file"""
        if not self.data:
            print("No data to save")
            return None
        
        df = pd.DataFrame(self.data)
        # Sort by Company (alphabetical) and Rating By Ditto (descending)
        # Handle NaN ratings by putting them at the end
        df['Rating_Sort'] = df['Rating By Ditto'].fillna(-1)  # Use -1 for NaN to sort them last
        df = df.sort_values(['Company', 'Rating_Sort'], ascending=[True, False])
        df = df.drop('Rating_Sort', axis=1)  # Remove temporary sort column
        df = df.reset_index(drop=True)
        
        df.to_csv(filename, index=False)
        print(f"Data saved to {filename}")
        return df
    
    def filter_data(self, company=None, min_rating=None, max_rating=None):
        """Filter the scraped data"""
        df = pd.DataFrame(self.data)
        
        if company:
            df = df[df['Company'].str.contains(company, case=False, na=False)]
        
        if min_rating is not None:
            df = df[df['Rating By Ditto'] >= min_rating]
        
        if max_rating is not None:
            df = df[df['Rating By Ditto'] <= max_rating]
        
        return df


def main():
    parser = argparse.ArgumentParser(description='Scrape Ditto Insurance data')
    parser.add_argument('--output', '-o', default='ditto_insurance_data.csv',
                       help='Output CSV filename')
    parser.add_argument('--delay', '-d', type=float, default=1.0,
                       help='Delay between requests in seconds')
    parser.add_argument('--company', '-c', type=str,
                       help='Filter by company name')
    parser.add_argument('--min-rating', type=float,
                       help='Filter by minimum rating')
    parser.add_argument('--max-rating', type=float,
                       help='Filter by maximum rating')
    parser.add_argument('--providers', nargs='+',
                       help='Specific providers to scrape (space-separated)')
    
    args = parser.parse_args()
    
    scraper = DittoInsuranceScraper(delay=args.delay)
    providers = args.providers if args.providers else None
    scraper.scrape(providers=providers)
    
    if scraper.data:
        df = scraper.save_to_csv(args.output)
        
        # Apply filters if provided
        if args.company or args.min_rating is not None or args.max_rating is not None:
            filtered_df = scraper.filter_data(
                company=args.company,
                min_rating=args.min_rating,
                max_rating=args.max_rating
            )
            print(f"\nFiltered results ({len(filtered_df)} records):")
            print(filtered_df.to_string(index=False))
            
            if args.output:
                filtered_df.to_csv(args.output.replace('.csv', '_filtered.csv'), index=False)
                print(f"\nFiltered data saved to {args.output.replace('.csv', '_filtered.csv')}")
        else:
            print(f"\nAll data ({len(df)} records):")
            print(df.to_string(index=False))


if __name__ == '__main__':
    main()

