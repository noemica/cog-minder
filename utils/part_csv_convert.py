#!/usr/bin/env py

import csv
import json
from io import StringIO
from os import path

input_path = path.join(path.dirname(path.realpath(__file__)), 'gallery_export.csv')
output_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'items.json')
all_parts_output_path = path.join(path.dirname(path.realpath(__file__)), 'all_parts.txt')

categories = {
    'all': [
        'Slot',
        'Hackable Schematic',
        'Supporter Attribution',
    ],
    'power_overview': [
        'Name',
        'Type',
        'Rating',
        'Category',
        'Size',
        'Mass',
        'Integrity',
        'No Repairs',
        'Coverage',
        'Heat Generation',
        'Description',
    ],
    'propulsion_overview': [
        'Name',
        'Type',
        'Rating',
        'Category',
        'Size',
        'Integrity',
        'No Repairs',
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
        'No Repairs',
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
        'No Repairs',
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
        'No Repairs',
        'Life',
        'Description',
    ],
    'power': [
        'Energy Generation',
        'Energy Storage',
        'Power Stability',
        'Matter Upkeep',
        'Effect',
        'Description',
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
        "Arc",
    ],
    'projectile': [
        'Projectile Count',
        'Damage Min',
        'Damage Max',
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
        'Explosion Damage Min',
        'Explosion Damage Max',
        'Falloff',
        "Chunks",
        'Explosion Type',
        'Explosion Heat Transfer',
        'Explosion Spectrum',
        'Explosion Disruption',
        'Explosion Salvage',
    ],
    'fabrication': [
        'Fabrication Number',
        'Fabrication Time',
        'Fabrication Components'
    ],
}


def flatten(lists):
    return [y for x in lists for y in x]


slot_categories = {
    'N/A': flatten([
        categories['all'],
        categories['other_overview'],
        categories['fabrication'],
    ]),
    'Power': flatten([
        categories['all'],
        categories['power_overview'],
        categories['power'],
        categories['explosion'],
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

expansions = {
    'Adv.': 'Advanced',
    'Asb.': 'Assembled',
    'Arm.': 'Armored',
    'Cld.': 'Cooled',
    'Com.': 'Compact',
    'Cmb.': 'Combat',
    'Enh.': 'Enhanced',
    'Exp.': 'Experimental',
    'Gui.': 'Guided',
    'Hcl.': 'Hypercooled',
    'Hcp.': 'High-capacity',
    'Hdn.': 'High-density',
    'Hpw.': 'High-powered',
    'Hrd.': 'Hardened',
    'Hvy.': 'Heavy',
    'Hyb.': 'Hybrid',
    'Hyp.': 'Hypervelocity',
    'Imp.': 'Improved',
    'Lgt.': 'Light',
    'Lrg.': 'Large',
    'Lrn.': 'Long-range',
    'Lyr.': 'Layered',
    'Mak.': 'Makshift',
    'Med.': 'Medium',
    'Mic.': 'Micro',
    'Mni.': 'Mini',
    'Prc.': 'Precision',
    'Rnf.': 'Reinforced',
    'Sml.': 'Small',
    "Spk.": "Spiked",
    'Zio.': 'Zionite',
}


def get_value(row, name):
    val = ''
    try:
        val = row[index_lookup[name]]
    except Exception as e:
        print(e)

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
all_values = []

with open(input_path) as f:
    # Escape a few quotes to properly parse
    string = f.read() \
        .replace('"Lootmaker"', '\\"Lootmaker\\"') \
        .replace('"Choppy"', '\\"Choppy\\"') \
        .replace('"Deathgrip"', '\\"Deathgrip\\"') \
        .replace('"Insurrection"', '\\"Insurrection\\"')
    

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

        full_name: str = values['Name']
        for (start, expansion) in expansions.items():
            if full_name.startswith(start):
                full_name = full_name.replace(start, expansion)
                break

        values['Full Name'] = full_name

        all_values.append(values)

with open(output_path, 'w') as f:
    json.dump(all_values, f, indent=4)

with open (all_parts_output_path, 'w') as f:
    f.writelines('\n'.join([x['Name'] for x in all_values]))