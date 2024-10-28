# NestJS React - Server

O server web prin care artistii isi pot construi un site de tip portofoliu:

- Adauga, editeaza, sterg, seteaza proiecte ca ascunse (inactive)
- Impartasesc cu clientii proiectele vizibile (active)

## Instrutiuni de utilizare

### 1. Cerinte sistem

Pentru a utliza acest proiect, trebuie sa ai:

- [NodeJS si NPM](https://nodejs.org/en/download/package-manager)
- [git](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Credentiale AWS S3](https://aws.amazon.com/s3/) sau a unui API compatibil cu acesta (cum ar fi [Clouldflare R2](https://www.cloudflare.com/developer-platform/r2/))

### 2. Descarcare proiect

Deschide un terminal / command prompt si tasteaza urmatoarele comenzi:

```sh
git clone https://github.com/ginoburdea/nestjs-react--server.git
cd nestjs-react--server
npm install
```

### 3. Variabile de environment

Copiaza fisierul `.env.example` si pune-i numele `.env` (Acest fisier va fi ignorat de git cand un commit este creat)

Deschide noul fisier si inlocuieste variabilele in functie de instructiunie din acesta.

### 4. Migrare baza de date

Ruleaza una dintre comenzile de mai jos pentru a migra data de baze (la creare, baza de date este goala. Comenzile de mai jos creaza tabelele necesare).

```sh
# In mediu de productie
npx prisma migrate deploy

# In mediu de prodezvoltare / testare
npx prisma migrate dev
```

### 5. Comenzi

In functie de obiectivul tau, foloseste una dintre urmatoarele comenzi:

```sh
# Deschidere in modul de dezvoltare (pentru modificari locale si pentru a vedea schimbarile in timp real)
npm run start:dev

# Creaza fisiere de tip "build" ce urmeaza a fi folosite in modul de productie
npm run build

# Deschidere in modul de productie (dupa ce fisierele de tip "build" au fost generate cu comanda de mai sus)
npm start

# Lint fisisere (aplicarea regulilor eslint pentru o calitate imbunatatia a codului)
npm run lint

# Formatare fisisere (aplicarea regulilor prettier pentru un aspect placut al codului)
npm run format

# Rulare teste automate de tip unit si integration
npm test

# Rulare test automate de tip e2e
npm run test:e2e

# Rulare teste automate de tip unit si integration in modul de dezvoltare (repornite automata la acutalizarea fisierelor)
npm run test:watch
```

### 6. Link-uri

Linkurile acestui proiect sunt documentate prin Swagger/OpenAPI.

Pentru a le accesa, porneste serverul cu in modul de dezvoltare (setand `NODE_ENV=development`), apoi:

- acceseaza ruta `/docs`; sau
- acceseaza ruta `/docs-json` pentru a vedea documentul in format JSON

## Instructiuni de dezvoltare

### Strategia de branching

Acest proiect utilizeaza strategia [Feature Branch](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow):

Exista un branch `main` unde se afla codul functional si gata de trimis spre productie si cate un branch pentru fiecare task / user story.

1. Se deschide un task in programul de management (in acest caz, [Jira](https://www.atlassian.com/software/jira))
1. Se creaza un branch pentru acesta
1. Se implementeaza solutia
1. Se deshide un Pull Request pe Github
1. Dupa review, Pull Request-ul se inchide prin strategia "Squash and Merge"
1. Task-ul este mutat in coloana "Done" in programul de management

### Mesajele pentru git commit

Acest proiect urilizeaza strategia [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) pentru mesajele git commit:

```sh
git commit -m "<categorie>: <descriere>"
```

Categoria poate fi: feat, fix, docs, ci, style, refactor, etc.
Iar descrierea este un mesaj scurt despre continutul commit-ului.

## Bine de stiut

Aceast server este conceputa pentru un singur artist.

Daca mai multi isi fac cont, proiectele adaugate vor putea fi vauzte, editate si sterse si de ceilalti artisti.

Asta poate duce la vulenrabilitati, cum ar fi crearea neautorizata de conturi de care vor putea sterge datele artisului.

De accea, ruta de inregistrare accepta o parola de tip master, care nu va permite crearea de cont de catre oricine.

Aceasta parola poate fi setata prin variabila de enviorment `MASTER_PASSWORD` (vezi punctul 2 la instructiuni de utilizare) sau poate fi lasata goala pentru testare mai rapida locala.
