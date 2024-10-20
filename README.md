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

### 4. Comenzi

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

## Bine de stiut

Aceast server este conceputa pentru un singur artist.

Daca mai multi isi fac cont, proiectele adaugate vor putea fi vauzte, editate si sterse si de ceilalti artisti.

Asta poate duce la vulenrabilitati, cum ar fi crearea neautorizata de conturi de care vor putea sterge datele artisului.

De accea, ruta de inregistrare accepta o parola de tip master, care nu va permite crearea de cont de catre oricine.

Aceasta parola poate fi setata prin variabila de enviorment `MASTER_PASSWORD` (vezi punctul 2 la instructiuni de utilizare) sau poate fi lasata goala pentru testare mai rapida locala.
