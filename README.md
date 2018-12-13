# Project Banner for Atom Editor

With [Project Banner](https://github.com/elis/project-banner) you can easily and simply add informative banners to your projects.

![Example](http://image.prntscr.com/image/bbd21c2ac1da40d1a09291b453d11ec8.png)

If you're like me, you are working on many projects, and sometimes with similar names, similar file structure, and other confusing similarities that sometimes make me edit the wrong file.

The answer is a simple and unique banner at the bottom of the layout that you can use to identify the particular project you're working on quickly and easily avoiding mistakes and many lost hours figuring out why  our changes don't apply...

![Screenshot](http://image.prntscr.com/image/4ecdaefb84b14734b0617af80a319ea0.png)

This package is my first foray into atom custom packages and might not  be very optimized. It's also a product of a couple of nights of passion rather than a methodical development and rigorous testing. It's fragile. It's very basic in its features at the moment as well.

[Project Banner](https://atom.io/packages/project-banner) on [atom.io](https://atom.io/)

## Settings

### `package.json`

`configPath` - provide Project Banner with a config path (relative to the project path) of the banner files

### `.bannerfile.json` or `.bannerfile.cson`

In project path (or relative as configured in `configPath`) these files will be loaded and processed according to the settings.

### `.banerfile.js` or `.bannerfile.coffee`

Same as `json` or `cson` but exected to have `exports = {...}` as the resulting output of the file.
Content will be merged with content from static file.

## Setting Options

Examples for a `.bannerfile.json` flavor can be seen in this project.

Settings will automatically reload when changed - this makes it easy to configure the banner, and allows creating dynamic banners with some clever configuration.

### `items`

Array of `Objects` (or sometimes strings, using the shorthand method) containing some details about the element to be displayed.

#### `type`

String to indicate type of element.

Currently supported types are:

- `text` - simple text display
  - requires `content` property
- `icon` - display an icon from the built in atom iconography pack
  - requires `icon` property
- `svg` - display an svg from the local project
  - requires `path` property

#### `classList`

Array of strings to be applied to the element as its class-names. Useful to style later.

## `styles`

Array of strings to be applied to the banners stylesheet.

Example:

```
{
  "items": [
    "Project Banner",
    {
      "type": "text",
      "content": "My first banner!"
    },
    {
      "type": "icon",
      "icon": "code",
      "classList": ["code-icon"]
    },
    {
      "type": "svg",
      "path": "static/html5.svg"
    }
  ],
  "styles": [
    ".code-icon { color: green; }",
    ".dark .code-icon { color: blue; }"
  ]
}
```

Use `.dark` classname for styles that only need to be applied for dark themes (if project banner identifies the theme as dark).



## Troubleshooting

### Banner not showing

- Make sure you have a proper banner configuration, either a `projectBanner` property in a `package.json` file, or a `.bannerfile.json` containing an object settings

- Make sure you have an `items` property array with at least one item in item (can be a simple string) - e.g. `"items": ["My first item!""]`

- Try reloading the window either by closing the window and opening it again regularly or by pressing `ctrl+alt+r` to reload it

- Try the default key bindings `ctrl+alt+o` to hide/show the banner

- Try toggling the banner from the command pallet by pressing `ctrl+shift+p` and typing in `Project Banner` - you should see a toggle option - activate it
  ![Project Banner in command pallet](http://image.prntscr.com/image/3e73dfd257bb4836b8a5896fa98df465.png)

- Try looking at the bottom of the screen, just above the status bar

- Make sure that your `package.json` or `.bannerfile.json` are valid and parse correctly

## Uses

Project Banner was designed to solve a problem for me - easily identify within which project I currently am in.

If Project Banner solved a problem for you, or simply looks good with your project please share it us!

### What is it even good for?

- Communicate vital information in a prominent location
- Display a personalized signature
- Branding opportunity
- Quick identification and orientation
- Stream server data and possibly debug data
- Quickly see if dependencies are ready/loaded/available/online


Here are some examples of project banners:

![Project Banner's own banner](http://image.prntscr.com/image/0c961448374d43568b7af898104f8da0.png)

![TMS Self Service v2](http://image.prntscr.com/image/434a3110b26f4d53836748f781bce2e1.png)

![TMS Self Service v1](http://image.prntscr.com/image/958bbcc2c39f45689630688a633c6832.png)

Share your configurations with us and we'll put them up for everyone to marvel!

## Future possibilities

Ideally Project Banner would support dynamic configuration - loading js modules instead of static json files.

Support for LESS integrated with built-in variables and imports would be essential feature moving forward.

Perhaps a more evolved templating solution could be developed instead of or additionally to the items mechanism.

More features that would be nice to have:

- Dynamic/configurable height
- Support for nested bannerfiles (for nested projects, node_modules, etc')
- Proper tests...
- User interface? nah... right?
- Reactive banner - enable actions to be initiated from the banner - for example starting/stopping dependency servers and services
