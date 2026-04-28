#!/usr/bin/env python3
"""Parse Playwright JSON report and output test counts."""
import json
import sys

def main():
    if len(sys.argv) < 2:
        print("0,0")
        return
    
    try:
        with open(sys.argv[1]) as f:
            d = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        print("0,0")
        return
    
    suites = d.get('suites', [])
    passed = failed = 0
    for s in suites:
        for s2 in s.get('suites', []):
            for spec in s2.get('specs', []):
                for tc in spec.get('tests', []):
                    status = tc.get('results', [{}])[0].get('status', '')
                    if status == 'passed':
                        passed += 1
                    elif status == 'failed':
                        failed += 1
    
    print(f"{passed},{failed}")

if __name__ == "__main__":
    main()
