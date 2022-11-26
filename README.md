# wikidata-animanga-db-matcher-backend

Backend for the Wikidata animanga matcher

## Setup

### 1. Symlink

At the root of the project, make a symlink to the `dist` folder on the frontend named `frontend-dist`:

```bash
ln -s ../wikidata-animanga-db-matcher-frontend/dist/ frontend-dist
```

Alternatively, you can copy/move the dist folder and rename it to `frontend-dist`.

### 2. Install dependencies

```bash
npm ci
```

### 3. Run

```bash
npm start
```
