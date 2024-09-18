# Partie 1: premier contact avec OpenLayers
## Chapitre 1: afficher des données
```javascript
var clc2018 = new ol.layer.Tile({
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
controls: ol.control.defaults.defaults().extend([
  new ol.control.ScaleLine(),
  new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY()
  })
]),
```

```javascript
controls: ol.control.defaults.defaults().extend([
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
# Copier notre version simplifiée du workshop français

# chaque ligne commençant par # est un commentaire, qui n'est pas interprêté par la console
# On copie sur Debian le dossier depuis le disque Windows (on suppose que vous avez copié mes fichiers dans \verb|D:\B2U6S23\sources\|)
# On crée un dossier dev à la racine de notre compte debian, s'il n'existe pas déjà
mkdir -p ~/dev/

# Et on copie le dossier du workshop français (version modifiée par moi). Le chemin windows D:\B2U6S23\sources\ est visible comme /mnt/d/B2U6S23/sources depuis Debian
cp -r /mnt/d/B2U6S23/sources/code/openlayers-workshop-fr/ ~/dev/

# Et on lance un serveur http avec docker
docker run --rm --name nginx -v ~/dev/openlayers-workshop-fr:/usr/share/nginx/html:ro -p 3000:80 nginx
```

On part du fichier map.html suivant :
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v10.1.0/ol.css" type="text/css">
    <style>
      #map {
        height: 256px;
        width: 512px;
      }
    </style>
    <title>OpenLayers quickstart</title>
    <script src="https://cdn.jsdelivr.net/npm/ol@v10.1.0/dist/ol.js"></script>
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
Puis on suit les instructions du [workshop français](https://openlayers.org/workshop/fr/) tout en gardant un oeil sur les changements précisés dans le support de cours.

### Clef bingmap
`AvLKZ87V5PHr45NASkZ6AgGUQkAJGwLsC8yJwyAdMQX5JLOYnyhTf1tl56jubs8v`


## Chapitre 4: [TP] Workshop anglais
En ligne de commande Debian, on peut facilement récupérer l'archive zip et la décompresser au même endroit :
```
# pré-requis : on install unzip si le paquet n'est pas déjà installé
sudo apt install unzip

# On se place au bon endroit
cd ~/dev
# On télécharge l'archive puis on la décompresse, et on efface l'archive, à présent inutile
wget https://github.com/openlayers/workshop/releases/download/v7.0.0-en.1/openlayers-workshop-en.zip
unzip openlayers-workshop-en.zip
rm openlayers-workshop-en.zip

# On se déplace dans le dossier du workshop
cd openlayers-workshop-en
```

Installation de nvm
```
sudo apt update
# nous avons besoin de la commande curl
sudo apt install curl
# On installe nvm, comme indiqué dans la doc
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# et on demande à nvm de nous installer node (dernière version stable)
nvm install lts
```

Servir l'application en mode "production"
```
npm run build
docker run --rm --name nginx -v ~/dev/openlayers-workshop-en/dist:/usr/share/nginx/html:ro -p 82:80 nginx
```
