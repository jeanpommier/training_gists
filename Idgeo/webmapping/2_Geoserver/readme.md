# GeoServer

## Préparer les données
Découper les données (vous devrez peut-être ajuster les chemins)
Note : je ne traite pas le shapefile des buildings, car il est un peu trop gros, le traitement prendrait trop de temps pour notre formation. Il est déjà dispo dans donnees_tp/gis_osm_buildings_a_free_1_09.zip
```bash
# on installe 7zip, qui va nous servir de suite
sudo apt-get install p7zip

# On extrait le tracé du département d'Ariège, à partir des données de la BDtopo
##

mkdir -p /mnt/d/B2U6S23/TP/ && cd /mnt/d/B2U6S23/TP/
7zr e /mnt/d/B2U6S23/sources/donnees_tp/BDTOPO_3-0_TOUSTHEMES_SHP_LAMB93_D009_2021-09-15.7z BDTOPO_3-0_TOUSTHEMES_SHP_LAMB93_D009_2021-09-15/BDTOPO/1_DONNEES_LIVRAISON_2021-09-00165/BDT_3-0_SHP_LAMB93_D009-ED2021-09-15/ADMINISTRATIF/DEPARTEMENT.*
# On inspecte la structure du shapefile
ogrinfo -so -al DEPARTEMENT.shp
#  Et on fait notre requête d'extraction
ogr2ogr -where "INSEE_DEP='09'" contours_ariege.shp DEPARTEMENT.shp
# On nettoie
rm DEPARTEMENT.*


# Extraction des données OSM sur l'emprise de l'ariège
##

# on installe d'abord ogr2ogr
sudo apt-get install gdal-bin

# on extrait l'archive dans un dossier temporaire
mkdir -p ~/tmp/midi-pyrenees-osm
unzip /mnt/d/B2U6S23/sources/donnees_tp/midi-pyrenees-latest-free.shp.zip -d ~/tmp/midi-pyrenees-osm

# et on itère : pour chaque fichier du dossier temporaire, on le coupe
# sur l'Ariège et on le sauve dans notre dossier destination
mkdir -p /mnt/d/B2U6S23/TP/ariege-osm && cd /mnt/d/B2U6S23/TP/ariege-osm
for f in $(ls -Sr ~/tmp/midi-pyrenees-osm/*.shp) ; do
if [[ "$f" =~ "building" ]]; then
echo "Skipping $f (too big)"
else
echo "Clipping $f..." ;
ogr2ogr $(basename -- ${f%.*})_09.shp \
-clipsrc /mnt/d/B2U6S23/TP/contours_ariege.shp -lco ENCODING=UTF-8 $f
fi
done

# et on nettoie
rm -rf ~/tmp/midi-pyrenees-osm
```

## Publier un shapefile en base de données
```bash
ogr2ogr -f PGDUMP -nln roads -nlt PROMOTE_TO_MULTI /vsistdout/ /mnt/d/B2U6S23/TP/ariege-osm/gis_osm_roads_free_1_09.shp \
	| psql -h localhost -p 5433 -d cqpgeom -U cqpgeom -f -

# alternatively, you can do
# shp2pgsql -s 4326 -c -k -W UTF-8 -I /mnt/d/B2U6S23/TP/ariege-osm/gis_osm_roads_free_1_09.shp roads \
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
### Manipulations  & optimisation de raster en ligne de commande
Extraire un MNT restreint à l'emprise du département d'Ariège :
```
gdalwarp -cutline /mnt/d/B2U6S23/TP/contours_ariege.shp -crop_to_cutline -dstalpha /mnt/d/B2U6S23/sources/donnees_tp/eu_dem_extract.tif /mnt/d/B2U6S23/TP/eu_dem_09.tif
```

Inspecter un geotiff
```
gdalinfo /mnt/d/B2U6S23/TP/eu_dem_09.tif
```

Optimiser un geotiff (tiled + overviews)
```
cd /mnt/d/B2U6S23/TP/
# Tiled structure + lossless compression
gdal_translate -co "TILED=YES" -co COMPRESS=LZW eu_dem_09.tif eu_dem_09_tiled.tif
# overviews
gdaladdo -r average --config COMPRESS_OVERVIEW LZW eu_dem_09_tiled.tif 2 4 8 16 32
```

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
