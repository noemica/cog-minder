#!/usr/bin/env py

import argparse
import csv
import json
import sys
from os import path

wiki_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'wiki.json')
csv_path = path.join(path.dirname(path.realpath(__file__)), 'wiki.csv')

# Open/parse files
with open(wiki_path, encoding='utf-8') as f:
    wiki_json = json.load(f)

csv_entries = set()
with open(csv_path, encoding='utf-8') as f:
    wiki_csv = {}
    for row in csv.DictReader(f):
        wiki_csv[row['Name']] = row
        csv_entries.add(row['Name'])

def decode(s):
    new_s = ''

    s_len = len(s)
    for i in range(len(s)):
        c = s[i]

        if c == '\\' and ((i + 1 < s_len and s[i + 1] != '\\') or (i > 0 and s[i - 1] != '\\')):
            new_s += '\\\\'
        else:
            val = ord(c)
            if val > 0x7f:
                if val >= 0x10000:
                    new_s += '\\u{:08x}'.format(val)
                else:
                    new_s += '\\u{:04x}'.format(val)
            else:
                new_s += c

    return new_s


parser = argparse.ArgumentParser('Wiki CSV from JSON')
parser.add_argument(
    '--force', 
    help='Force update the CSV, deleting CSV entries that don\'t exist in the JSON', action='store_true')

args = parser.parse_args()
force = args.force

# Update CSV from JSON
for bot_group in wiki_json['Bots']:
    group_name = bot_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Bot'
        wiki_csv[group_name]['Content'] = decode(bot_group['Content'])
        csv_entries.remove(group_name)
    else:
        new_bot = {
            'Name': group_name,
            'Page Type': 'Bot',
            'Content': decode(bot_group['Content'])
        }
        wiki_csv[group_name] = new_bot

for bot_group in wiki_json['Bot Groups']:
    group_name = bot_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Bot Group'
        wiki_csv[group_name]['Bots'] = ','.join(bot_group['Bots'])
        wiki_csv[group_name]['Content'] = decode(bot_group['Content'])
        if 'Spoiler' in bot_group:
            wiki_csv[group_name]['Spoiler'] = bot_group['Spoiler']

        csv_entries.remove(group_name)
    else:
        new_group = {
            'Name': group_name,
            'Page Type': 'Bot Group',
            'Bots': ','.join(bot_group['Bots']),
            'Content': decode(bot_group['Content']),
            'Spoiler': bot_group['Spoiler'] if 'Spoiler' in bot_group else '',
        }
        wiki_csv[group_name] = new_group

for bot_group in wiki_json['Bot Supergroups']:
    group_name = bot_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Bot Supergroup'
        wiki_csv[group_name]['Content'] = decode(bot_group['Content'])
        if 'Spoiler' in bot_group:
            wiki_csv[group_name]['Spoiler'] = bot_group['Spoiler']
        
        if 'Bots' in bot_group:
            wiki_csv[group_name]['Bots'] = ','.join(bot_group['Bots'])

        if 'Groups' in bot_group:
            wiki_csv[group_name]['Groups'] = ','.join(bot_group['Groups'])

        if 'Supergroups' in bot_group:
            wiki_csv[group_name]['Supergroups'] = ','.join(bot_group['Supergroups'])

        csv_entries.remove(group_name)
    else:
        if 'Content' not in bot_group:
            print('Supergroup {} missing content'.format(group_name))
            sys.exit(1)
        new_group = {
            'Name': group_name,
            'Page Type': 'Bot Supergroup',
            'Bots': ','.join(bot_group['Bots']) if 'Bots' in bot_group else '',
            'Groups': ','.join(bot_group['Groups']) if 'Groups' in bot_group else '',
            'Supergroups': ','.join(bot_group['Supergroups']) if 'Supergroups' in bot_group else '',
            'Content': decode(bot_group['Content']),
            'Spoiler': bot_group['Spoiler'] if 'Spoiler' in bot_group else '',
        }
        wiki_csv[group_name] = new_group

for part in wiki_json['Parts']:
    part_name = part['Name']
    if part_name in wiki_csv:
        wiki_csv[part_name]['Page Type'] = 'Part'
        wiki_csv[part_name]['Content'] = decode(part['Content'])
        csv_entries.remove(part_name)
    else:
        new_part = {
            'Name': part_name,
            'Page Type': 'Part',
            'Content': decode(part['Content'])
        }
        wiki_csv[part_name] = new_part

