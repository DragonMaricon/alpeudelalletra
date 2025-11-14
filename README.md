# @lpeudelalletra


## Què és això?

Pràcticament, des de la fundació de l'Institut Can Puig, els alumnes de primer de Batxillerat de Cultura Audiovisual han treballat aquesta revista, primerament anomenada Alpeudelalletra, després reanomenada Elpeudelalletra, i finalment, amb la seva digitalització, el seu nom actual.

Aquí és on es publiquen les últimes notícies del centre, escrites pels alumnes de primer de Batxillerat.


## Qui ho ha fet?

Tot aquest codi ha estat escrit per dos alumnes de primer de Batxillerat, Joel Marín i Enric Alegria. Si estàs llegint això i no ets cap dels dos, probablement ets un curiós o et toca mantenir el codi (bona sort, la necessitaràs).


## Per què s'ha fet?

La revista digital, en un principi era una pàgina feta amb WordPress, amb un disseny poc òptim i un flux de treball encara pitjor. Cada trimestre, s'escollien uns dissenyadors que havien de millorar el disseny i a més a més, afegir manualment cada article que es volia publicar.


## Nou tech stack

* **Framework** → [Remix](https://remix.run/)
* **Llenguatge** → JavaScript
* **Estils** → CSS tal qual
* **DB/Auth/Storage** → [Supabase](https://supabase.com/)
* **Package manager** → [yarn](https://yarnpkg.com/)
* **Version control** → [Git](https://git-scm.com/)


## Prerequisits

Has de tenir tot això instal·lat a la teva màquina:

* [Git](https://git-scm.com/) — Simplement descarrega i executa l'instal·lador (si ets a Windows, si no, probablement ja saps el que estas fent).
* [Node.js](https://nodejs.org/) — Sempre LTS, recomanada la versió 22. Instal·la igual que el Git.
* [yarn](https://yarnpkg.com/) — Amb Node ja instal·lat, obre el terminal i escriu `npm install -g corepack`.


## Com executar el projecte?

1. Clona el repositori

```bash
git clone https://github.com/DragonMaricon/alpeudelalletra.git
cd alpeudelalletra
```

2. Instal·la les dependències

```bash
yarn install
```

3. Executa en mode de desenvolupament

```bash
yarn dev
```

Això arrencarà el servidor de desenvolupament, podràs accedir a `http://localhost:3000`. En aquest mode, pots editar el codi i veure el resultat en temps real.

4. Compila el projecte per producció

```bash
yarn build
```

5. Executa en mode de producció

```bash
yarn start
```

---

Per tant, per executar el codi mentre desenvolupes, fes servir `yarn dev` per veure els canvis en temps real, i quan l'executis a producció, compila primer amb `yarn build`, i després executa amb `yarn start`. Tingués en compte que la pàgina compilada no se'n puja al repositori remot (GitHub).

NO editis el codi directament a la branca `main`, i tracta de no fer-ho tampoc a `dev`. Més informació endavant.


## Com contribuir?

Assumeixo que ja saps menys o menys com fer servir el Git. Si no, millor no posis les mans aquí.

### Branques principals

* `main`: Codi de producció. És la branca sagrada. Només hi ha de caure codi que funcioni 100% i que ja estigui provat. Ni se t'acudeixi fer push directament aquí.
* `dev`: Branca de desenvolupament principal. Aquí es fusionen els canvis un cop ja funcionen localment, però abans de passar-los a `main`.

---

Quan clonis el repositori, la branca principal serà `main`. Per canviar a la branca `dev`:

```bash
git checkout dev
```

Per veure en quina branca estem:

```bash
git branch
```

### Branques personals o forks

Quan vulguis afegir una funcionalitat nova o corregir alguna cosa:

1. Crea una branca nova des de `dev`:

```bash
# Ens assegurem que estem a la branca dev
git checkout dev

# Obtenim els canvis més recents de la branca dev
git pull

# Creem (i entrem a) la nostra branca
git checkout -b nom-de-la-teva-branca
```

Exemple: `git checkout -b fix-header-mobile` o `feature-searchbar`.

2. Fes els canvis que vulguis. No facis més d'una cosa a la vegada, cada branca ha de tenir només un canvi, i hauria d'editar només els arxius necessaris.

3. Fes el _commit_ i puja els canvis:

```bash
git add .
git commit -m "Millorat el disseny del header en mòbil"

git push -u origin nom-de-la-teva-branca
```
4. Obre un _pull request_ cap a `dev` a GitHub:
   1. Explica què has canviat i per què.
   2. No facis _merge_ fins que algú més (idealment Joel o una persona amb dos dits de front) ho revisi.

### Bones pràctiques

* Fes _pull_ de `dev` abans de començar a treballar.
* No deixis codi comentat sense motiu.
* No facis _commit_ de fitxers de configuració locals o merda de l’editor (`.vscode`, `.env`, `node_modules`, etc). L'arxiu `.gitignore` s'assegura de que no s'afegeixen, però assegura't igualment.
* Si es trenca alguna cosa, revert i demana ajuda abans de fer més mal.
* Formata el codi abans de publicar-lo.

### Format i estil de codi

* Fer servir tabulacions de quatre espais de manera consistent.
* Evita l'ús de _var_.
* Comenta només quan cal.
