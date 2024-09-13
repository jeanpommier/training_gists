# GeoServer

## Préparer les données
Découper les données (vous devrez peut-être ajuster les chemins)
Note : je ne traite pas le shapefile des buildings, car il est un peu trop gros, le traitement prendrait trop de temps pour notre formation. Il est déjà dispo dans donnees_tp/gis_osm_buildings_a_free_1_09.zip
```bash
# on installe 7zip, qui va nous servir de suite et gdal qui va nous fournir les commandes ogr un peu plus tard
sudo apt-get install p7zip gdal-bin

# On extrait le tracé du département d'Ariège, à partir des données de la BDtopo
##
export SRC_DIR=/mnt/d/A5S5/sources
export WORK_DIR=/mnt/d/A5S5/TP

mkdir -p $WORK_DIR && cd $WORK_DIR
7zr e $SRC_DIR/donnees_tp/BDTOPO_3-0_TOUSTHEMES_SHP_LAMB93_D009_2021-09-15.7z BDTOPO_3-0_TOUSTHEMES_SHP_LAMB93_D009_2021-09-15/BDTOPO/1_DONNEES_LIVRAISON_2021-09-00165/BDT_3-0_SHP_LAMB93_D009-ED2021-09-15/ADMINISTRATIF/DEPARTEMENT.*
# On inspecte la structure du shapefile
ogrinfo -so -al DEPARTEMENT.shp
#  Et on fait notre requête d'extraction
# On le reprojette en 4326 car il va nous servir pour découper des données en 4326, et la commande ogr2ogr clipsrc semble nécessiter la même projection que la donnée source (cf + bas)
ogr2ogr -where "INSEE_DEP='09'" -s_srs EPSG:2154 -t_srs EPSG:4326 $WORK_DIR/contours_ariege.shp $WORK_DIR/DEPARTEMENT.shp
# On nettoie
rm $WORK_DIR/DEPARTEMENT.*


# Extraction des données OSM sur l'emprise de l'ariège
##

# on extrait l'archive dans un dossier temporaire
mkdir -p $WORK_DIR/midi-pyrenees-osm
unzip $SRC_DIR/donnees_tp/midi-pyrenees-latest-free.shp.zip -d $WORK_DIR/midi-pyrenees-osm

# et on itère : pour chaque fichier du dossier temporaire, on le coupe
# sur l'Ariège et on le sauve dans notre dossier destination
mkdir -p $WORK_DIR/ariege-osm && cd $WORK_DIR/ariege-osm
for f in $(ls -Sr $WORK_DIR/midi-pyrenees-osm/*.shp) ; do
  if [[ "$f" =~ "building" ]]; then
    echo "Skipping $f (too big)"
  else
    echo "Clipping $f..." ;
    ogr2ogr $(basename -- ${f%.*})_09.shp -clipsrc $WORK_DIR/contours_ariege.shp -lco ENCODING=UTF-8 $f
  fi
done

# et on nettoie
rm -rf $WORK_DIR/midi-pyrenees-osm

```

## Publier un shapefile en base de données
```bash
# On installe psql
sudo apt install postgresql-client
# Et on pousse la couche des routes
SCH=yourusername
ogr2ogr -f PGDUMP -nln roads -lco SCHEMA=$SCH -nlt PROMOTE_TO_MULTI /vsistdout/ $WORK_DIR/ariege-osm/gis_osm_roads_free_1_09.shp | psql -h localhost -p 5433 -d cqpgeom -U cqpgeom -f -

# alternatively, you can do
# shp2pgsql -s 4326 -c -k -W UTF-8 -I $WORK_DIR/ariege-osm/gis_osm_roads_free_1_09.shp roads \
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
gdalwarp -cutline /mnt/d/A5S5/TP/contours_ariege.shp -crop_to_cutline /mnt/d/A5S5/donnees_tp/eu_dem_extract.tif /mnt/d/A5S5/TP/eu_dem_09.tif
```

Inspecter un geotiff
```
gdalinfo /mnt/d/A5S5/TP/eu_dem_09.tif
```

