# Instructions for demo setup

## Prerequisites

- Bash
- `openssl` & `awk`
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- Azure subscription and `Owner` privileges

## Manual steps

1. Generate lower case random string

```bash
RAND=$(openssl rand -base64 6 | awk '{print tolower($0)}')
```

2. Create private container registry, service principal and assign required permissions

```bash
chmod +x setup.sh
LOCATION="germanywestcentral"
GHREPO="polarsquad/mobile-app-rn-demo"

az login
DEFAULT_AZURE_SUBSCRIPTION_ID=$(az account show --query id -o tsv)

./setup.sh $RAND $LOCATION $GHREPO $DEFAULT_AZURE_SUBSCRIPTION_ID
```

3. Deploy the services to ACA manually using `latest` as image tag

```bash
chmod +x deploy.sh

./deploy.sh $RAND $LOCATION latest
```

  Note: If deploying from scratch it takes 15-20 minutes to provision all the Azure services.

4. Check that API is returning data

```
API_FQDN=$(az containerapp list --environment aca-rntdemoapp-$RAND --query "[?contains(name, 'api')].properties.configuration.ingress.fqdn" -o tsv)
  
curl -i "https://$API_FQDN/graphql?query=%7BblogCount%7D"
```

**If it's not returning data (blogCount: 0), restart it's revision and check again**

4. Clean up the whole setup

```bash
az group delete --name "rg-rntdemoapp-$RAND" --yes
az group delete --name "rg-rntdemoapp-$RAND-ci" --yes
```
