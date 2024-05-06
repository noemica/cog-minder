
import csv
import json
import sys
 
data = {}
with open(sys.argv[1], encoding='utf-8') as csvf:
    csvReader = csv.DictReader(csvf)
    for rows in csvReader: 
        if rows['Page Type'] not in data:
            data[rows['Page Type']] = []
        data[rows['Page Type']] += [{'Name': rows['Name'], 'Content': rows['Content'].replace('\\n', '\n')}]

with open(sys.argv[2], 'w', encoding='utf-8') as jsonf:
    jsonf.write(json.dumps(data, indent=4))