Optimiser un geotiff (tiled + overviews)
```
cd /mnt/d/A5S5/TP/
# Tiled structure + lossless compression
gdal_translate -co "TILED=YES" -co COMPRESS=LZW eu_dem_09.tif eu_dem_09_tiled.tif
# overviews
gdaladdo -r average --config COMPRESS_OVERVIEW LZW eu_dem_09_tiled.tif 2 4 8 16 32
```
**Ou mieux, on fait direct un COG :**
```
gdal_translate -of COG -co COMPRESS=LZW -co BLOCKSIZE=512 -co BIGTIFF=IF_SAFER -co RESAMPLING=AVERAGE -co OVERVIEW_COMPRESS=LZW  eu_dem_09.tif eu_dem_cog.tif
```

Exemple de style SLD pour MNT, avec inclusion d'un ombrage, directement dans le style
```
<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:sld="http://www.opengis.net/sld" version="1.0.0">
  <UserLayer>
    <sld:LayerFeatureConstraints>
      <sld:FeatureTypeConstraint/>
    </sld:LayerFeatureConstraints>
    <sld:UserStyle>
      <sld:Name>eu_dem_09_tiled</sld:Name>
      <sld:FeatureTypeStyle>
        <sld:Rule>
          <sld:RasterSymbolizer>
            <sld:ColorMap type="ramp">
              <sld:ColorMapEntry quantity="0" color="#457428"  label="0"/>
              <sld:ColorMapEntry quantity="376.35934082031253" color="#54822b" label="377,3593"/>
              <sld:ColorMapEntry quantity="377.35934082031253" color="#54822b" label="377,3593"/>
              <sld:ColorMapEntry quantity="754.71868164062505" color="#648f2d" label="754,7187"/>
              <sld:ColorMapEntry quantity="1132.0780224609375" color="#739d30" label="1132,0780"/>
              <sld:ColorMapEntry quantity="1509.4373632812501" color="#83aa32" label="1509,4374"/>
              <sld:ColorMapEntry quantity="1886.7967041015625" color="#92b835" label="1886,7967"/>
              <sld:ColorMapEntry quantity="2264.156044921875" color="#a2c538" label="2264,1560"/>
              <sld:ColorMapEntry quantity="2612.4877441406252" color="#b0d23a" label="2612,4877"/>
              <sld:ColorMapEntry quantity="2902.76416015625" color="#bcdc3c" label="2902,7642"/>
            </sld:ColorMap>
            <ShadedRelief>
              <BrightnessOnly />
              <ReliefFactor>2</ReliefFactor>
            </ShadedRelief>
          </sld:RasterSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </UserLayer>
</StyledLayerDescriptor>

```

Extraire les lignes de niveau à partir du MNT, via GDAL
```
gdal_contour -a ELEV -i 50 eu_dem_09.tif eu_dem_09_contours.shp
```

## Publier une donnée vectorielle comme Vector tiles
### Configurer un service Vector tiles avec GeoServer
1. Installer l'extension vectortiles dans GeoServer (fait, sur notre config, cf le docker-compose.yml)
2. activer le cache sur cete couche de donnée dans GeoServer
3. Dans la rubrique 'cache' de la config de la couche, cocher mapbox vectortiles
C'est fait.

Vous pouvez y accéder depuis QGIS, en ajoutant une source de données de type vector tiles. L'URL à fournir sera du type http://localhost:82/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=jpommier:occsol&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}

