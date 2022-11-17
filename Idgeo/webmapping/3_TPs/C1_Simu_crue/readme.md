# [TP] Simulation de montée des eaux
## MNT
### Préparation
Extraire l'emprise du MNT sur la camargue
```bash
# Découper notre MNT sur une emprise rectangulaire]
gdal_translate -projwin 3730447 2359413 3957487 2229788 /mnt/d/B2U6S23/donnees_tp/eu_dem_extract.tif /mnt/d/B2U6S23/TP/eu_dem_camargue.tif
# Et puis on l'optimise pour publication :
# Tiled structure + lossless compression
cd /mnt/d/B2U6S23/TP
gdal_translate -co "TILED=YES" -co COMPRESS=LZW eu_dem_camargue.tif eu_dem_camargue_tiled.tif
# overviews
gdaladdo -r average --config COMPRESS_OVERVIEW LZW eu_dem_camargue_tiled.tif 2 4 8 16 32
```
On le copie puis on le publie dans GeoServer
```
cp eu_dem_camargue_tiled.tif ~/docker-compo-geoserver/geoserver_geodata/jpommier/
```

### Style
Style dynamique : [voir ici](./dem_dynamic.sld)

## Codons
On va créer une coquille de départ pour notre code, comme la doc OpenLayers le propose dans le [quickstart](https://openlayers.org/doc/quickstart.html) :
```

```

Configuration du MNT dans OpenLayers
```
var dem = new TileLayer({
  title: 'MNT Copernicus',
  source: new TileWMS({
    url: 'http://localhost:82/geoserver/wms',
    params: {
      LAYERS: 'cqpgeom:eu_dem_camargue',
      TILED: false,
      STYLES: 'dem_dynamic',
      ENV: 'water:0'
    }
  })
});
```

Ajouter un input de type *range* dans index.html
```

<label>
  Sea level
  <input id="level" type="range" min="0" max="100" value="0"/>
  +<span id="output"></span> m
</label>
```

Connecter les deux via un eventListener
```
var control = document.getElementById('level');
var output = document.getElementById('output');
control.addEventListener('input', function() {
  output.innerText = control.value/10;
  dem.getSource().updateParams({ENV:'water:'+control.value/10})
});

//initialize controls
control.value = 0;
output.innerText = 0;
```

Le contenu final de notre appli est fourni dans le dossier [code_fonctionnel](code_fonctionnel). A utiliser dans le contexte de notre appli codée avec npm.
