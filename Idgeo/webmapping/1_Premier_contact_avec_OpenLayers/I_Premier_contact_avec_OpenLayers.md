**WebMapping training gists**
Contains all code blocks provided in the PDF.
PDF code blocks are deign to be read, while those, here, can safely be copy-pasted.

# Partie 1: premier contact avec OpenLayers
## Chapitre 1: afficher des données
```javascript
clc2018 = new ol.layer.Tile({
  title: 'CORINE Land Cover - France metropolitaine - 2018',
  source: new ol.source.TileWMS({
    url: 'http://wxs.ign.fr/corinelandcover/geoportail/r/wms',
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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.4.3/css/ol.css" type="text/css">
    <style>
      #map {
        height: 256px;
        width: 512px;
      }
    </style>
    <title>OpenLayers example</title>
    <script src="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.9.0/build/ol.js"></script>
  </head>
  <body>
    <h1>My Map</h1>
    <div id="map"></div>
    <script type="text/javascript">
      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            title: 'Global Imagery',
      			source: new ol.source.TileWMS({
      				url: 'https://apps.pigeosolutions.fr/geoserver/wms',
      				params: {LAYERS: 'cqpgeom:bluemarble', TILED: true}
      			})
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

## Chapitre 4: [TP] workshop anglais
Installer npm :
```bash
sudo apt update
# nous avons besoin de la commande curl
sudo apt install curl
# On installe nvm, comme indiqué dans la doc
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# et on demande a nvm de nous installer node (dernière version stable)
nvm install 16.13.0
```

Créer une nouvelle config et copier les données du workshop anglais :
```
mkdir openlayers-workshop-en-vite
cd openlayers-workshop-en-vite
npx create-ol-app

# On copie les fichiers du workshop :
cp -r ../openlayers-workshop-en/{data,doc,examples,gitbook} .
```

packages.json :
```
{
	"name": "openlayers-workshop-en-vite",
	"version": "1.0.0",
	"scripts": {
		"start": "vite",
		"build": "vite build",
		"serve": "vite preview"
		},
	"devDependencies": {
		"vite": "^2.6.7",
		"eslint": "^7.32.0",
		"eslint-config-openlayers": "^15.1.0",
		"serve-static": "^1.14.1",
		"shx": "^0.3.3"
		},
	"dependencies": {
		"ol": "latest",
		"colormap": "^2.3.2",
		"kompas": "^0.0.1",
		"ol-hashed": "^2.1.0",
		"ol-mapbox-style": "^6.4.2"
		}
}
```


vite.config.js :
```
export default {
  build: {
	sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
		port: "1234"
  }
}
```

Déplacer les données dans un dossier `public`:
```bash
mkdir public
mv data public/
npm run build
```

Lancer un serveur web pour servir le contenu compilé :
```bash
docker run --rm --name nginx -v /home/jean/dev/webmapping/openlayers-workshop-en-vite/dist:/usr/share/nginx/html:ro -p 82:80 nginx
```
