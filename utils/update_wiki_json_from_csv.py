#!/usr/bin/env py

import argparse
import csv
import json
from os import path

wiki_path = path.join(path.dirname(path.realpath(__file__)),
                      '..', 'src', 'json', 'wiki.json')
csv_path = path.join(path.dirname(path.realpath(__file__)), 'wiki.csv')

parser = argparse.ArgumentParser(prog='Wiki JSON from CSV updater')
parser.add_argument('--write-diffs', action='store_true')
args = parser.parse_args()

# Open/parse files
with open(wiki_path) as f:
    wiki_json = json.load(f)

with open(csv_path) as f:
    wiki_csv = {}
    for row in csv.DictReader(f):
        row['Content'] = row['Content'].replace('\\n', '\n')
        wiki_csv[row['Name']] = row

updated_pages = []

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
    elif csv_obj['Page Type'] == 'Part Supergroup':
        json_list = wiki_json['Part Supergroups']
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
            if json_item['Content'] != csv_obj['Content']:
                updated_pages.append(json_item['Name'])
                json_item['Content'] = csv_obj['Content']

            if 'Spoiler' in json_item and json_item['Spoiler'] != csv_obj['Spoiler']:
                updated_pages.append(json_item['Name'])
                json_item['Spoiler'] = csv_obj['Spoiler']

            found = True
            break

    if found:
        continue

    # Failed to find item, add to end
    if csv_obj['Page Type'] != 'Other':
        print('Found new page with type not other {}'.format(csv_obj['Name']))
        continue

    updated_pages.append(csv_obj['Name'])
    json_list.append({'Name': csv_obj['Name'], 'Content': csv_obj['Content']})

# Sort all lists
lists = [wiki_json['Bots'], wiki_json['Bot Groups'], wiki_json['Parts'],
         wiki_json['Part Groups'], wiki_json['Part Supergroups'],
         wiki_json['Locations'], wiki_json['Other']]
for l in lists:
    l.sort(key=lambda x: x['Name'])

# Save JSON
with open(wiki_path, 'w') as f:
    json.dump(wiki_json, f, indent=1)

updated_pages.sort()

if len(updated_pages) > 0:
    print('Updated the following pages:')
    for page in updated_pages:
        print(page)

    if args.write_diffs:
        with open('diffs.txt', 'w') as f:
            f.write('\n'.join(updated_pages))
else:
    print('No changes')