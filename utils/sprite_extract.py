from argparse import ArgumentParser
from collections import namedtuple
import logging
from os import path
from PIL import Image
import shutil
import zipfile

OUTPUT_PATH = path.abspath(path.join(path.dirname(path.realpath(__file__)), '..', 'src', 'public', 'game_sprites'))

FontFile = namedtuple('FontFile', ['filename', 'tile_width', 'tile_height'])
FontSection = namedtuple('FontSection', ['column', 'row', 'width', 'height'])
Sprite = namedtuple('Sprite', ['column', 'row', 'size', 'name'])

# Define all known fonts
FONTS = [
    FontFile('cogmind12x12_terminus.png', 12, 12),
    FontFile('cogmind14x14.png', 14, 14),
    FontFile('cogmind16x16.png', 16, 16),
    FontFile('cogmind18x18.png', 18, 18),
    FontFile('cogmind24x24_comicsans.png', 24, 24),
]

# Define all sprites
SPRITES = [
    # Parts
    Sprite(16, 9, 1, 'Scrap'),
    Sprite(0, 11, 1, 'Matter'),
    Sprite(0, 11, 1, 'Protomatter'), # Intentional dupe
    Sprite(1, 11, 1, 'Data Core'),
    Sprite(2, 11, 1, 'Engine'),
    Sprite(3, 11, 1, 'Power Core'),
    Sprite(4, 11, 1, 'Reactor'),
    Sprite(5, 11, 1, 'Treads'),
    Sprite(6, 11, 1, 'Wheel'),
    Sprite(7, 11, 1, 'Leg'),
    Sprite(8, 11, 1, 'Hover Unit'),
    Sprite(9, 11, 1, 'Flight Unit'),
    Sprite(10, 11, 1, 'Device'),
    Sprite(11, 11, 1, 'Storage'),
    Sprite(12, 11, 1, 'Processor'),
    Sprite(13, 11, 1, 'Hackware'),
    Sprite(14, 11, 1, 'Protection'),
    Sprite(15, 11, 1, 'Artifact'),
    Sprite(16, 11, 1, 'Energy Gun'),
    Sprite(17, 11, 1, 'Energy Cannon'),
    Sprite(18, 11, 1, 'Ballistic Gun'),
    Sprite(19, 11, 1, 'Ballistic Cannon'),
    Sprite(20, 11, 1, 'Launcher'),
    Sprite(21, 11, 1, 'Special Weapon'),
    Sprite(22, 11, 1, 'Impact Weapon'),
    Sprite(23, 11, 1, 'Slashing Weapon'),
    Sprite(24, 11, 1, 'Piercing Weapon'),
    Sprite(25, 11, 1, 'Special Melee Weapon'),
    Sprite(30, 11, 1, 'Trap'),
    Sprite(31, 11, 1, 'Item'),

    # Bots
    Sprite(2, 12, 1, 'Artisan (Derelict)'),
    Sprite(5, 12, 1, 'Bolteater (Derelict)'),
    Sprite(11, 12, 1, 'Cutter'),
    Sprite(12, 12, 1, 'Mutated Botcube'),
    Sprite(13, 12, 1, 'Subdweller (Derelict)'),
    Sprite(14, 12, 1, 'Scrapper (Derelict)'),
    Sprite(15, 12, 1, 'Elite (Derelict)'),
    Sprite(16, 12, 1, 'Scrapoid (Derelict)'),
    Sprite(18, 12, 1, 'Heavy'),
    Sprite(19, 12, 2, 'Scraphulk (Derelict)'),
    Sprite(23, 12, 3, 'Borebot (Derelict)'),

    Sprite(0, 13, 1, 'Cogmind'),
    Sprite(1, 13, 1, 'Worker'),
    Sprite(2, 13, 1, 'Builder'),
    Sprite(3, 13, 1, 'Tunneler'),
    Sprite(4, 13, 1, 'Hauler'),
    Sprite(5, 13, 1, 'Recycler'),
    Sprite(6, 13, 1, 'Carrier'),
    Sprite(7, 13, 1, 'Mechanic'),
    Sprite(7, 13, 1, 'Minesweeper'),  # Intentional dupe of same sprite
    Sprite(8, 13, 1, 'Operator'),
    Sprite(9, 13, 1, 'Drone'),
    Sprite(10, 13, 1, 'Watcher'),
    Sprite(11, 13, 1, 'Swarmer'),
    Sprite(12, 13, 1, 'Saboteur'),
    Sprite(13, 13, 1, 'Grunt'),
    Sprite(14, 13, 1, 'Brawler'),
    Sprite(15, 13, 1, 'Duelist'),
    Sprite(16, 13, 1, 'Protector'),
    Sprite(17, 13, 1, 'Researcher'),
    Sprite(18, 13, 1, 'Sentry'),
    Sprite(19, 13, 1, 'Demolisher'),
    Sprite(20, 13, 1, 'Specialist'),
    Sprite(21, 13, 1, 'Hunter'),
    Sprite(22, 13, 1, 'Programmer'),
    Sprite(23, 13, 1, 'Q-Series'),
    Sprite(24, 13, 2, 'Behemoth'),
    Sprite(28, 13, 2, 'Compactor'),

    Sprite(0, 14, 1, 'Zionite (Derelict)'),
    Sprite(2, 14, 1, 'Samaritan (Derelict)'),
    Sprite(3, 14, 1, 'Demented (Derelict)'),
    Sprite(4, 14, 1, 'Furnace (Derelict)'),
    Sprite(6, 14, 1, 'Parasite (Derelict)'),
    Sprite(8, 14, 1, 'Thief (Derelict)'),
    Sprite(9, 14, 1, 'Assembler (Derelict)'),
    Sprite(10, 14, 1, 'Assembled (Derelict)'),
    Sprite(12, 14, 1, 'Turret'),
    Sprite(15, 14, 1, 'Explorer (Derelict)'),
    Sprite(17, 14, 1, 'Scientist (Derelict)'),
    Sprite(20, 14, 1, 'Fireman (Derelict)'),
    Sprite(21, 14, 1, 'Ranger (Derelict)'),
    Sprite(23, 14, 1, 'Mutant (Derelict)'),
    Sprite(24, 14, 1, 'V-Series (Prototype)'),
    Sprite(25, 14, 1, 'CL-0N3'),
    Sprite(26, 14, 1, 'QV-33N'),
    Sprite(27, 14, 1, 'V4-D3R'),

    Sprite(0, 15, 1, 'Striker (Prototype)'),
    Sprite(1, 15, 1, 'Executioner (Prototype)'),
    Sprite(2, 15, 1, 'Alpha 7 (Prototype)'),
    Sprite(3, 15, 3, 'Fortress (Prototype)'),
    Sprite(12, 15, 1, 'Golem (Derelict)'),
    Sprite(13, 15, 1, 'Imprinter'),
    Sprite(14, 15, 1, 'Z-Light (Derelict)'),
    Sprite(15, 15, 1, 'Z-Heavy (Derelict)'),
    Sprite(16, 15, 1, 'Z-Ex'),
    Sprite(17, 15, 1, 'Knight (Derelict)'),
    Sprite(18, 15, 1, 'Troll (Derelict)'),
    Sprite(19, 15, 2, 'Dragon (Derelict)'),
    Sprite(23, 15, 2, 'Hydra (Derelict)'),
    Sprite(27, 15, 1, 'Revision'),

    Sprite(0, 16, 1, 'Revision 17'),
    Sprite(1, 16, 1, 'Revision 17++'),
    Sprite(2, 16, 1, 'Zhirov'),
    Sprite(3, 16, 1, 'Perun'),
    Sprite(4, 16, 1, 'Svarog'),
    Sprite(5, 16, 1, 'Data Miner'),
    Sprite(6, 16, 2, 'God Mode'),
    Sprite(10, 16, 1, 'Warlord'),
    Sprite(11, 16, 1, 'Sigix Warrior'),
    Sprite(12, 16, 3, 'MAIN.C1'),
    Sprite(21, 16, 1, 'MAIN.C2'),
    Sprite(22, 16, 1, 'Architect'),
    Sprite(23, 16, 1, 'Optimus'),
    Sprite(24, 16, 2, 'Triborg'),
]


