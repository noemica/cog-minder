#!/usr/bin/env py

import csv
import json
from io import StringIO
from os import path

wiki_path = path.join(path.dirname(path.realpath(__file__)),
                      '..', 'src', 'json', 'wiki.json')
csv_path = path.join(path.dirname(path.realpath(__file__)), 'wiki.csv')

# Open/parse files
with open(wiki_path) as f:
    wiki_json = json.load(f)

with open(csv_path) as f:
    wiki_csv = {}
    for row in csv.DictReader(f):
        row['Content'] = row['Content'].replace('\\n', '\n')
        wiki_csv[row['Name']] = row

# Update JSON from CSV
for csv_obj in wiki_csv.values():
    if csv_obj['Page Type'] == 'Bot':
        json_list = wiki_json['Bots']
    elif csv_obj['Page Type'] == 'Bot Group':
        json_list = wiki_json['Bot Groups']
    elif csv_obj['Page Type'] == 'Part':
        json_list = wiki_json['Parts']
    elif csv_obj['Page Type'] == 'Location':
        json_list = wiki_json['Locations']
    elif csv_obj['Page Type'] == 'Part Group':
        json_list = wiki_json['Part Groups']
    elif csv_obj['Page Type'] == 'Other':
        json_list = wiki_json['Other']
    else:
        print('Found csv object without a valid type {}'.format(
            csv_obj['Name']))
        continue

    found = False
    for json_item in json_list:
        if json_item['Name'] == csv_obj['Name']:
            # Found existing item, update content
            json_item['Content'] = csv_obj['Content']
            found = True
            break

    if found:
        continue

    # Failed to find item, add to end
    if csv_obj['Page Type'] != 'Other':
        print('Found new page with type not other {}'.format(csv_obj['Name']))
        continue

    json_list.append({'Name': csv_obj['Name'], 'Content': csv_obj['Content']})

# Sort all lists
lists = [wiki_json['Bots'], wiki_json['Bot Groups'], wiki_json['Parts'],
         wiki_json['Part Groups'], wiki_json['Locations'], wiki_json['Other']]
for l in lists:
    l.sort(key=lambda x: x['Name'])

# Save JSON
with open(wiki_path, 'w') as f:
    json.dump(wiki_json, f, indent=1)
