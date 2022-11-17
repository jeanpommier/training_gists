import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import {createStringXY} from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    // projection: 'EPSG:4326',
    center: fromLonLat([3.7, 43.5]),
    zoom: 8
  })
});
map.addControl(new MousePosition({
  coordinateFormat: createStringXY(2),
  projection: 'EPSG:4326'
}));

var dem = new TileLayer({
  title: 'MNT Copernicus',
  source: new TileWMS({
    url: 'http://localhost:82/geoserver/wms',
    params: {
      LAYERS: 'jpommier:dem_camargue',
      TILED: false,
      STYLES: 'dem_camargue',
      ENV: 'water:0'
    }
  })
});
map.addLayer(dem);

var control = document.getElementById('level');
var output = document.getElementById('output');
control.addEventListener('input', function() {
  output.innerText = control.value/10;
  dem.getSource().updateParams({ENV:'water:'+control.value/10})
});

//initialize controls
control.value = 0;
output.innerText = 0;
