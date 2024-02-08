# QQ astuces avec OGR

## ogrinfo : inspecter une donnée vecteur

Sans option, ogrinfo renvoie très peu d'infos. La liste des couches contenues par la source de données

J'aime souvent récupérer plus d'infos que ça, mais pas trop. 

```
ogrinfo -so -al macouche.gpkg
```
marche bien

L'air de rien, ça vous permet de récupérer pas mal d'infos, sans avoir à ouvrir QGIS, charger la couche, ouvrir les propriétés etc

## ogr2ogr : le couteau suisse

On peut presque tout faire avec ogr2ogr. Voir la doc, c'est important.

QQ commandes très fréquemment utilisées : 
- Afficher dans la console le contenu de la couche couche1 du geopackage. Pratique pour explorer le contenu d'une donnée
```
ogr2ogr -f CSV /stdout/ monfichier.gpkg couche1
```
- Publier une donnée en base (postgresql).

  Pour alléger la ligne de commande, j'utilise des variables d'environnement pour déclarer les paramètres de connexion. Je ne les ai pas nommées au hasard. Pour que psql et ogr les reconnaissent, il faut suivre une convention. Cf. https://docs.postgresql.fr/15/libpq-envars.html.

  On aurait aussi pu écrire un fichier .pgpass comme documenté dans https://docs.postgresql.fr/10/libpq-pgpass.html.
  Ici, on utilise qq options en plus :
    - `-nln` pour nommer la table
    - `-lco OVERWRITE=YES` pour remplacer le contenu
    - `-lco SCHEMA=destschema` pour désigner le schema de destination
  Et puis comme j'ai dit : [voir la doc](https://gdal.org/programs/ogr2ogr.html) 
```
export PGPASSWORD=secret  # Remplacer par le vrai mdp bien sûr
# Et pour simplifier les paramètres de connexion, on peut faire pareil avec le reste : 
export PGDATABASE=cpgeom
export PGUSER=cpgeom
export PGHOST=localhost

ogr2ogr -progress -f PostgreSQL PG:"host='$PGHOST' user='$PGUSER' dbname='$PGDATABASE'" -nln "roads" -nlt PROMOTE_TO_MULTI -lco OVERWRITE=YES -lco SCHEMA=destschema monfichier.gpkg couche1
```




