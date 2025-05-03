#!/usr/bin/env py

from collections import defaultdict
import csv
import json
from io import StringIO
from os import path
import re

input_path = path.join(path.dirname(path.realpath(__file__)), 'robots_export.csv')
# input_path_b15 = path.join(path.dirname(path.realpath(__file__)), 'robots_export_b15.csv')
output_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'bots.json')
# output_path_b15 = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'bots_b15.json')

categories = [
    'Name',
    'Class',
    'Tier',
    'Threat',
    'Rating',
    'Value',
    'Size Class',
    'Size',
    'Profile',
    'Memory',
    'Spot %',
    'Movement',
    'Speed',
    'Speed %',
    'Sight Range',
    'Energy Generation',
    'Heat Dissipation',
    'Core Integrity',
    'Core Exposure',
    'Core Exposure %',
    'Salvage Potential',
    # 'Accuracy',
    # 'Melee Accuracy',
    'Inventory Capacity',
    # 'Hacking Availability',
    # 'Hacking Difficulty',
    # 'Power Slots',
    # 'Propulsion Slots',
    # 'Utility Slots',
    # 'Weapon Slots',
    'Kinetic',
    'Thermal',
    'Explosive',
    'Electromagnetic',
    'Impact',
    'Slashing',
    'Piercing',
    'Immunities',
    'Traits',
    'Fabrication Count',
    'Fabrication Time',
    'Armament',
    'Components',
    'Analysis',
]

overload_speeds = {
    "C-17 Slicer": 20,
    "C-35 Carver": 15,
    "C-57 Dissector": 7,
    "Decapitator": 7,
}

overload_speed_percentages = {
    "C-17 Slicer": 500,
    "C-35 Carver": 666,
    "C-57 Dissector": 1428,
    "Decapitator": 1428,
}

name_replacements = {
    'Z-Light': ['Z-Light (5)', 'Z-Light (7)', 'Z-Light (9)'],
    'Z-Heavy': ['Z-Heavy (5)', 'Z-Heavy (7)', 'Z-Heavy (9)'],
    'Z-Experimental': ['Z-Experimental (8)', 'Z-Experimental (10)'],
    'Thief': ['Thief', 'Master Thief'],
    'Assembled': ['Assembled (4)', 'Assembled (7)'],
    'Golem': ['Golem', 'Golem (Naked)'],
    'Surgeon': ['Surgeon (4)', 'Surgeon (6)'],
    'Wasp': ['Wasp (5)', 'Wasp (7)'],
    'Thug': ['Thug (5)', 'Thug (7)'],
    'Savage': ['Savage (5)', 'Savage (7)'],
    'Butcher': ['Butcher (5)', 'Butcher (7)'],
    'Martyr': ['Martyr (5)', 'Martyr (7)'],
    'Guerrilla': ['Guerrilla (5)', 'Guerrilla (7)'],
    'Wizard': ['Wizard (5)', 'Wizard (7)'],
    'Marauder': ['Marauder (6)', 'Marauder (8)'],
    'Fireman': ['Fireman (5)', 'Fireman (7)'],
    'Mutant': ['Mutant (5)', 'Mutant (6)', 'Mutant (7)', 'Mutant (8)'],
    'Infiltrator': ['Infiltrator (6)', 'Infiltrator (7)', 'Infiltrator (8)'],
    'God Mode': ['God Mode (Fake)', 'God Mode'],
    'Warlord': ['Warlord', 'Warlord (Command)'],
    'MAIN.C': ['MAIN.C (Shell)', 'MAIN.C'],
    'Player': ['Cogmind'],
    'Elite': ['Elite (4)', 'Elite (7)'],
    'Scrapper': ['Scrapper (3)', 'Scrapper (6)'],
    'Scrapoid': ['Scrapoid (3)', 'Scrapoid (6)', 'Scrapoid (8)'],
    'Scraphulk': ['Scraphulk (6)', 'Scraphulk (8)'],
    'Ranger': ['Ranger', 'DRS Ranger'],
    'Warlord Statue': ['Warlord Statue (Bot)'],
    'Triborg': ['Triborg', 'Triborg (Optimus)'],
}

class_replacements = {
    'Cogmind': 'Cogmind'
}

