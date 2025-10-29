#!/usr/bin/env py

import argparse
import csv
import json
from os import path
import re

wiki_path = path.join(path.dirname(path.realpath(__file__)),
                      '..', 'src', 'json', 'wiki.json')
csv_path = path.join(path.dirname(path.realpath(__file__)), 'wiki.csv')

parser = argparse.ArgumentParser(prog='Wiki JSON from CSV updater')
parser.add_argument('--write-diffs', action='store_true')
args = parser.parse_args()

# Open/parse files
with open(wiki_path, encoding='utf-8') as f:
    wiki_json = json.load(f)

with open(csv_path, encoding='utf-8-sig') as f:
    wiki_csv = {}
    for row in csv.DictReader(f):
        row['Content'] = row['Content'].replace('\\n', '\n')
        wiki_csv[row['Name']] = row

updated_pages = []

def unescape(s):
    return re.sub(r'\\\\u([0-9a-f]{4})', r'\\u\1', s)
    
def update_json_value(json_item, csv_obj, key_name):
    if csv_obj[key_name] == '':
        if key_name in json_item:
            del json_item[key_name]
            return True
        
        return False
    
    val = unescape(csv_obj[key_name])
    
    if key_name in json_item:
        if val != json_item[key_name]:
            json_item[key_name] = val
            return True
        
        return False
    else:
        json_item[key_name] = unescape(val)
        return True

def update_json_list_value(json_item, csv_obj, key_name):
    if csv_obj[key_name] == '':
        if key_name in json_item:
            del json_item[key_name]
            return True
        
        return False
    
    val = unescape(csv_obj[key_name])
    
    if key_name in json_item:
        if val != ','.join(json_item[key_name]):
            json_item[key_name] = val.split(',')
            return True
        
        return False
    else:
        json_item[key_name] = val
        return True

# Update JSON from CSV
for csv_obj in wiki_csv.values():
    if csv_obj['Page Type'] == 'Bot':
        json_list = wiki_json['Bots']
    elif csv_obj['Page Type'] == 'Bot Group':
        json_list = wiki_json['Bot Groups']
    elif csv_obj['Page Type'] == 'Bot Supergroup':
        json_list = wiki_json['Bot Supergroups']
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
            # Found existing item, update values
            updated = False
            content = unescape(csv_obj['Content'])
            if json_item['Content'] != content:
                updated = True
                json_item['Content'] = content

            updated |= update_json_value(json_item, csv_obj, 'Spoiler')

            if csv_obj['Page Type'] == 'Bot Group':
                updated |= update_json_list_value(json_item, csv_obj, 'Bots')

            if csv_obj['Page Type'] == 'Bot Supergroup':
                updated |= update_json_list_value(json_item, csv_obj, 'Bots')
                updated |= update_json_list_value(json_item, csv_obj, 'Groups')
                updated |= update_json_list_value(json_item, csv_obj, 'Supergroups')

            if csv_obj['Page Type'] == 'Part Group':
                updated |= update_json_list_value(json_item, csv_obj, 'Parts')
                updated |= update_json_value(json_item, csv_obj, 'Part Category')

            if csv_obj['Page Type'] == 'Part Supergroup':
                updated |= update_json_list_value(json_item, csv_obj, 'Parts')
                updated |= update_json_list_value(json_item, csv_obj, 'Groups')
                updated |= update_json_list_value(json_item, csv_obj, 'Supergroups')

            if csv_obj['Page Type'] == 'Other':
                updated |= update_json_list_value(json_item, csv_obj, 'Subpages')

            if updated:
                updated_pages.append(json_item['Name'])

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
lists = [wiki_json['Bots'], wiki_json['Bot Groups'], wiki_json['Bot Supergroups'],
         wiki_json['Parts'], wiki_json['Part Groups'], wiki_json['Part Supergroups'], 
         wiki_json['Locations'], wiki_json['Other']]
for l in lists:
    l.sort(key=lambda x: x['Name'])

# Save JSON
json_str = unescape(json.dumps(wiki_json, ensure_ascii=False, indent=1))
with open(wiki_path, 'w', encoding='utf-8') as f:
    f.write(json_str)
    # json.dump(wiki_json, f, ensure_ascii=False, indent=1)

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