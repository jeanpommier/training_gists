# [TP] Simulation de montée des eaux
Extraire l'emprise du MNT sur la camargue
```bash
gdaltindex emprise.shp eu_dem_camargue.tif
```

Découper les données (vous devrez peut-être ajuster les chemins)
```bash
# on extrait l'archive dans un dossier temporaire
mkdir -p tmp/languedoc-roussillon
unzip OSM/languedoc-roussillon-latest-free.shp.zip -d tmp/languedoc-roussillon

# et on itère : pour chaque fichier du dossier temporaire, on le coupe sur la
# zone d'emprise du MNT et on le sauve dans notre dossier destination
mkdir -p work/camargue-osm && cd work/camargue-osm
for f in $(ls -Sr ../../tmp/languedoc-roussillon/*.shp) ; do \
  if [[ "$f" =~ "building" ]]; then
    echo "Skipping $f (too big)"
  else
    echo "Clipping $f..." ;
	  ogr2ogr $(basename -- ${f%.*})_09.shp \
		 -clipsrc ../../MNT/emprise.shp -lco ENCODING=UTF-8 $f
 fi
done

# et on nettoie
rm -rf tmp/languedoc-roussillon
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
          })
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