skip_bots = set([
    'Anomaly',
    'Elf',
    'Final Abomination',
    'Greater Abomination',
    'Lesser Abomination',
    'Major Abomination',
    'Minor Abomination',
    'Player 2',
    'Sauler',
    'Ultimate Abomination',
])

resistances = [
    'Electromagnetic',
    'Explosive',
    'Impact',
    'Kinetic',
    'Piercing',
    'Slashing',
    'Thermal',
]

def get_value(row, name):
    val = row[index_lookup[name]]

    if val == '':
        return None
    else:
        return val

def get_parts(part_strings):
    parts = []
    for string in part_strings:
        options = string.split(' OR ')
        if len(options) > 1:
            option_list = []
            for option in options:
                match = re.match('(\d+)x (.*)', option)
                if match is not None:
                    option_list.append({'name': match.group(2), 'number': int(match.group(1))})
                else:
                    match = re.match('(.*) \(\d*%\)', option)
                    if match is not None:
                        # For now just strip the percentage, maybe will add in later
                        option_list.append({'name': match.group(1)})
                    else:
                        option_list.append({'name': option})
            parts.append(option_list)
        else:
            part = options[0]
            match = re.match('(\d+)x (.*)', part)
            if match is not None:
                for _ in range(int(match.group(1))):
                    parts.append(match.group(2))
            else:
                parts.append(part)

    return parts

index_lookup = {}
all_values = []

def process_csv(input_path, output_path):
    index_lookup.clear()
    all_values.clear()

    name_replacements_indices = defaultdict(lambda: 0)

    with open(input_path) as f:
        string = f.read()

    csv.register_dialect('cog', 'excel', escapechar='\\')
    reader = csv.reader(StringIO(string), csv.get_dialect('cog'))

    header = next(reader)

    # Update the index lookup based on the header row
    for category_name in categories:
        index_lookup[category_name] = header.index(category_name)

    for row in reader:
        values = {}

        for category_name in categories:
            # Get values from rows
            val = get_value(row, category_name)
            if val is not None:
                values[category_name] = val

        if values['Name'] in skip_bots:
            continue

        # Combine resistances into their own dictionary
        bot_resistances = {}
        for category_name in list(values):
            if category_name in resistances:
                bot_resistances[category_name] = values[category_name].strip('%')
                values.pop(category_name)

        if len(bot_resistances) > 0:
            values['Resistances'] = bot_resistances

        # Combine armament and components into their own lists
        if 'Armament' in values:
            originalString = values['Armament']
            armament = get_parts(values['Armament'].split(', '))
            values['Armament'] = armament
            values['Armament String'] = originalString

        if 'Components' in values:
            originalString = values['Components']
            components = get_parts(values['Components'].split(', '))
            values['Components'] = components
            values['Components String'] = originalString

        if 'Immunities' in values:
            immunitiesStrings = values['Immunities'].split(', ')
            values['Immunities'] = immunitiesStrings

        if 'Traits' in values:
            traits_strings = values['Traits'].split('\r\n\r\n')
            values['Traits'] = traits_strings

        if values['Name'] in name_replacements:
            # If the name should be replaced, use an alternate name in a predetermined order
            # This handles alternate bot names and duplicates
            names = name_replacements[values['Name']]
            index = name_replacements_indices[values['Name']]

            if index >= len(names):
                raise Exception('Missing enough entries for duplicate {}'.format(values['Name']))

            name_replacements_indices[values['Name']] = index + 1
            values['Name'] = names[index]

        if values['Name'] in class_replacements:
            values['Class'] = class_replacements[values['Name']]

        if values['Name'] in all_values:
            raise Exception('Duplicate name {}'.format(values['Name']))

        if values['Name'] in overload_speeds:
            values['Overload Speed'] = overload_speeds[values['Name']]
            values['Overload Speed %'] = overload_speed_percentages[values['Name']]

        match = re.match('^(\w-\d{2}) (.*)', values['Name'])
        if match is not None:
            values['Short Name'] = match[1]
            values['Ally Name'] = match[2]

        all_values.append(values)

    with open(output_path, 'w') as f:
        json.dump(all_values, f, indent=4)

process_csv(input_path, output_path)
# process_csv(input_path_b15, output_path_b15)