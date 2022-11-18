import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import {createStringXY} from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {bbox} from 'ol/loadingstrategy';
import Draw from 'ol/interaction/Draw';
import {transform} from 'ol/proj';
import GML2 from 'ol/format/GML2';
import WFS from 'ol/format/WFS';

import {Fill, RegularShape, Stroke, Style} from 'ol/style';


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    // projection: 'EPSG:4326',
    center: fromLonLat([1.64, 42.8]),
    zoom: 11
  })
});
map.addControl(new MousePosition({
  coordinateFormat: createStringXY(2),
  projection: 'EPSG:4326'
}));


var chemins = new TileLayer({
  title: 'Chemins',
  source: new TileWMS({
    url: 'http://localhost:82/geoserver/wms',
    params: {
      LAYERS: 'jpommier:chemins-de-rando',
      TILED: true,
    }
  })
});
map.addLayer(chemins);

var incidentsSource = new VectorSource({
  format: new GeoJSON(),
  url: function(extent) {
    return 'http://localhost:82/geoserver/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&typename=jpommier:incidents&' +
        'outputFormat=application/json&srsname=EPSG:3857&' +
        'bbox=' + extent.join(',') + ',EPSG:3857';
  },
  strategy: bbox
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

var btnDrawPoint = document.getElementById('btnDrawPoint');
var editing = false;
var draw = null;
var currentFeature = null;
btnDrawPoint.addEventListener('click', function(evt) {
  if ( !editing ) {
    editing = true;
    btnDrawPoint.innerText = 'Annuler';
    draw = new Draw({
      type: 'Point',
      source: incidentsSource
    });
    map.addInteraction(draw);
    draw.on('drawend', function(evt) {
      var form = document.getElementById('formContainer');
      form.style.display = 'block';
      currentFeature = evt.feature;
      console.log(evt);
      var coords = currentFeature.getGeometry().getCoordinates();
      coords = transform(coords, 'EPSG:3857', 'EPSG:4326');
      var location_input = document.getElementById('input_location');
      location_input.value = coords;
      map.removeInteraction(draw);
      draw = null;
      document.getElementById('modedemploi').style.display = 'none';
      document.getElementById('formContainer').style.display = 'block';
    })
  } else {
      editing = false;
      btnDrawPoint.innerText = 'Signaler un incident';
      map.removeInteraction(draw);
  }
});

var formatWFS = new WFS();
var formatGML = new GML2({
	featureNS: 'jpommier',
	featureType: 'incidents',
	srsName: 'EPSG:3857'
	});
var insertWFS = function(f) {
  var node = formatWFS.writeTransaction([f],null,null,formatGML);
	var s = new XMLSerializer();
	var str = s.serializeToString(node);
fetch('http://localhost:8010/proxy/geoserver/wfs',
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
      response.text().then( function(msg) {
        console.log(msg);
        reset();
      });
    } else {
      console.log("error: could not push the feature into GeoServer");
      console.log(response);
    }
  })
  .catch( function (error) {
    console.log("There has been an issue with fetch operation: " + error.message );
  });
}

// We're using fetch API. Check that the browser supports it
if (! window.fetch) {
  alert("Pour soumettre un incident, cette application utilise la fonctionnalité 'fetch'. \n" +
        "Celle-ci n'est pas supportée par votre navigateur : veuillez utiliser un navigateur " +
        "récent supportant fetch \n"+
        "(cf. https://developer.mozilla.org/fr/docs/Web/API/Fetch_API#Compatibilit%C3%A9_Navigateurs)"
  );
}

var btnSubmit = document.getElementById('btnSubmit');
btnSubmit.addEventListener('click', function() {
  if (currentFeature != null) {
    currentFeature.setProperties({
      type: document.getElementById('inc_type').value,
      description : document.getElementById('inc_desc').value,
      report_date: new Date().toISOString()
    })
    insertWFS(currentFeature);
  }
});

document.getElementById('btnCancel').addEventListener('click', function() {
  reset();
});


document.getElementById('btnDrawPoint').addEventListener('click', function() {
  document.getElementById('modedemploi').style.display = 'block';
  document.getElementById('btnDrawPoint').style.display = 'none';
});

function reset() {
  document.getElementById('formContainer').style.display = 'none';
  document.getElementById('modedemploi').style.display = 'none';
  document.getElementById('btnDrawPoint').style.display = 'block';


  btnDrawPoint.innerText = 'Signaler un incident';
  editing = false;

  document.getElementById("incidentForm").reset();

  if (draw !=null) {
    draw=null;
    editing=false;
    currentFeature=null;
    // use a timeout to let time for the transaction to happen
    setTimeout(function(){
      incidentsSource.refresh();
    }, 500);
  }
}
