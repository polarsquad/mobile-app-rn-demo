#!/bin/bash
set -ex

APP_NAME="RNTDemoApp" 
RESOURCE_GROUP="rg-rntdemoapp-ci"
ACR_NAME="acrrntdemoapp"
LOCATION="westeurope" # azure region
GHREPO="polarsquad/mobile-app-rn-demo" # here the repo name
AZURE_SUBSCRIPTION_ID="72216f92-4084-4948-bdcd-a6962e1ec38c" # dotnetMalaga demo
AZURE_TENANT_ID="34af557e-1fa3-4d33-a3a6-861c6df23469" # masimalmihotmail.onmicrosoft.com

az login -t $AZURE_TENANT_ID
az account set -s $AZURE_SUBSCRIPTION_ID

az group create -n $RESOURCE_GROUP -l $LOCATION -o none

# Create Service Principal for Github Actions
# https://learn.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation-create-trust?pivots=identity-wif-apps-methods-azcli

AZURE_CLIENT_ID=$(az ad sp create-for-rbac --name "$APP_NAME" --role contributor --scopes "/subscriptions/$AZURE_SUBSCRIPTION_ID" -o json | jq -r '.appId')
AZURE_CLIENT_OBJECT_ID="$(az ad app show --id ${AZURE_CLIENT_ID} --query id -o tsv)"

# https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#example-subject-claims

cat <<EOF > credentials.json
{
    "name": "$APP_NAME",
    "issuer": "https://token.actions.githubusercontent.com/",
    "subject": "repo:$GHREPO:ref:refs/heads/master",
    "description": "GitHub Actions for $APP_NAME",
    "audiences": [
        "api://AzureADTokenExchange"
    ]
}
EOF

az ad app federated-credential create --id $AZURE_CLIENT_OBJECT_ID --parameters credentials.json

# Create Azure Container Registry

az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --location $LOCATION \
  --sku Basic

ACR_ID=$(az acr show -n $ACR_NAME --query id -o tsv)

az role assignment create \
    --assignee $AZURE_CLIENT_ID \
    --role "User Access Administrator" \
    --scope $ACR_ID


# Configure Github secrets to the repository (manually)
# https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure?tabs=azure-cli%2Clinux#create-github-secrets

echo "-- Configure in Github secrets --"
echo "AZURE_CLIENT_ID: $AZURE_CLIENT_ID"
echo "AZURE_TENANT_ID: $AZURE_TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID: $AZURE_SUBSCRIPTION_ID"
echo "--"
