#!/usr/bin/env python3

import csv
import json
from io import StringIO

categories = {
    'all': [
        'Slot',
        'Hackable Schematic',
    ],
    'power_overview': [
        'Name',
        'Type',
        'Rating',
        'Category',
        'Size',
        'Mass',
        'Integrity',
        'Coverage',
        'Heat Generation'
    ],
    'propulsion_overview': [
        'Name',
        'Type',
        'Rating',
        'Category',
        'Size',
        'Integrity',
        'Coverage',
        'Effect',
        'Description',
    ],
    'utility_overview': [
        'Name',
        'Type',
        'Rating',
        'Category',
        'Size',
        'Mass',
        'Integrity',
        'Coverage',
        'Special Trait',
        'Effect',
        'Description',
    ],
    'weapon_overview': [
        'Name',
        'Type',
        'Rating',
        'Category',
        'Size',
        'Mass',
        'Integrity',
        'Coverage',
        'Special Trait',
        'Effect',
        'Description',
    ],
    'other_overview': [
        'Name',
        'Type',
        'Rating',
        'Category',
        'Size',
        'Integrity',
        'Life',
        'Description',
    ],
    'power': [
        'Energy Generation',
        'Energy Storage',
        'Power Stability'
    ],
    'propulsion_upkeep': [
        'Energy Upkeep',
        'Heat Generation'
    ],
    'utility_upkeep': [
        'Energy Upkeep',
        'Matter Upkeep',
        'Heat Generation'
    ],
    'propulsion': [
        'Time/Move',
        'Mod/Extra',
        'Drag',
        'Energy/Move',
        'Heat/Move',
        'Support',
        'Penalty',
        'Burnout',
        'Siege',
    ],
    'shot': [
        'Range',
        'Shot Energy',
        'Shot Matter',
        'Shot Heat',
        'Recoil',
        'Targeting',
        'Delay',
        'Overload Stability',
        'Waypoints',
    ],
    'projectile': [
        'Projectile Count',
        'Damage',
        'Damage Type',
        'Critical',
        'Penetration',
        'Heat Transfer',
        'Spectrum',
        'Disruption',
        'Salvage',
    ],
    'explosion': [
        'Projectile Count',
        'Explosion Radius',
        'Explosion Damage',
        'Falloff',
        'Explosion Type',
        'Explosion Heat Transfer',
        'Explosion Spectrum',
        'Explosion Disruption',
        'Explosion Salvage'
    ],
    'fabrication': [
        'Fabrication Number',
        'Fabrication Time',
        'Fabrication Matter',
    ],
}


def flatten(lists):
    return [y for x in lists for y in x]


slot_categories = {
    'N/A': flatten([
        categories['all'],
        categories['other_overview'],
    ]),
    'Power': flatten([
        categories['all'],
        categories['power_overview'],
        categories['power'],
        categories['fabrication']]
    ),
    'Propulsion': flatten([
        categories['all'],
        categories['propulsion_overview'],
        categories['propulsion_upkeep'],
        categories['propulsion'],
        categories['fabrication']]
    ),
    'Utility': flatten([
        categories['all'],
        categories['utility_overview'],
        categories['utility_upkeep'],
        categories['fabrication']]
    ),
    'Weapon': flatten([
        categories['all'],
        categories['weapon_overview'],
        categories['shot'],
        categories['projectile'],
        categories['explosion'],
        categories['fabrication']]
    ),
}

defaults = {
    "Mass": '0'
}


def get_value(row, name):
    val = row[index_lookup[name]]

    if val == '':
        if name in defaults:
            return defaults[name]
        else:
            return None
    else:
        return val


def get_slot(row):
    return get_value(row, 'Slot')


index_lookup = {}
all_values = {}

with open('gallery_export.csv') as f:
    # Escape quotes to properly parse
    string = f.read() \
        .replace('"Lootmaker"', '\\"Lootmaker\\"') \
        .replace('"Choppy"', '\\"Choppy\\"')

csv.register_dialect('cog', 'excel', escapechar='\\')
reader = csv.reader(StringIO(string), csv.get_dialect('cog'))

header = next(reader)

# Update the index lookup based on the header row
for category in categories.values():
    for name in category:
        index_lookup[name] = header.index(name)

rowNum = 0
for row in reader:
    slot = get_slot(row)

    if slot in slot_categories:
        names = slot_categories[slot]
        values = {}

        for name in names:
            val = get_value(row, name)
            if val is not None:
                values[name] = val

        if 'Category' in values:
            if values['Category'] == 'Prototype':
                values['Rating'] = values['Rating'] + '*'

            if values['Category'] == 'Alien':
                values['Rating'] = values['Rating'] + '**'

        values['Index'] = rowNum
        rowNum += 1

        all_values[values['Name']] = values

with open('../json/items.json', 'w') as f:
    json.dump(all_values, f)
