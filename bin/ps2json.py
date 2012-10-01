#!/usr/bin/env python

import re
import sys

import simplejson as json


# SEQUENCE_PATTERN = re.compile('^\((\w)\) (-?\d+\.\d+) (-?\d+\.\d+) lwstring$')
# TRANSLATE_PATTERN = re.compile('^(-?\d+\.\d+) (-?\d+\.\d+) translate$')
# SCALE_PATTERN = re.compile('^(\d+) (\d+) scale$')
COMMENT = re.compile('%.*$')


def point2pixel(number):
    # return number
    return 96.0/72.0 * number
    # return 72.0/96.0 * number


def to_num(arr):
    return [float(item) for item in arr]


def sequence_data(data, trans):
    num = to_num(data[1:3])

    # We need to compute the actual position of the letters. In the PS files the
    # origin is translated, coordinates are scaled and then translated again.
    # This should undo those operations to give us a reasonable set of
    # coordinates.
    value = lambda i: (num[i] * trans['scale'][i] + trans['translate'][i])
    x = value(0)

    # Postscripts origin is lower left, so I need to subtract the y coordinate
    # from the size of the paper to get the coordinate in SVG. I think these
    # pages are A4, so the size is 842. This should be close enough anyway
    y = 800 - value(1)
    return {
      'x': 1.4 * point2pixel(x),
      'y': 1.4 * point2pixel(y),
      'sequence': data[0][1]
    }


def update(transform, scale=None, translate=None):
    scale = to_num(scale or [1, 1])
    translate = to_num(translate or [0, 0])
    updated = {
        'scale': [x * scale[i] for i, x in enumerate(transform['scale'])],
        'translate': []
    }
    for i, x in enumerate(transform['translate']):
        updated['translate'].append(x + updated['scale'][i] * translate[i])
    return updated


def parse_postscript(raw):
    data = []
    transform = {'scale': [1, 1], 'translate': [0, 0]}
    for line in raw:
        line = COMMENT.sub('', line.rstrip())
        command = line.split(' ')
        if command[-1] == 'scale' and len(command) == 3:
            transform = update(transform, scale=command[0:2])
        elif command[-1] == 'translate' and len(command) == 3:
            transform = update(transform, translate=command[0:2])
        elif command[-1] == 'lwstring' and len(command) == 4 and \
            len(command[0]) == 3:
            data.append(sequence_data(command, transform))
    y_sorted = sorted(data, key=lambda d: d['y'])
    for index, data in enumerate(y_sorted):
        id = '2AVY_AU_1_A_%s_%s_' % (index + 5, data['sequence'].upper())
        data.update({'id': id})
    return y_sorted


def main(filename):
    with open(filename, 'r') as raw:
        data = parse_postscript(raw)
    json.dump(data, sys.stdout, indent=2)
    sys.stdout.write('\n')


if __name__ == '__main__':
    main(sys.argv[1])
