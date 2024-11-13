import argparse

parser = argparse.ArgumentParser(prog='Replace escaped newlines')
parser.add_argument('path')
args = parser.parse_args()

with open(args.path) as f:
    str = f.read()

with open(args.path, 'w') as f:
    f.write(str.replace('\\n', '\n'))