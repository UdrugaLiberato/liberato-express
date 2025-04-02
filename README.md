# Liberato

## Dev env setup

### Step 1 - ssl/localhost setup
- MacOS
```bash
openssl genrsa -out nginx/ssl/private/liberato.key 2048
openssl req -new -x509 -key nginx/ssl/private/liberato.key -out nginx/ssl/certs/liberato.crt -days 365 -subj "/CN=liberato.local" -addext "subjectAltName=DNS:liberato.local"
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain nginx/ssl/certs/liberato.crt
```
```bash
sudo vim /etc/hosts
127.0.0.1 liberato.local # add this line
```

If needed, import your .crt file into browser (usually firefox).

- Windows
@TODO
- Linux
@TODO

### Step 2 - docker installation
```bash
# use docker desktop or colima
# navigate to project directory
docker compose up --build -d
```
Containers access:
```bash
docker exec -ti -u 0 liberato-api bash
docker exec -ti -u 0 liberato-nginx bash
docker exec -ti -u 0 liberato-db bash
```

### Step 3 - database

Accessing db:
```bash
psql -U root -d liberato
```

Importing sql dump:
```bash
# from db container:
psql -U root -d liberato -f db_dumps/dump_file_name.sql
```


