#!/usr/bin/env py

import csv
import json
from io import StringIO
from os import path
import sys

input_path = path.join(path.dirname(path.realpath(__file__)), 'lore_export.csv')
output_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'lore.json')

categories = [
    # Type and category are used for grouping but not displayed individually
    'Type',
    'Category',
    'Name/Number',
    'Content',
]

additional_content = {
    '0b10 Records': {
        'Content':
            'Various records kept by 0b10. Most are obtainable at regular 0b10-controlled terminals via query() hacks.',
        'Entries': {
            'Archives': 'Spoiler',
            'Brute Force Hacks': 'Spoiler',
            'Cogmind': 'Spoiler',
            'Containment Facilitator': 'Spoiler',
            'Core Stripper': 'Spoiler',
            'Derelict Prototype': 'Spoiler',
            'Disintegrator': 'Spoiler',
            'Dragon': 'Spoiler',
            'EMDS': 'Spoiler',
            'Extension': 'Spoiler',
            'Gamma Refractor': 'Redacted',
            'Heavy Quantum Rifle': 'Spoiler',
            'Heroes of Zion': 'Spoiler',
            'Hub_04(d)': 'Spoiler',
            'Hydra': 'Spoiler',
            'Hypervelocity EM Gauss Rifle': 'Spoiler',
            'Knight': 'Spoiler',
            'L-Cannon': 'Redacted',
            'LRC Attachments': 'Redacted',
            'LRC-V3': 'Redacted',
            'MAIN.C': 'Spoiler',
            'Matter Drive': 'Spoiler',
            'Myomer Exoskeleton': 'Spoiler',
            'Null Cannon': 'Spoiler',
            'Omega Cannon': 'Spoiler',
            'Particle Cleaver': 'Spoiler',
            'Perforator': 'Spoiler',
            'Potential Cannon': 'Spoiler',
            'Quarantine': 'Spoiler',
            'Regenerative Plating': 'Spoiler',
            'SHELL Armor': 'Spoiler',
            'Section 7': 'Redacted',
            'Shearcannon': 'Redacted',
            'Sheargun': 'Redacted',
            'Sigix': 'Spoiler',
            'Sigix Access Protocol': 'Spoiler',
            'Sigix Autopsy': 'Spoiler',
            'Sigix Broadsword': 'Spoiler',
            'Sigix Exoskeleton': 'Redacted',
            'Sigix Technology': 'Spoiler',
            'Slip Nodes': 'Spoiler',
            'Tachyon Dispersion Ray': 'Spoiler',
            'Terminator': 'Spoiler',
            'Terrabomb': 'Spoiler',
            'Testing': 'Spoiler',
            'Transdimensional Reconstructor': 'Spoiler',
            'Trojans': 'Spoiler',
            'Troll': 'Spoiler',
            'Unknown Artifact': 'Spoiler',
            'Warlord': 'Spoiler',
            'Warp Gun': 'Spoiler',
            'Z-bomb Delivery System': 'Spoiler',
        },
    },
    '4L-MR0 Records': {
        'Content': 'Records obtainable from the Terminal in 4L-MR0\'s Lab in Subcaves.',
        'Spoiler': 'Spoiler',
    },
    '8R-AWN Dialogue': {
        'Content':
            'Dialogue obtained by speaking with 8R-AWN in Materials, Mines or on the Exiles map',
    },
    'Abandonware Records': {
        'Content': 'Records obtainable from the Abandonware Association club\'s Terminal in Scraptown',
        'Spoiler': 'Spoiler',
    },
    'Access_0 Records': {
        'Content':
            'Records obtainable in a terminal on the west side of Access 0. They are only accessible ' +
            'with a very strong weapon to penetrate the shell or by acquiring the Architect ' +
            'Data Core by destroying the Architect.',
        'Spoiler': 'Redacted',
    },
    'Archives Records': {
        'Content':
            'Records obtainable in the Archives map as part of the Extension branch. Only possible ' +
            'during a rare event where Zhirov is present here instead of at his standard Lab.',
        'Spoiler': 'Spoiler',
    },
    'Cave Peace Records': {
        'Content': 'Records obtainable from the Cave Peace club\'s Terminal in Scraptown',
        'Spoiler': 'Spoiler',
    },
    'Cetus Records': {
        'Content': 'Records obtainable via terminals in the Cetus map as part of the Extension branch.',
        'Spoiler': 'Spoiler',
    },
    'Clippyterm Records': {
        'Content': 'Records obtainable from the Clippyterm Terminal in Subcaves',
        'Spoiler': 'Spoiler',
    },
    'Cyclists Records': {
        'Content': 'Records obtainable from the Cyclist club\'s Terminals in Scraptown',
        'Spoiler': 'Spoiler',
    },
    'Exiles Records': {
        'Content': 'Records obtainable via terminals in the Exiles map.',
    },
    'Lab Records': {
        'Content':
            'Records obtainable via terminals in the secret Lab hidden on the west side of Armory. ' +
            'Most records can only be decoded after using the Data Conduit machine on the Data Miner\'s map.',
        'Spoiler': 'Redacted',
    },
    'Oracle Records': {
        'Content': 'Records obtainable on terminals on the Data Miner map.',
        'Spoiler': 'Spoiler',
    },
    'Scraplab Records': {
        'Content': 'Records obtainable from the Scraplab Terminals in the Scrap Lab Recycling.',
        'Spoiler': 'Spoiler',
    },
    'Scraptown Records': {
        'Content': 'Records obtainable from Terminals outside of the member gate in Scraptown.',
        'Spoiler': 'Spoiler',
    },
    'Subcaves Records': {
        'Content': 'Records obtainable from a Terminal in the room holding the SUBCON Basin in Subcaves.',
        'Spoiler': 'Spoiler',
    },
    'Symbiants Records': {
        'Content': 'Records obtainable from the Symbiant club\'s Terminal in Scraptown.',
        'Spoiler': 'Spoiler',
    },
    'UFD Records': {
        'Content': 'Records obtainable from the main UFD member Scraptown Terminal in Scraptown',
        'Spoiler': 'Spoiler',
    },
    'WAR.Sys Records': {
        'Content': 'Records obtainable on terminals on the Warlord map.',
        'Spoiler': 'Spoiler',
    },
    'Zhirov Records': {
        'Content': 'Records obtainable on terminals on the Zhirov map.',
        'Spoiler': 'Spoiler',
    },
    '5H-AD0 Dialogue': {
        'Content': 'Dialogue obtainable by speaking with the rarely spawning bot 5H-AD0 in the Zion Deep Caves map.',
        'Spoiler': 'Spoiler',
    },
    'Architect Dialogue': {
        'Content': 'Dialogue obtainable by speaking with the Architect in the Access 0 map.',
        'Spoiler': 'Redacted',
    },
    'Base Dialogue': {
        'Content': 'Dialogue obtainable by speaking with various derelicts on the Warlord map.',
        'Spoiler': 'Spoiler',
    },
    'Data Miner Dialogue': {
        'Content': 'Dialogue obtainable by speaking with the Data Miner on their map.',
        'Spoiler': 'Spoiler',
    },
    'EX-BIN Dialogue': {
        'Content': 'Dialogue obtainable by speaking with the exile EX-BIN on the Exiles map.',
        'Entries': {
            '2': 'Spoiler',
        },
    },
    'EX-DEC Dialogue': {
        'Content': 'Dialogue obtainable by speaking with the exile EX-DEC on the Exiles map.',
        'Entries': {
            '2': 'Spoiler',
        },
    },
    'EX-HEX Dialogue': {
        'Content': 'Dialogue obtainable by speaking with the exile EX-HEX on various maps.',
        'Entries': {
            '2': 'Spoiler',
        },
    },
    'Exiles Dialogue': {
        'Content': 'Dialogue obtainable by speaking with various Exile-aligned derelicts on the Exiles map.',
    },
    'Imprinter Dialogue': {
        'Content': 'Dialogue obtainable by speaking with the Imprinter on the Zion and Zion Deep Caves maps.',
        'Spoiler': 'Spoiler',
    },
    'MAIN.C Dialogue': {
        'Content': 'Dialogue obtainable by speaking with MAIN.C on the Command map.',
        'Spoiler': 'Redacted',
    },
    'Revision 17 Dialogue': {
        'Content': 'Dialogue obtainable by speaking with Revision 17 on various maps.',
        'Spoiler': 'Spoiler',
    },
    'Scraplab Dialogue': {
        'Content': 'Dialogue obtainable by speaking with Derelicts in the Scraplab in Recycling.',
        'Spoiler': 'Spoiler',
    },
    'Scraptown Dialogue': {
        'Content': 'Dialogue obtainable by speaking with Derelicts in Scraptown.',
        'Spoiler': 'Spoiler',
    },
    'Sigix Dialogue': {
        'Content':
            'Dialogue obtainable by speaking with the Sigix Warrior located in Quarantine after using a ' +
            'Core Reset Matrix to decipher the messages on various maps.',
        'Spoiler': 'Spoiler',
        'Entries': {
            '2': 'Redacted',
            '3': 'Redacted',
        },
    },
    'Warlord Dialogue': {
        'Content': 'Dialogue obtainable by speaking with Warlord on various maps.',
        'Spoiler': 'Spoiler',
        'Entries': {
            '6': 'Redacted',
            '7': 'Redacted',
            '8': 'Redacted',
            '9': 'Redacted',
            '10': 'Redacted',
            '11': 'Redacted',
        },
    },
    'Zhirov Dialogue': {
        'Content': 'Dialogue obtainable by speaking with Zhirov on various maps.',
        'Spoiler': 'Spoiler',
        'Entries': {
            '8': 'Redacted',
            '9': 'Redacted',
        },
    },
    'Zion Dialogue': {
        'Content': 'Dialogue obtainable by speaking with various bots on the Zion map.',
        'Spoiler': 'Spoiler',
    },
    'Common Analysis': {
        'Content':
            'Analyses about regular 0b10 bots, obtainable at regular 0b10-controlled terminals via analysis() hacks.',
    },
    'Derelict Analysis': {
        'Content':
            'Analyses about derelict bots, obtainable at regular 0b10-controlled terminals via analysis() hacks.',
    },
    'Prototype Analysis': {
        'Content':
            'Analyses about prototype 0b10 bots, obtainable at regular 0b10-controlled terminals via analysis() hacks.',
        'Spoiler': 'Spoiler',
    },
};


