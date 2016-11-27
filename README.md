# A simple watcher/notifier for Reddit's /r/buildapcsales

[![David dependency status](https://david-dm.org/Ezekiel-DA/deals-watcher/status.svg)](https://david-dm.org/Ezekiel-DA/deals-watcher)
[![David devDependency status](https://david-dm.org/Ezekiel-DA/deals-watcher/dev-status.svg)](https://david-dm.org/Ezekiel-DA/deals-watcher?type=dev)

# Quickstart

Create a `secrets.env` containing:
```
deals_mailgun_api=<your Mailgun API key>
deals_mailgun_domain=<your Mailgun originating domain>
deals_mail_to=<the destination email to notify>
```

Then `docker-compose up` !