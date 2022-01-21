#! /usr/bin/env python

import json, sys
a_name = sys.argv[1]
b_name = sys.argv[2]
a_raw = json.load(open(a_name))
b_raw = json.load(open(b_name))
a = {}
b = {}
for name, address in a_raw.items():
    a[name] = address.lower()
for name, address in b_raw.items():
    b[name] = address.lower()
print("\ndiffering entries:")
for name, address in a.items():
    if name in b and b[name] != address:
        print("a[{}] = {} <> b[{}] = {}".format(name, address, name, b[name]))
print()
print("entries present in {} but not in {}:".format(a_name, b_name))
for name in a.keys():
    if name not in b:
        print(name)
print()
print("entries present in {} but not in {}:".format(b_name, a_name))
for name in b.keys():
    if name not in a:
        print(name)