def get_value(row, name):
    val = row[index_lookup[name]]

    if val == '':
        return None
    else:
        return val

index_lookup = {}
all_values = []

with open(input_path) as f:
    string = f.read()

csv.register_dialect('cog', 'excel', escapechar='\\')
reader = csv.reader(StringIO(string), csv.get_dialect('cog'))

header = next(reader)

# Update the index lookup based on the header row
for category_name in categories:
    index_lookup[category_name] = header.index(category_name)

rowNum = 0
for row in reader:
    values = {}

    for category_name in categories:
        # Get values from rows
        val = get_value(row, category_name)
        if val is not None:
            values[category_name] = val

    category = values['Category']
    type = values['Type']
    del values['Category']
    del values['Type']

    if type == 'Record':
        type = 'Records'
    
    group_name = f'{category} {type}'
    try:
        group = next((g for g in all_values if g['Name'] == group_name))
        group_content = additional_content[group['Name']]
    except:
        group = {'Name': group_name, 'Entries': []}

        if group['Name'] in additional_content:
            group_content = additional_content[group['Name']]
            if 'Content' not in group_content:
                print('Need to add content for {}'.format(group['Name']))
                sys.exit(1)
            else:
                group['Content'] = group_content['Content']

            if 'Spoiler' in group_content:
                group['Spoiler'] = group_content['Spoiler']
        else:
            print('Need to add content for {}'.format(group['Name']))
            sys.exit(1)

        all_values.append(group)

    # Add additional per-entry values
    if 'Entries' in group_content and values['Name/Number'] in group_content['Entries']:
        values['Spoiler'] = group_content['Entries'][values['Name/Number']]

    group['Entries'].append(values)


with open(output_path, 'w') as f:
    json.dump(all_values, f)
