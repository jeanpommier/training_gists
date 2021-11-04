# Not intended to be used as-is. This is a collection of commands to adjust and run in a shell

# log into the portal using SSH (use your username)
ssh -p 2225 [youruserid]@geoportalksk.sk

# Open a SSH tunnel
ssh -L 15432:postgis-userdb:5432 -p 2225 [youruserid]@geoportalksk.sk

# Change file (e.g. CSV file) encoding: on Windows, if you have OSGEO4W shell, you can use it and type:
# to convert from Windows 1250 (Slovak default encoding) to UTF8
# on Windows, if you have OSGEO4W shell, you can use it and type:
uconv  -f windows-1250 -o dotacie_utf8.csv dotacie.csv

#######################
## Geocoding
#######################

# Get coordinates for a single address (curl is available from the OSGEO4W shell)
curl -G "https://geocoder.geoportalksk.sk/search/" --data-urlencode "q=Banícke námestie 441, Gelnica"
# Or open this URL in your browser
https://geocoder.geoportalksk.sk/search/?q=Banícke námestie 441, Gelnica

# Geocode a CSv file
curl -o GrantsKSK_geo.csv -X POST -F data=@c:\tmp\GrantsKSK.csv --form-string columns='Predkladateľ' --form-string encoding=windows-1250 https://geocoder.geoportalksk.sk/search/csv/


#######################
## VRT
#######################

# SQL view for job_seekers data, in geoserver
select t.*, geo.geom
FROM training_di1.jpommier_job_seekers AS t
LEFT JOIN training_di1.jpommier_admin_units_obce AS geo
ON t.kod_obce_idn4::Integer = geo.idn4

# For the VRT definition, see in this folder
# Convert from VRT to CSV (to feed to geocoder). From the OSGEO4W shell:
ogr2ogr education_facilities_kosicky.csv education_facilities_kosicky.vrt

# geocode the file
curl -o education_facilities_kosicky_geo.csv -X POST -F data=@education_facilities_kosicky.csv --form-string columns='Obec' --form-string columns='Ulica' --form-string columns='OrientacneCislo' --form-string columns='PSC' https://geocoder.geoportalksk.sk/search/csv/


#######################
## SQL
#######################

# Create a 'freq' field, where the 'n/a' or 'N/A' values are replaced by null values (no data). Cast the field to Integer type
# Run this is a SQL query window
# The table is taken from mrc_ark_tab. The frekvencia field is one of the frekvencia something fields, renamed to frekvencia_vyvazania when published (using VRT)
SELECT *,
CASE LOWER(frekvencia_vyvazania) WHEN 'n/a' THEN null ELSE frekvencia_vyvazania::Integer END AS freq
FROM training_di1.jpommier_mrc_ark_tab;

# On GeoServer
# Join with geospatial table
SELECT t.*, geo.geom, geo.idn4
FROM training_di1.jpommier_mrc_ark_tab  AS t
LEFT JOIN  training_di1.jpommier_admin_units_obce AS geo
ON t.kod_obce::Integer = geo.idn4
ORDER BY t.id::Integer

# same join, but with the cleaned freq field
SELECT t.*,
CASE LOWER(t.frekvencia_vyvazania) WHEN 'n/a' THEN null ELSE t.frekvencia_vyvazania::Integer END AS freq
,
geo.geom, geo.idn4
FROM training_di1.jpommier_mrc_ark_tab  AS t
LEFT JOIN  training_di1.jpommier_admin_units_obce AS geo
ON t.kod_obce::Integer = geo.idn4
ORDER BY t.id::Integer


#######################
## QGIS
#######################
# Field calculator
# Same thing than above, but on the field calculator
CASE WHEN lower( "frekvencia_vyvazania" )  = 'n/a'
THEN NULL
ELSE to_int( "frekvencia_vyvazania" )
END
