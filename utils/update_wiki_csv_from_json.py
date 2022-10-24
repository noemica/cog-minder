#!/usr/bin/env py

import csv
import json
from io import StringIO
from os import path

wiki_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'wiki.json')
csv_path = path.join(path.dirname(path.realpath(__file__)), 'wiki.csv')

# Open/parse files
with open(wiki_path) as f:
    wiki_json = json.load(f)

with open(csv_path) as f:
    wiki_csv = {}
    for row in csv.DictReader(f):
        wiki_csv[row['Name']] = row

# Update CSV from JSON
for bot_group in wiki_json['Bots']:
    group_name = bot_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Bot'
        wiki_csv[group_name]['Content'] = bot_group['Content']
    else:
        new_bot = {
            'Name': group_name,
            'Page Type': 'Bot',
            'Content': bot_group['Content']
        }
        wiki_csv[group_name] = new_bot

for bot_group in wiki_json['Bot Groups']:
    group_name = bot_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Bot Group'
        wiki_csv[group_name]['Content'] = bot_group['Content']
    else:
        new_group = {
            'Name': group_name,
            'Page Type': 'Bot Group',
            'Content': bot_group['Content']
        }
        wiki_csv[group_name] = new_group

for part in wiki_json['Parts']:
    part_name = part['Name']
    if part_name in wiki_csv:
        wiki_csv[part_name]['Page Type'] = 'Part'
        wiki_csv[part_name]['Content'] = part['Content']
    else:
        new_part = {
            'Name': part_name,
            'Page Type': 'part',
            'Content': part['Content']
        }
        wiki_csv[part_name] = new_part

for part_group in wiki_json['Part Groups']:
    group_name = part_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Part Group'
        wiki_csv[group_name]['Content'] = part_group['Content']
    else:
        new_group = {
            'Name': group_name,
            'Page Type': 'Part Group',
            'Content': part_group['Content']
        }
        wiki_csv[group_name] = new_group

for location in wiki_json['Locations']:
    location_name = location['Name']
    if location_name in wiki_csv:
        wiki_csv[location_name]['Page Type'] = 'Location'
        wiki_csv[location_name]['Content'] = location['Content']
    else:
        new_location = {
            'Name': location_name,
            'Page Type': 'Location',
            'Content': location['Content']
        }
        wiki_csv[location_name] = new_location

for other in wiki_json['Other']:
    other_name = other['Name']
    if other_name in wiki_csv:
        wiki_csv[other_name]['Page Type'] = 'Other'
        wiki_csv[other_name]['Content'] = other['Content']
    else:
        new_other = {
            'Name': other_name,
            'Page Type': 'Other',
            'Content': other['Content']
        }
        wiki_csv[other_name] = new_other

# Write out updated csv
with open(csv_path, 'w', newline='') as f:
    writer = csv.DictWriter(f, ['Name', 'Page Type', 'Content'])

    writer.writeheader()
    sorted_names = sorted(wiki_csv.keys())

    for name in sorted_names:
        wiki_csv[name]['Content'] = wiki_csv[name]['Content']
        writer.writerow(wiki_csv[name])