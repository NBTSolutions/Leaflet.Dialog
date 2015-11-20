# Leaflet.Dialog

A dialog modal window that is resizable and positionable on the map.

## Adding a dialog box:

````js
// After you've set up your map and layers, add the modal window by running:
var dialog = L.control.dialog(options)
              .setContent("<p>Hello! Welcome to your nice new dialog box!</p>")
              .addTo(map);
````

## options:

| Property | Type | Default | Description
| --- | --- | --- | ---
| size | Array | [ 200, 300 ] | An array of the starting width and height values (in pixels).
| minSize | Array | [ 100, 100 ] | An array with the minimum resize width and height (in pixels).
| maxSize | Array | [ 350, 350 ] | An array with the maximum resize width and height (in pixels).
| anchor | Array | [ 250, 250 ] | The starting point anchor location (from the upper left) in pixels.
| position | String | 'topleft' | The leaflet control div to place the modal inside, as a starting reference point.

## Working with the dialog box:

### Close the window:

````js
dialog.close();
````

### Open the window:

````js
dialog.open();
````

### Destroy the window:

````js
dialog.destroy();
````

### Reset the contents:

````js
dialog.setContent("<p>Here's some new content!</p>");
````
