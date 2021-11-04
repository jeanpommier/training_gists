#!/bin/bash

WORK_DIR=/mnt/geoserver_geodata/users_data/jpommier/trainings/di1
cd $WORK_DIR/
echo "Retrieve the data from online source"
ogr2ogr education_facilities_kosicky.csv education_facilities_kosicky.vrt
echo "Geocode the CSV file"
curl -o education_facilities_kosicky_geo.csv -X POST -F data=@education_facilities_kosicky.csv --form-string columns='Obec' --form-string columns='Ulica' --form-string columns='OrientacneCislo' --form-string columns='PSC' https://geocoder.geoportalksk.sk/search/csv/
# Create a vrt file for the geocoded dataset. You can use https://raw.githubusercontent.com/jeanpommier/training_gists/main/KSK/data_integration/education_facilities_kosicky_geo.vrt
echo "Publish to the DB"
ogr2ogr -lco SCHEMA=training_di1 -lco CREATE_SCHEMA=OFF -f PGDump /vsistdout/ education_facilities_kosicky_geo.vrt | psql -h postgis-userdb -d georchestra -U jpommier -f -
