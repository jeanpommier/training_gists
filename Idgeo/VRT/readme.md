# Mise en place d'un flux de publication avec OGR VRT -- exercices pratiques

Faute de mieux, on va jouer avec des données prises essentiellement sur data.gouv.fr.

Si vous avez des données à vous, n'hésitez pas à les mettre en jeux.

## Exercice 1 : publication d'une donnée tabulaire simple et jointure
On va utiliser https://www.data.gouv.fr/fr/datasets/reserve-parlementaire-2011-attribuee-aux-collectivites-territoriales-nd/ et on prendra la donnée _**au format ods**_ (Rue 89).

Avec QGIS et l'extension Spreadsheet Layer, ouvrir la feuille "Département et pauvreté". Cela va générer un VRT correspondant.

Pour comparer, vous pouvez aussi utiliser le script [ogr2vrt_simple](https://github.com/jeanpommier/ogr2vrt_simple).

*Pour la suite, vous aurez toujours le choix : utiliser le script et votre clavier, ou l'interface graphique et la souris.*

Retoucher un peu le VRT si nécessaire pour le rendre plus compatible avec les contraintes d'une base de données, puis le publier en base. Là aussi, vous avez le choix : le publier via QGIS et son database manager (lent) ou bien utiliser [ogr2ogr](./tips/md)

On va aussi publier en BD les contours des départements, pour pouvoir faire une jointure. On n'a pas encore vu les serveurs carto, donc on fera le rendu dans QGIS. Faites-nous une jolie carte mettant en évidence les départmeents les mieux dotés en subventions.

_Attention :_  pour la jointure, vous allez avoir un pb avec les numéros de départements. Pourquoi ?

C'est une erreur classique, qu'il est important de avoir résoudre. On peut le faire à différents niveaux. Dans ce cas ci, on va le faire côté postgresql. Il existe une commande LPAD qui devrait faire votre affaire.

## Exercice 2 : filtrer le contenu à publier
On peut utiliser https://www.data.gouv.fr/fr/datasets/surfaces-cheptels-et-nombre-doperateurs-bio-a-la-commune/. On va publier une carte montrant la proportion occupée par la production agricole bio par rapport à la surface totale, pour chaque commune du Gers, en 2020.

Créez un fichier VRT par le moyen de votre choix, puis éditez-le dans un éditeur de texte.

- Première étape : on filtre les entrées pour ne garder que les données sur le Gers (32). On utilisera une source SrcSql pour cela
- Deuxième étape : ne garde que les colonnes liées à 2020
- On vérifie bien le résultat
- Et puis on publie
- puis jointure et affichage carto

## Exercice 3 : corriger un code directement dans le VRT

On va prendre https://www.data.gouv.fr/fr/datasets/boursiers-par-departement/, le fichier CSV.

On va corriger le code de département dans le VRT directement.

On a vu en exercice 1 comment faire ça dans PostgreSQL. C'est assez facile. Mais ça serait plus satisfaisant de le faire dès le VRT. Malheureusement, la commande LPAD ne marchera pas. En effet, dans VRT, c'est une syntaxe sqlite qui est utilisée (et encore, pas complète, ou alors pas récente).
Le mieux que j'aie trouvé, c'est la syntaxe suivante : `printf("%02d", "numero_departement") AS code_dep`


Vous savez déjà publier et faire une jointure, donc peut-être pas besoin de le refaire ici.

## Exercice 4 : un fichier tabulaire avec coordonnées lat/lon
On prendra https://www.data.gouv.fr/fr/datasets/liste-et-localisation-des-musees-de-france/, version 2022 (fichier xslx).
L'idée est d'afficher les emplacements précis (points) des musées. Nous avons de la chance, ils nous fournissent les coordonnées (lat, lon).
Configurez votre VRT pour en faire un fichier géospatial, utilisant les coordonnées fournies


## Exercice 5 : prendre un fichier distant pour source
Reprenons notre donnée de l'exercice 2. Faire évoluer la définition de la source pour utiliser directement une URL.

_Indice_ : on utilisera `vsicurl` (https://gdal.org/user/virtual_file_systems.html)

A noter que si besoin, on peut même chainer avec un dézippage (`viszip`, `vsigz`).

On pourra s'inspirer de l'article https://static.geotribu.fr/articles/2021/2021-09-07_traiter_fichiers_adresse_gdal_csv_vrt/.

_**Info**_ : dans certains cas, l'extension du fichier n'est pas fournie par le service web. VRT n'est alors pas capable de détecter le type de fichier et ça ne marche plus. Dans le cas bien particulier d'un CSV (ne marche pas pour d'autres extensions), on peut expliciter le format par la syntaxe suivante :
`<SrcDataSource>CSV:/vsicurl/https://....</SrcDataSource>`. Noter le `CSV:` devant `vsicurl`

## Exercice 6 : union de jeux de données
Pour celui là, j'ai récupéré des données ailleurs que sur data.gouv.fr. J'ai un peu triché, on aurait pu les récupérer déjà ensemble. Mais ce n'est pas toujours le cas.

Données dispo dans le dossier [union](./union). Vous pouvez les télécharger via les liens suivants :
- [EN17-1999.xls](https://github.com/jeanpommier/training_gists/blob/main/Idgeo/VRT/union/EN17-1999.xls?raw=true)
- [EN17-2009.xls](https://github.com/jeanpommier/training_gists/blob/main/Idgeo/VRT/union/EN17-2009.xls?raw=true)

## Exercice 7 :  on automatise

Il y a plein de façons d'automatiser un flux de publication. Nous allons rester sur un cas de figure assez simple : actualisation régulière d'une donnée via une tâche planifiée (crontab) sur un serveur linux.

Nous utiliserons la donnée de l'exercice 5. A défaut d'accéder à un serveur, on va activer temporairement cron sur votre instance WSL2. Dans une console linux : 
```
# On regarde si cron tourne (en principe non)
sudo service cron status
# S'il n'est en effet pas activé, on le démarre
sudo service cron start
```

Vous avez noté la commande utilisée pour la publication de l'exercice 5 ? Allez, on l'automatise.

Pouvez-vous pensez à d'autre scenari possibles/souhaitables ?

## Exercice 8 : faisons une 'appli' basique de crowdsourcing
Google Sheet est capable d'exposer son contenu sur le web au format CSV : Fichier->Partager->Publier sur le web. Il faut bien faire attention à 
- définir un lien pour le document complet, pas juste la feuille
- choisir un format CSV
- activer la publication

Nous allons utiliser une feuille Google Sheet pour collecter des observations d'ours sur l'Ariège
- J'ai créé une feuille, sur laquelle vous pouvez saisir vos observations de plantigrades : https://docs.google.com/spreadsheets/d/1S5FwbLntADv9ztYlmUrHw83PFOyWCycM5WD8308ttBo/edit?usp=sharing
- Créer le fichier VRT qui permet de publier cette donnée
- La publier en BD
- La joindre avec la couche des communes, filtrée sur l'Ariège
- Faire une jolie carte.

Avec une tâche cron, on peut mettre cette donnée à jour toutes les qq minutes, et avoir une carte quasi temps-réel

## Exercice 9
... ah, ben, y'en a plus.

On peut regarder qq cas concrets dans lesquels le VRT m'a bien servi et fait gagner beaucoup de temps :
- https://github.com/pi-geosolutions/vrt2rdf
- un cas de réorganisation des données, pour le projet [SAGUI](https://sagui.hydro-matters.fr/sagui/)

Combiné à un peu de code python, on peut faire des miracles en termes de traitement de données.

Ah, et j'oubliais : notez dans la doc de vrt2rdf comment on peut même [pointer vers une source WFS](https://github.com/pi-geosolutions/vrt2rdf#connect-any-data-source-using-the-vrt)

## Nettoyage
Avant de quitter votre ordi, prenez le temps de stopper votre service cron : dans une console WSL2, lancez la commande
```
sudo service cron stop
```