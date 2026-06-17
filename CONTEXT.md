# Stockage d'objets avec replication

Gestionnaire de fichiers pour stocker des données dans un bucket principal avec réplication automatique vers un bucket froid. Permet upload, consultation de l'historique, et restauration depuis le backup.

## Language

**Bucket Principal** (Hot Storage)
Le stockage actif où les fichiers sont uploadés par l'utilisateur. C'est la source de travail courante.
_Avoid_: Bucket chaud, storage actif, production bucket

**Bucket Froid** (Cold Storage)
Archive de sauvegarde où les fichiers du principal sont répliqués automatiquement. Utilisé pour la restauration en cas de besoin.
_Avoid_: Bucket backup, archive bucket, disaster recovery bucket

**Restauration**
Action de reconstruire le bucket principal comme copie miroir exacte du bucket froid : chaque objet du froid est copié ou écrasé dans le principal, et chaque objet du principal absent du froid est supprimé.
_Avoid_: Restore, recovery, sync, écrasement additif

**Upload**
Action de télécharger un fichier depuis le navigateur vers le bucket principal.
_Avoid_: File upload, submit

**Objet** (Object)
Un fichier stocké dans un bucket S3.
_Avoid_: File, artefact, asset