for part_group in wiki_json['Part Groups']:
    group_name = part_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Part Group'
        wiki_csv[group_name]['Content'] = decode(part_group['Content'])
        if 'Spoiler' in part_group:
            wiki_csv[group_name]['Spoiler'] = part_group['Spoiler']
        
        if 'Parts' in part_group:
            wiki_csv[group_name]['Parts'] = ','.join(part_group['Parts'])

        if 'Part Category' in part_group:
            wiki_csv[group_name]['Part Category'] = part_group['Part Category']

        csv_entries.remove(group_name)
    else:
        if 'Content' not in part_group:
            print('Group {} missing content'.format(group_name))
            sys.exit(1)
        new_group = {
            'Name': group_name,
            'Page Type': 'Part Group',
            'Parts': ','.join(part_group['Parts']) if 'Parts' in part_group else '',
            'Part Category': part_group['Part Category'] if 'Part Category' in part_group else '',
            'Content': decode(part_group['Content']),
            'Spoiler': part_group['Spoiler'] if 'Spoiler' in part_group else '',
        }
        wiki_csv[group_name] = new_group

for part_group in wiki_json['Part Supergroups']:
    group_name = part_group['Name']
    if group_name in wiki_csv:
        wiki_csv[group_name]['Page Type'] = 'Part Supergroup'
        wiki_csv[group_name]['Content'] = decode(part_group['Content'])
        if 'Spoiler' in part_group:
            wiki_csv[group_name]['Spoiler'] = part_group['Spoiler']
        
        if 'Parts' in part_group:
            wiki_csv[group_name]['Parts'] = ','.join(part_group['Parts'])

        if 'Groups' in part_group:
            wiki_csv[group_name]['Groups'] = ','.join(part_group['Groups'])

        if 'Supergroups' in part_group:
            wiki_csv[group_name]['Supergroups'] = ','.join(part_group['Supergroups'])

        csv_entries.remove(group_name)
    else:
        if 'Content' not in part_group:
            print('Supergroup {} missing content'.format(group_name))
            sys.exit(1)
        new_group = {
            'Name': group_name,
            'Page Type': 'Part Supergroup',
            'Parts': ','.join(part_group['Parts']) if 'Parts' in part_group else '',
            'Groups': ','.join(part_group['Groups']) if 'Groups' in part_group else '',
            'Supergroups': ','.join(part_group['Supergroups']) if 'Supergroups' in part_group else '',
            'Content': decode(part_group['Content']),
            'Spoiler': part_group['Spoiler'] if 'Spoiler' in part_group else '',
        }
        wiki_csv[group_name] = new_group

for location in wiki_json['Locations']:
    location_name = location['Name']
    if location_name in wiki_csv:
        wiki_csv[location_name]['Page Type'] = 'Location'
        wiki_csv[location_name]['Content'] = decode(location['Content'])
        if 'Spoiler' in location:
            wiki_csv[location_name]['Spoiler'] = location['Spoiler']

        csv_entries.remove(location_name)
    else:
        new_location = {
            'Name': location_name,
            'Page Type': 'Location',
            'Content': decode(location['Content']),
            'Spoiler': location['Spoiler'] if 'Spoiler' in location else '',
        }
        wiki_csv[location_name] = new_location

for other in wiki_json['Other']:
    other_name = other['Name']
    if other_name in wiki_csv:
        wiki_csv[other_name]['Page Type'] = 'Other'
        wiki_csv[other_name]['Content'] = decode(other['Content'])
        if 'Spoiler' in other:
            wiki_csv[other_name]['Spoiler'] = other['Spoiler']

        if 'Subpages' in other:
            wiki_csv[other_name]['Subpages'] = ','.join(other['Subpages'])

        csv_entries.remove(other_name)
    else:
        new_other = {
            'Name': other_name,
            'Page Type': 'Other',
            'Subpages': ','.join(other['Subpages']) if 'Subpages' in other else '',
            'Content': decode(other['Content']),
            'Spoiler': other['Spoiler'] if 'Spoiler' in other else '',
        }
        wiki_csv[other_name] = new_other

if len(csv_entries) > 0:
    print('Found Wiki CSV entries not present in JSON')
    print(csv_entries)

    if force:
        print('Force updating and deleting entries')
        for entry in csv_entries:
            del wiki_csv[entry]
    else:
        print('Use --force to delete these entries')
        sys.exit(1)

# Write out updated csv
csv.register_dialect('wiki', 'excel', lineterminator='\n')
with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(
        f,
        ['Name', 'Page Type', 'Content', 'Spoiler', 'Bots', 'Part Category',
         'Parts', 'Groups', 'Supergroups', 'Subpages'],
        quoting=csv.QUOTE_ALL, dialect='wiki')

    writer.writeheader()
    sorted_names = sorted(wiki_csv.keys())

    for name in sorted_names:
        wiki_csv[name]['Content'] = wiki_csv[name]['Content']
        writer.writerow(wiki_csv[name])

with open(csv_path, 'r', encoding='utf-8') as f:
    text = f.read()

with open(csv_path, 'w', encoding='utf-8') as f:
    f.write(text.replace('\\""', '""'))