# [TP] Gestion d'incidents sur sentiers de randonnée

On va créer une coquille de départ pour notre code, comme la doc OpenLayers le propose dans le [quickstart](https://openlayers.org/doc/quickstart.html) :
```
mkdir -p ~/dev/
cd ~/dev/
npm create ol-app rando-incidents
cd rando-incidents
npm install
npm start
```


Ajouter la couche incidents, en mode WFS
```
var incidentsSource = new VectorSource({
  format: new GeoJSON(),
  url: function(extent) {
    return 'http://localhost/geoserver/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&typename=cqpgeom:incidents&' +
        'outputFormat=application/json&srsname=EPSG:3857&' +
        'bbox=' + extent.join(',') + ',EPSG:3857';
  },
  strategy: bboxStrategy
});

// on dessinera des étoiles rouges
var stroke = new Stroke({color: 'black', width: 1});
var fill = new Fill({color: 'red'});
var pointGenericStyle = new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 5,
      radius: 10,
      radius2: 4,
      rotation: 0,
      angle: 0
    })
  });

var incidents = new VectorLayer({
  source: incidentsSource,
  style: pointGenericStyle
});
map.addLayer(incidents);
```

Dessiner des points
```
/* Ajouter <button type="button" id="btnDrawPoint">
                     Signaler un incident</button>
   dans index.html. Ce bouton servira a activer le mode dessin
   */
const btnDrawPoint = document.getElementById('btnDrawPoint');
btnDrawPoint.addEventListener('click', function() {
  toggleDraw();
});

var draw; // global so we can remove it later
var editing=false;
function toggleDraw() {
  if (! editing) {
    draw = new Draw({
      source: incidentsSource,
      type: 'Point'
    });
    draw.on('drawend', afterDraw);
    map.addInteraction(draw);
    editing=true;
  } else {
    map.removeInteraction(draw);
    editing=false;
  }
}

function afterDraw(evt) {
  var p = evt.feature.getGeometry();
  var coords = transform(p.getCoordinates(), 'EPSG:3857', 'EPSG:4326')
  console.log(coords);
```

Persister les points via WFS-T
```
var formatWFS = new WFS();
var formatGML = new GML2({
	featureNS: 'cqpgeom',
	featureType: 'incidents',
	srsName: 'EPSG:3857'
	});

var $;
$ = require('jquery');

var insertWFS = function(f) {
	var node = formatWFS.writeTransaction([f],null,null,formatGML);
	var s = new XMLSerializer();
	var str = s.serializeToString(node);
	fetch('http://localhost:82/geoserver/cqpgeom/wfs',
		{
			headers: {
				'Accept': 'application/xml',
				'Content-Type': 'application/xml'
			},
			method: 'POST',
			body: str
		}
	)
	.then( function(response) {
		console.log(response);
		if (response.ok) {
			console.log("success");
		} else {
			console.log("error: could not push the feature into GeoServer");
			console.log(response);
		}
	})
	.catch( function (error) {
		console.log("There has been an issue with fetch operation: " + error.message );
	});
}
```

Sauf qu'en dev, ça ne va pas marcher à cause des CORS, Cross Origin Request, un système destiné à protéger l'internaute de certains abus sur internet, mais nous compliquant bien la vie. Le plus simple en dev : utiliser un proxy de dev qui va masquer ce souci.

On pourra utiliser [local-cors-proxy](https://www.npmjs.com/package/local-cors-proxy), un package npm pour cela. Et remplacer l'URL ci-dessus en correspondance.


Le contenu final de notre appli est fourni dans le dossier [code_fonctionnel](code_fonctionnel). A utiliser dans le contexte de notre appli codée avec npm. Avec un local-cors-proxy installé et démarré.
