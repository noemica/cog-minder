#!/usr/bin/env py

import csv
import json
import sys
from os import path

wiki_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'wiki.json')
csv_path = path.join(path.dirname(path.realpath(__file__)), 'wiki.csv')

# Open/parse files
with open(wiki_path) as f:
    wiki_json = json.load(f)

csv_entries = set()
with open(csv_path) as f:
    wiki_csv = {}
    for row in csv.DictReader(f):
        wiki_csv[row['Name']] = row
        csv_entries.add(row['Name'])

# Update CSV from JSON
for bot_group in wiki_json['Bots']:
    group_name = bot_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Bot'
        wiki_csv[group_name]['Content'] = bot_group['Content']
        csv_entries.remove(group_name)
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
        wiki_csv[group_name]['Bots'] = ','.join(bot_group['Bots'])
        wiki_csv[group_name]['Content'] = bot_group['Content']
        if 'Spoiler' in bot_group:
            wiki_csv[group_name]['Spoiler'] = bot_group['Spoiler']

        csv_entries.remove(group_name)
    else:
        new_group = {
            'Name': group_name,
            'Page Type': 'Bot Group',
            'Bots': ','.join(bot_group['Bots']),
            'Content': bot_group['Content'],
            'Spoiler': bot_group['Spoiler'] if 'Spoiler' in bot_group else '',
        }
        wiki_csv[group_name] = new_group

for part in wiki_json['Parts']:
    part_name = part['Name']
    if part_name in wiki_csv:
        wiki_csv[part_name]['Page Type'] = 'Part'
        wiki_csv[part_name]['Content'] = part['Content']
        csv_entries.remove(part_name)
    else:
        new_part = {
            'Name': part_name,
            'Page Type': 'Part',
            'Content': part['Content']
        }
        wiki_csv[part_name] = new_part

for part_group in wiki_json['Part Groups']:
    group_name = part_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Part Group'
        wiki_csv[group_name]['Content'] = part_group['Content']
        if 'Spoiler' in part_group:
            wiki_csv[group_name]['Spoiler'] = part_group['Spoiler']

        csv_entries.remove(group_name)
    else:
        if 'Content' not in part_group:
            print('Group {} missing content'.format(group_name))
            sys.exit(1)
        new_group = {
            'Name': group_name,
            'Page Type': 'Part Group',
            'Content': part_group['Content'],
            'Spoiler': part_group['Spoiler'] if 'Spoiler' in part_group else '',
        }
        wiki_csv[group_name] = new_group

for part_group in wiki_json['Part Supergroups']:
    group_name = part_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Part Supergroup'
        wiki_csv[group_name]['Content'] = part_group['Content']
        if 'Spoiler' in part_group:
            wiki_csv[group_name]['Spoiler'] = part_group['Spoiler']

        csv_entries.remove(group_name)
    else:
        if 'Content' not in part_group:
            print('Supergroup {} missing content'.format(group_name))
            sys.exit(1)
        new_group = {
            'Name': group_name,
            'Page Type': 'Part Supergroup',
            'Content': part_group['Content'],
            'Spoiler': part_group['Spoiler'] if 'Spoiler' in part_group else '',
        }
        wiki_csv[group_name] = new_group

for location in wiki_json['Locations']:
    location_name = location['Name']
    if location_name in wiki_csv:
        wiki_csv[location_name]['Page Type'] = 'Location'
        wiki_csv[location_name]['Content'] = location['Content']
        if 'Spoiler' in location:
            wiki_csv[location_name]['Spoiler'] = location['Spoiler']

        csv_entries.remove(location_name)
    else:
        new_location = {
            'Name': location_name,
            'Page Type': 'Location',
            'Content': location['Content'],
            'Spoiler': location['Spoiler'] if 'Spoiler' in location else '',
        }
        wiki_csv[location_name] = new_location

for other in wiki_json['Other']:
    other_name = other['Name']
    if other_name in wiki_csv:
        wiki_csv[other_name]['Page Type'] = 'Other'
        wiki_csv[other_name]['Content'] = other['Content']
        if 'Spoiler' in other:
            wiki_csv[other_name]['Spoiler'] = other['Spoiler']

        csv_entries.remove(other_name)
    else:
        new_other = {
            'Name': other_name,
            'Page Type': 'Other',
            'Content': other['Content'],
            'Spoiler': other['Spoiler'] if 'Spoiler' in other else '',
        }
        wiki_csv[other_name] = new_other

csv.register_dialect('wiki', 'excel', lineterminator='\n')

if len(csv_entries) > 0:
    print('Found Wiki CSV entries not present in JSON')
    print(csv_entries)
    sys.exit(1)

# Write out updated csv
with open(csv_path, 'w', newline='') as f:
    writer = csv.DictWriter(f, ['Name', 'Page Type', 'Content', 'Spoiler', 'Bots'], quoting=csv.QUOTE_ALL, dialect='wiki')

    writer.writeheader()
    sorted_names = sorted(wiki_csv.keys())

    for name in sorted_names:
        wiki_csv[name]['Content'] = wiki_csv[name]['Content']
        writer.writerow(wiki_csv[name])

with open(csv_path, 'r') as f:
    text = f.read()

with open(csv_path, 'w') as f:
    f.write(text.replace('\\""', '""'))