# Extracts a .x file (actually a .zip) to the given path
def extract_resources(zipped_x_path, resources_path):
    if path.exists(resources_path):
        logging.info('Resources path %s already exists, deleting now', resources_path)
        shutil.rmtree(resources_path)

    try:
        zip_file = zipfile.ZipFile(zipped_x_path)
        zip_file.extractall(resources_path)
        logging.info('Resources extracted to %s', resources_path)
    except Exception as e:
        logging.error('Failed to extract %s resources: %s', zipped_x_path, e)


# Processes a single font
def process_font(font, fonts_path):
    image_path = path.join(fonts_path, font.filename)
    font_image: Image.Image = Image.open(image_path)

    assert font_image.height % font.tile_height == 0
    assert font_image.width % font.tile_width == 0

    for sprite in SPRITES:
        if sprite.size == 1:
            # For a 1x1, just crop the image and save
            left = sprite.column * font.tile_width
            top = sprite.row * font.tile_height
            right = left + font.tile_width
            bottom = top + font.tile_height
            sprite_image = font_image.copy().crop((left, top, right, bottom))
        else:
            # For a 2x2 or 3x3, need to create a new image and then
            # copy the individual pieces of the sprite on top
            sprite_image = Image.new('RGBA', (font.tile_width * sprite.size, font.tile_height * sprite.size),
                                     (255, 255, 255, 255))

            column = sprite.column
            row = sprite.row

            for i in range(sprite.size * sprite.size):
                font_left = column * font.tile_width
                font_top = row * font.tile_height
                font_right = font_left + font.tile_width
                font_bottom = font_top + font.tile_height

                sprite_left = (i % sprite.size) * font.tile_width
                sprite_top = (i // sprite.size) * font.tile_height

                piece_image = font_image.copy().crop((font_left, font_top, font_right, font_bottom))
                sprite_image.paste(piece_image, (sprite_left, sprite_top))

                if (column + 1) * font.tile_width == font_image.width:
                    column = 0
                    row += 1
                else:
                    column += 1

        sprite_image.save(path.join(OUTPUT_PATH, '{}_{}.png'.format(sprite.name, font.tile_height)))

        if font.tile_width == 24:
            # Create zoomed 48x48 tile as well
            sprite_image = sprite_image.resize((sprite_image.width * 2, sprite_image.height * 2),
                                               resample=Image.NEAREST)
            sprite_image.save(path.join(OUTPUT_PATH, '{}_{}.png'.format(sprite.name, font.tile_height * 2)))


# Entry point
def main(cogmind_dir):
    temp_dir = path.join(cogmind_dir, 'temp')
    cogmind_resources_path = path.join(cogmind_dir, 'cogmind.x')
    cogmind_resources_dir = path.join(temp_dir, 'cogmind_resources')
    fonts_path = path.join(cogmind_resources_dir, 'data', 'fonts')

    extract_resources(cogmind_resources_path, cogmind_resources_dir)

    for font in FONTS:
        logging.info('Processing font %s', font.filename)
        process_font(font, fonts_path)

    shutil.rmtree(temp_dir)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    parser = ArgumentParser()
    parser.add_argument('cogmind_dir', help='Root Cogmind directory. If installed via Steam, this is something like '
                                            'C:/Program Files (x86)/Steam/steamapps/common/Cogmind')

    args = parser.parse_args()
    main(args.cogmind_dir)
