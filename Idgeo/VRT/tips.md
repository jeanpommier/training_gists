# Infos utiles

## Connexion à la base de données

On utiliser la composition docker utilisée pour la formation GeoServer. Soit localement, soit sur le serveur distant sk2.

Localement, cela devrait se faire sans souci, la BD sera accessible depuis votre machine directement.

Si on cible la BD hébergée sur sk2, elle n'est pas accessible de l'extérieur, uniquement depuis sk2 lui-même. On devra donc ouvrir un *tunnel SSH*, qui nous permettra de faire correspondre un port de notre machine (localhost) avec le port 5432 de la machine *comme si on était dessus*, via une connection cryptée SSH.

La commande est la suivante :
```
ssh -L 15432:localhost:5432 my_user@my_server
```
*Il faudra garder cette connection ssh ouverte tout le temps qu'on voudra accéder à la base à distance*
Et la BD sera accessible localement, sur notre ordi, à localhost:15432

**Note** :
- sous Windows, ça peut aussi se configurer, avec un outil comme Putty par exemple
- pgadmin4 aussi, sait configurer une connexion via tunnel SSH. Le hic étant qu'on ne va pas utiliser que pgadmin4, donc ça ne fera pas l'affaire ici. QGIS par exemple a besoin qu'on établisse le tunnel par nous-même.


## Changer l'encodage d'un fichier
VRT nécessite qu'on travaille avec des fichiers en UTF8. Si ce n'est pas le cas, on doit changer l'encodage préalablement. Par exemple, en ligne de commande, avec la commande suivante :
```
uconv -f windows-1252 -o monfichier-utf8.csv monfichier.csv
```

## Publier un fichier en BD avec ogr
```
# On met le nom du schéma en variable
SCH=yourusername

# Ou bien on passe par un dump PG (utile dans certains cas)
ogr2ogr -f PGDUMP -nln roads -lco PG_USE_COPY=YES -lco SCHEMA=$SCH -nlt PROMOTE_TO_MULTI /vsistdout/ roads.vrt | psql -h localhost -p 5433 -d cqpgeom -U cqpgeom -f -


# Ou bien on utilise le driver PostgreSQL d'OGR
ogr2ogr -f "PostgreSQL" -nln "roads" -nlt PROMOTE_TO_MULTI -lco PG_USE_COPY=YES -lco SCHEMA=$SCH PG:"dbname='cqpgeom' host='localhost' port='5433' user='cqpgeom' password='pass'" roads.vrt
```
