# GeoServer

## Préparer les données
Découper les données (vous devrez peut-être ajuster les chemins)
Note : je ne traite pas le shapefile des buildings, car il est un peu trop gros, le traitement predrait trop de temps pour notre formation. Il est déjà dispo dans work/ariege-osm
```bash
# on installe d'abord ogr2ogr
sudo apt-get install gdal-bin

# on extrait l'archive dans un dossier temporaire
mkdir -p tmp/midi-pyrenees-osm
unzip OSM/midi-pyrenees-latest-free.shp.zip -d tmp/midi-pyrenees-osm

# et on itère : pour chaque fichier du dossier temporaire, on le coupe sur l'Ariège et on le sauve dans notre dossier destination
mkdir -p work/ariege-osm && cd work/ariege-osm
for f in $(ls -Sr ../../tmp/midi-pyrenees-osm/*.shp) ; do
  if [[ "$f" =~ "building" ]]; then
    echo "Skipping $f (too big)"
  else
    echo "Clipping $f..." ;
    ogr2ogr $(basename -- ${f%.*})_09.shp \
      -clipsrc ../../departement-ariege.shp -lco ENCODING=UTF-8 $f
  fi
done
cd -

# et on nettoie
rm -rf tmp/midi-pyrenees-osm
```

## Publier un shapefile en base de données
```bash
ogr2ogr -f PGDUMP -nln roads -nlt PROMOTE_TO_MULTI /vsistdout/ gis_osm_roads_free_1_09.shp \
	| psql -h localhost -p 5433 -d cqpgeom -U cqpgeom -f -

# alternatively, you can do
# shp2pgsql -s 4326 -c -k -W UTF-8 -I gis_osm_roads_free_1_09.shp roads \
#   | psql -h localhost -p 5433 -U cqpgeom -W -d cqpgeom

```

## Style (CSS)
Exemple de style (css) pour les lieux
```css
[fclass = 'town'] [@scale < 10000000] {
  label: [name];
  font-family: Arial;
  font-size: 14px;
  font-weight: bold;
  halo-color: white;
  halo-radius: 1;
 }


[fclass = 'village' or fclass = 'suburb'] [@scale < 500000] {
  label: [name];
  font-family: Arial;
  font-size: 10px;
  halo-color: white;
  halo-radius: 1;
 }


[fclass = 'locality' or fclass = 'hamlet'] [@scale < 20000] {
  label: [name];
  font-family: Arial;
  font-size: 8px;
  halo-color: white;
  halo-radius: 1;
 }
```

## Raster
Extraire les lignes de niveau à partir du MNT, via GDAL
```
gdal_contour -a ELEV -i 50 eu_dem_09.tif eu_dem_09_contours.shp
```

## Donnée tabulaire
Faire une jointure (code SQL)
```SQL
SELECT *
FROM public.subventions_dsil_2020 as data,
		 public.communes_09 as geo
WHERE data.code_commune_ou_epci = geo.insee_com
```
