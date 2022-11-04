# Instructions for demo setup

1. Create private container registry, service principal and required permissions

```bash
chmod +x demoscript.sh
./demoscript.sh
```

2. Deploy the services to ACA manually using `latest` as image tag

```bash
chmod +x deploy.sh
./deploy.sh latest
```

3. Check that API is returning data

```
curl -i https://<FQDN-OF-API-IN-ACA>/graphql?query=%7BblogCount%7D
```

4. Clean up the whole setup

```bash
az group delete --name rg-rntdemoapp --yes
az group delete --name rg-rntdemoapp-ci --yes
```
