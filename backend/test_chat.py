# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

from chatRouter import _match_disease

cases = [
    ('dengue', 'urgent'),
    ('loose motions', 'home'),
    ('bukhar headache', 'home'),
    ('cough breathless', 'phc'),
    ('typhoid', 'phc'),
    ('rash itching', 'phc'),
    ('malaria chills', 'urgent'),
]

all_pass = True
for keyword, expected in cases:
    r = _match_disease(keyword)
    triage = r['triage'] if r else None
    status = 'OK' if triage == expected else 'FAIL'
    if status == 'FAIL':
        all_pass = False
    print(f"{status}: [{keyword}] -> {r['id'] if r else None} ({triage})")

print()
print("All tests passed!" if all_pass else "Some tests FAILED!")
