# Lost

A js13k entry. http://2017.js13kgames.com

## Playing

- Browse to https://psema4.github.io/lost/
- TBD

## Building

Install node.js if you don't have it already.

Install the uglifyjs and http-server node.js packages:

`npm install uglify-js -g`
`npm install http-server -g`

To build the game, run the mkdist.sh shell command; it takes an optional --serve (or --server) argument which, if provided, will launch a `http-server` instance.  Open http://localhost:8080/ to play the game

## Design & Considerations

Quick & dirty design document:

### Setting

- infinite forest and/or cave
-

### Mechanics

- gameboard & pieces
- roguelike entities
- forest fire
    - each turn, a tree that is on fire should
      check for other trees within 2 squares;
      if one is found there's a 40% chance the
      tree will catch fire. Trees within one 
      squares' distance have a 70% chance.

### Constraints

- offline
- 13kb maximum zip file size
- theme: "Lost"
- 

### Style

- CSS3D / Flat 3D-Sprites
-

### CSS3D vs A-Frame

- CSS3D
    -  pros
        - CSS3D
        - js13k-server / socket.io; multiplayer
    - cons
        - managing the camera and lack of
          quaternions for local rotations
- A-Frame
    - pros
        - true 3D engine, webvr-enabled
        - automatic head-mounted inputs
        - "fake" CSS3D effect using quads and
          transparent .png's as textures
        - camera-control
            - each location sprite should specify a
              virtual camera transform and lookAt()
              target
        - no network
            - js13k 2017 A-Frame category constraint
    - cons
        - not CSS3D
        - need to override default wasd controls
        - only cardboard available for testing in vr
        - 1Mb for free feels like cheating

### Story

    A long lost ancient artifact, the BAR, is being
    sought out to save the Kingdom of FOO. The player
    has been charged with searching the forbidden
    Lost Wood. Legend has it that a great defeat against
    the Kingdom took place there in the distant past.
    The border of the Lost Wood has been patrolled by the
    King's Gaurd ever since.

### Gameplay

    You have been charged with searching the forbidden
    Lost Wood. 

    Collect cards to help explore and survive the dreaded
    Lost Wood.  One Action Card (minimum) is drawn per turn,
    and only one action card may be played to end your turn.

    Some Event or Inventory cards may grant additional Action
    cards; you may hold upto 5 Action Cards in your hand. In
    order to draw an Action Card, you must have less than 5
    cards. Discard an Action Card from your hand if necessary.

    To survive, you must keep your health meter above zero.

    To cast spells, you must keep your magic meter above zero

    Equipped inventory does not count against inventory (See
    the Rucksack and Travel Pack cards). To begin the game,
    you'll start with a sword (equipped), a rucksack with
    one random Inventory Card, and a small purse with a
    random number of Gold Coins.  At the end of your turn,
    any Inventory Cards not marked as being in your inventory
    will be discarded.

    Event Cards can be picked up by landing on specially
    marked board locations

    Inventory Cards can be picked up by landing on board
    locations containing a treasure chest.  There is also
    a varying % chance that defeating an enemy actor will
    drop one (or more) Inventory Cards when defeated.

    Stats include: health, magic, attack, defense. Stats are
    modified by Inventory (or Event) Cards, whether they are
    equipped or not.

### Cards

- Event cards
    - Bad weather;
    - Lightning strike; deal electrical damage to all actors
      including the player within 2 squares. Any tree in the
      square struck by lightning erupts into flames with a
      chance of starting a forest fire.
    - Safe campsite; player doesn't
- Inventory cards
    - Kings' Warrant (starting card); use to access the Lost
      Wood
    - Gold Coin; must be equipped or held by a purse, does
      not count against Inventory Card limit
    - Small Purse (starting card); holds 10 coins
    - Medium Purse; holds 50 coins
    - Large Purse; holds 100 coins
    - Rucksack; carry upto 3 inventory cards
    - Travel Pack; carry upto 5 inventory cards
    - Light armour; absorbs upto 3 hp
    - Medium armour; absorbs upto 5 hp
    - Heavy armour; absorbs upto 10 hp
    - Horn of FOO; call for help from the Kings' Gaurd
    - Ring of FOO; +1 to stat BAR
    - etc

## Todo & Known Issues

- Find a tool to minify html and css
- Uglify-js doesn't like template strings, check version
- 
