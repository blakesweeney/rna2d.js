#!/usr/bin/env python

import re
import sys

import simplejson as json


SEQUENCE_PATTERN = re.compile('^\((\w)\) (-?\d+\.\d+) (-?\d+\.\d+) lwstring$')
# TRANSLATE_PATTERN = re.compile('^(-?\d+\.\d+) (-?\d+\.\d+) translate$')
# SCALE_PATTERN = re.compile('^(\d+) (\d+) scale$')
COMMENT = re.compile('%.*$')

START_LINE = '(A) 105.30 -101.00 lwstring'


# This is meant to be a rough, very rough way of converting points to pixels,
# to more or less spread out the leters.
def point2pixel(number):
    # return number
    return 96.0/72.0 * number
    # return 72.0/96.0 * number


def make_id(data, index):
    return '2AW7_AU_1_A_%s_%s_' % (index, data['sequence'])


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
    # from the size of the paper to get the coordinate in SVG, since SVG origin
    # is in the upper left. I think these pages are A4, so the size is 842.
    # This should be close enough anyway, as the image includes a header we
    # don't want to.
    y = 800 - value(1)

    # 1.4 is a just a scaling factor. Seems to work well.
    return {
        'x': 1.4 * point2pixel(x),
        'y': 1.4 * point2pixel(y),
        'sequence': data[0][1].upper()
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
    started = False
    index = 1
    for line in raw:
        line = COMMENT.sub('', line.rstrip())
        command = line.split(' ')
        if line == START_LINE:
            started = True
        if command[-1] == 'scale' and len(command) == 3:
            transform = update(transform, scale=command[0:2])
        elif command[-1] == 'translate' and len(command) == 3:
            transform = update(transform, translate=command[0:2])
        elif started and SEQUENCE_PATTERN.match(line):
            info = sequence_data(command, transform)
            info.update({'id': make_id(info, index)})
            data.append(info)
            index += 1
    return data


def main(filename):
    with open(filename, 'r') as raw:
        data = parse_postscript(raw)
    json.dump(data, sys.stdout, indent=2)
    sys.stdout.write('\n')


if __name__ == '__main__':
    main(sys.argv[1])
