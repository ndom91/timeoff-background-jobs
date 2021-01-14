# NewTelco Vacation - Background Job

## 📦 Description

Designed for [newtelco/timeoff](https://github.com/newtelco/timeoff).

Once yearly background job to update everyone's earned vacation days once the new year roles around.

Can be run manually or set as a cronjob on some VPS. Ideally it would be scheduled via a Github Action or setup as a cloudflare Worker and run on a crontimer 01.01. every year.

## 🎉 Getting Started

1. Clone repository

```
git clone https://github.com/ndom91/nt-vacation-yearly-fn
```

2. Install dependencies

```
cd nt-vacation-yearly-fn && npm install
```

3. Create your own copy of `.env` and enter the appropriate mysql database details

```
cp .env.example .env
vim .env
```

4. Run it in 'dry-run' mode

```
npm start
```

If you're happy with the output and want to write to the DB, you can run

```
npm run start:write
```

## 📋 License

MIT
