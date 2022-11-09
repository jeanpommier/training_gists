**WebMapping training gists**
Contains all code blocks provided in the PDF.
PDF code blocks are deign to be read, while those, here, can safely be copy-pasted.

# Partie 1: premier contact avec OpenLayers
## Chapitre 1: afficher des données
```javascript
clc2018 = new ol.layer.Tile({
  title: 'CORINE Land Cover - France metropolitaine - 2018',
  source: new ol.source.TileWMS({
    url: 'http://wxs.ign.fr/clc/geoportail/r/wms',
    params: {LAYERS: 'LANDCOVER.CLC18_FR', TILED: true}
  })
})
map.addLayer(clc2018);
```
## Chapitre 2: Améliorons la carte
```javascript
controls: ol.control.defaults().extend([
  new ol.control.ScaleLine(),
  new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY()
  })
]),
```

```javascript
controls: ol.control.defaults().extend([
  new ol.control.ScaleLine(),
  new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(2),
    projection: 'EPSG:4326'
  })
]),
```

```css
.ol-mouse-position {
  background-color: rgba(255,255,255,.8);;
  padding: 5px;
}
```

## Chapitre 3: [TP] Workshop français
```
docker run --rm --name nginx -v /home/jean/webmapping/openlayers-workshop-fr:/usr/share/nginx/html:ro -p 3000:80 nginx
```

On part du fichier map.html suivant :
```html
<!doctype html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v7.1.0/ol.css" type="text/css">
    <style>
      #map {
        height: 256px;
        width: 512px;
      }
    </style>
    <title>OpenLayers quickstart</title>
    <script src="https://cdn.jsdelivr.net/npm/ol@v7.1.0/dist/ol.js"></script>
  </head>
  <body>
    <h1>Ma carte</h1>
    <div id="map"></div>
    <script type="text/javascript">
      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            title: 'Global Imagery',
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          projection: 'EPSG:4326',
          center: [0, 0],
          zoom: 0,
          maxResolution: 0.703125
        })
      });
    </script>
  </body>
</html>

```