(ajuster l'hôte, le nom de la couche, et éventuellement le SRS)

Vous pouvez aussi y accéder dans OpenLayers, cf
- https://docs.geoserver.org/stable/en/user/extensions/vectortiles/tutorial.html
- [les exemples OpenLayers](https://openlayers.org/en/latest/examples/?q=vector+tile)

### Sans GeoServer
Il existe un certain nombre de serveurs dédiés aux vector tiles. Si vous n'avez besoin que de vector tiles, cela peut être une excellente solution. En particulier, j'aime beaucoup pg_tileserv, simple et très performant.
Pour ajouter un service pg_tileserv, vous pouvez ajouter le bloc de config suivant dans le docker-compose.yml (la config est assez basique, mais donne un point de départ)

```
  pg_tileserv:
    image: pramsey/pg_tileserv:latest
    depends_on:
      - postgis
    ports:
      - 7800:7800
    environment:
      - DATABASE_URL=postgres://cpgeom:pass@postgis/cpgeom
```


## Donnée tabulaire
Faire une jointure (code SQL)
```SQL
SELECT *
FROM public.subventions_dsil_2020 as data,
		 public.communes_09 as geo
WHERE data.code_commune_ou_epci = geo.insee_com
```

## Migrer d'un GeoServer local à un GeoServer distant
### Migrer les données
#### Les fichiers
Il suffit de les copier en respectant les mêmes chemins relatifs
```
scp -r ~/docker-compo-geoserver/geoserver_geodata/jpommier debian@sk2.pigeosolutions.fr:docker-compo-geoserver/geoserver_geodata/
```
#### Les données en BD
On fait d'abord une sauvegarde locale. Pas de chance, notre version de psql est plus ancienne que celle de notre postgresql, donc on ne peut pas l'utiliser pour cela. On va lancer pg_dump *depuis* le conteneur postgis :

Sur notre ordinateur, depuis Debian :
```
# On lance le pg_dump depuis le conteneur postgis
docker-compose exec postgis pg_dump -U cqpgeom -d cqpgeom --schema=jpommier > dump_jpommier.sql

# On va le compresser, pour un transfert plus rapide
gzip -9 dump_jpommier.sql

# Et on copie le fichier vers sk2
scp dump_jpommier.sql.gz  debian@sk2.pigeosolutions.fr:
```

Pour la suite, on va opérer sur sk2. Ouvrez une 2e console debian, qu'on va garder ouverte sur sk2 un instant :
```
# se connecte sur sk2 en mode ligne de commande
ssh debian@sk2.pigeosolutions.fr
```
Et sur sk2 :
```
# on dézippe le fichier
gunzip dump_jpommier.sql.gz

# Et on charge le dump dans la base
psql -h localhost -p 5432 -d cqpgeom -U jpommier -f dump_jpommier.sql
```
Il y aura qq messages d'erreurs, c'est normal, le nom d'utilisateur est différent. Mais ça ne devrait pas affecter les données.

### La config GeoServer
On va devoir autoriser sur sk2 l'utilisateur debian à écrire dans le dossier docker-compo-geoserver/geoserver_datadir/workspaces/jpommier/. Sur notre console connectée sur sk2 :
```
# On rend debian propriétaire du dossier (ça ne tiendra pas dans la durée, mais ça fera l'affaire pour le temps de la migration)
sudo chown -R debian docker-compo-geoserver/geoserver_datadir/workspaces/jpommier/
# Et comme ça ne semble pas bien se mélanger avec des données différentes déjà publiées dans le workspace, on le vide du peu de config qu'on y avait déjà mis :
sudo rm -rf  docker-compo-geoserver/geoserver_datadir/workspaces/jpommier/*
```

Puis on copie le workspace depuis notre ordi vers sk2
```
sudo scp -r ~/docker-compo-geoserver/geoserver_datadir/workspaces/jpommier/* debian@sk2.pigeosolutions.fr:docker-compo-geoserver/geoserver_datadir/workspaces/jpommier/
```

Enfin, le mot de passe de notre entrepôt postgis est encrypté et ne sera donc plus valide (clef d'encryption différente), il faut donc aller éditer le fichier datastore.xml correspondant et on efface le contenu de la balise `<passwd>` :
```
nano docker-compo-geoserver/geoserver_datadir/workspaces/jpommier/postgis_jpommier/datastore.xml
```

Pour recharger tout cela, il faut être administrateur de GeoServer. Ou redémarrer le conteneur (`docker-compose restart geoserver`)
Et depuis l'interface graphique, on édite l'entrepôt postgis, on change utilisateur et mot de passe.
