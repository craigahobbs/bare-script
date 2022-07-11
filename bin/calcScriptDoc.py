# Licensed under the MIT License
# https://github.com/craigahobbs/calc-script/blob/main/LICENSE

import argparse
import json
import re
import sys


def main():
    # Command line arguments
    parser = argparse.ArgumentParser(description='calc-script library function documentation tool')
    parser.add_argument('files', metavar='FILE', nargs='+', help='source code files')
    args = parser.parse_args()

    # Documentation regular expressions
    re_key = re.compile(r'^\s*(?://|#)\s*\$(?P<key>function|group|doc|return):\s*(?P<text>.+?)\s*$')
    re_arg = re.compile(r'^\s*(?://|#)\s*\$arg\s+(?P<arg>.+?):\s*(?P<text>.+?)\s*$')

    # Parse each source file line-by-line
    function = None
    functions = {}
    for file_ in args.files:
        with open(file_, 'r', encoding='utf-8') as file_handle:
            lines = file_handle.read().splitlines()
        for line_ix, line in enumerate(lines):
            # function/group/doc/return documentation keywords?
            match_key = re_key.match(line)
            if match_key is not None:
                key = match_key.group('key')
                text = match_key.group('text')

                # Keyword used outside of function scope?
                if key != 'function' and function is None:
                    raise Exception(f'{file_}:{line_ix + 1}: {key} keyword used outside of function scope')

                # Process the keyword
                if key == 'group':
                    if 'group' in function:
                        raise Exception(f'{file_}:{line_ix + 1}: Function "{function["name"]}" group redefined')
                    function['group'] = text
                elif key == 'doc':
                    if 'doc' not in function:
                        function['doc'] = []
                    function['doc'].append(text)
                elif key == 'return':
                    if 'return' not in function:
                        function['return'] = []
                    function['return'].append(text)
                else: # key == 'function':
                    if text in functions:
                        raise Exception(f'{file_}:{line_ix + 1}: Function "{text}" redefined')
                    function = {'name': text}
                    functions[text] = function
            else:
                # arg keyword?
                match_arg = re_arg.match(line)
                if match_arg is not None:
                    name = match_arg.group('arg')
                    text = match_arg.group('text')

                    # Keyword used outside of function scope?
                    if function is None:
                        raise Exception(f'{file_}:{line_ix + 1}: arg "{name}" keyword used outside of function scope')

                    # Add the function arg
                    args = function.get('args')
                    if args is None:
                        args = function['args'] = []
                    if len(args) != 0 and args[-1]['name'] == name:
                        arg = args[-1]
                    else:
                        if any(arg['name'] == name for arg in args):
                            raise Exception(f'{file_}:{line_ix + 1}: arg "{name}" redefined')
                        arg = {'name': name, 'doc': []}
                        args.append(arg)
                    arg['doc'].append(text)

    # Output the library documentation model to stdout
    output = {
        'functions': sorted(
            functions.values(),
            key=lambda func: (func.get('group'), func['name'])
        )
    }
    json.dump(output, sys.stdout, indent = 4)


if __name__ == '__main__':
    main()
