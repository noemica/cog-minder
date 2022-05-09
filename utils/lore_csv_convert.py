#!/usr/bin/env py

import csv
import json
from io import StringIO
from os import path
import re

input_path = path.join(path.dirname(path.realpath(__file__)), 'lore_export.csv')
output_path = path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'json', 'lore.json')

categories = [
    # Type and category are used for grouping but not displayed individually
    'Type',
    'Category',
    'Name/Number',
    'Content',
]

def get_value(row, name):
    val = row[index_lookup[name]]

    if val == '':
        return None
    else:
        return val

index_lookup = {}
all_values = {}

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
    
    group = f'{category} {type}'
    if group in all_values:
        all_values[group].append(values)
    else:
        all_values[group] = [values]

with open(output_path, 'w') as f:
    json.dump(all_values, f)
