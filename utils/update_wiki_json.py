#!/usr/bin/env py

import json
from io import StringIO
from os import path

wiki_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'wiki.json')
parts_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'items.json')
bots_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'bots.json')

# Open/parse files
with open(wiki_path) as f:
    wiki = json.load(f)

with open(parts_path) as f:
    parts = json.load(f)

with open (bots_path) as f:
    bots = json.load(f)

# Update bots
for bot in bots:
    bot_name = bot['Name']
    try:
        bot = next(bot for bot in wiki['Bots'] if bot['Name'] == bot_name)

        if not 'Content' in bot:
            bot['Content'] = ''
    except StopIteration:
        bot = {'Name': bot_name, 'Content': ''}
        wiki['Bots'].append(bot)

# Sort bots
wiki['Bots'] = list(sorted(wiki['Bots'], key=lambda bot: bot['Name']))

# Update parts
for part in parts:
    part_name = part['Name']
    try:
        part = next(part for part in wiki['Parts'] if part['Name'] == part_name)

        if not 'Content' in part:
            part['Content'] = ''
    except StopIteration:
        part = {'Name': part_name, 'Content': ''}
        wiki['Parts'].append(part)

# Sort parts
wiki['Parts'] = list(sorted(wiki['Parts'], key=lambda part: part['Name']))

with open(wiki_path, 'w') as f:
    json.dump(wiki, f, indent=2)