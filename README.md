# Liberato

## Dev env setup

### Step 1 - generate ssl certs
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

### Step 2 - docker installation