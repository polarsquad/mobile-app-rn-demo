#!/bin/bash
set -ex

ENVIRONMENT="aca-rntdemoapp" 
RESOURCE_GROUP="rg-rntdemoapp"
ACR_NAME="acrrntdemoapp"
LAW_NAME="law-rntdemoapp"
REDIS_NAME="redis-rntdemoapp"
LOCATION="germanywestcentral"
EXTERNAL_SERVICE_NAME="api"
INTERNAL_SERVICE_NAME="background-worker"
IMAGE_TAG=$1

az group create -n $RESOURCE_GROUP -l $LOCATION -o none

az monitor log-analytics workspace create -g $RESOURCE_GROUP -n $LAW_NAME -l $LOCATION

LAW_ID=$(az monitor log-analytics workspace show -g $RESOURCE_GROUP -n $LAW_NAME --query customerId -o tsv)
LAW_KEY=$(az monitor log-analytics workspace get-shared-keys -g $RESOURCE_GROUP -n $LAW_NAME --query primarySharedKey -o tsv)

az identity create \
--name "id-rntdemoapp-$EXTERNAL_SERVICE_NAME" \
--resource-group $RESOURCE_GROUP

az identity create \
--name "id-rntdemoapp-$INTERNAL_SERVICE_NAME" \
--resource-group $RESOURCE_GROUP

az containerapp env create \
  --name $ENVIRONMENT \
  --resource-group $RESOURCE_GROUP \
  --logs-workspace-id $LAW_ID \
  --logs-workspace-key $LAW_KEY \
  --location "$LOCATION"

ACR_ID=$(az acr show -n $ACR_NAME --query id -o tsv)

EXTERNAL_SERVICE_IDENTITY_ID=$(az identity show --name "id-rntdemoapp-$EXTERNAL_SERVICE_NAME" --resource-group $RESOURCE_GROUP --query principalId -o tsv)
az role assignment create \
    --assignee-object-id $EXTERNAL_SERVICE_IDENTITY_ID \
    --assignee-principal-type ServicePrincipal \
    --role AcrPull \
    --scope $ACR_ID

INTERNAL_SERVICE_IDENTITY_ID=$(az identity show --name "id-rntdemoapp-$INTERNAL_SERVICE_NAME" --resource-group $RESOURCE_GROUP --query principalId -o tsv)
az role assignment create \
    --assignee-object-id $INTERNAL_SERVICE_IDENTITY_ID \
    --assignee-principal-type ServicePrincipal \
    --role AcrPull \
    --scope $ACR_ID

# NodeJS Redis client does not support SSL ..
az redis create  \
--location $LOCATION  \
--name $REDIS_NAME  \
--resource-group $RESOURCE_GROUP  \
--sku Basic \
--redis-version 6 \
--vm-size c0 \
--enable-non-ssl-port  

REDIS_HOST=$(az redis show -n $REDIS_NAME -g $RESOURCE_GROUP --query hostName -o tsv)
REDIS_PWD=$(az redis list-keys -n $REDIS_NAME -g $RESOURCE_GROUP --query primaryKey -o tsv)

WORKER_IDENTITY_ID=`az identity show \
  --name "id-rntdemoapp-$INTERNAL_SERVICE_NAME" \
  --resource-group $RESOURCE_GROUP \
  --query id -o tsv`

API_IDENTITY_ID=`az identity show \
  --name "id-rntdemoapp-$EXTERNAL_SERVICE_NAME" \
  --resource-group $RESOURCE_GROUP \
  --query id -o tsv`

# Deploy initial Container Apps

az containerapp create \
  --name "aca-rntdemoapp-$INTERNAL_SERVICE_NAME" \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT \
  --image $ACR_NAME.azurecr.io/$INTERNAL_SERVICE_NAME:$IMAGE_TAG \
  --target-port 3002 \
  --ingress 'internal' \
  --cpu 0.25 \
  --memory 0.5Gi \
  --min-replicas 1 \
  --max-replicas 1 \
  --user-assigned $WORKER_IDENTITY_ID \
  --registry-identity $WORKER_IDENTITY_ID \
  --secrets redispwd=$REDIS_PWD \
  --env-vars REDIS_HOST=$REDIS_HOST REDIS_PORT=6379 REDIS_PW=secretref:redispwd CRON_JOB_SCHEDULE="*/5 * * * *" \
  --registry-server $ACR_NAME.azurecr.io

az containerapp create \
  --name "aca-rntdemoapp-$EXTERNAL_SERVICE_NAME" \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT \
  --image $ACR_NAME.azurecr.io/$EXTERNAL_SERVICE_NAME:$IMAGE_TAG \
  --target-port 3000 \
  --ingress 'external' \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 1 \
  --max-replicas 6 \
  --scale-rule-name my-http-rule \
  --scale-rule-http-concurrency 10 \
  --user-assigned $API_IDENTITY_ID \
  --registry-identity $API_IDENTITY_ID \
  --secrets redispwd=$REDIS_PWD \
  --env-vars REDIS_HOST=$REDIS_HOST REDIS_PORT=6379 REDIS_PW=secretref:redispwd \
  --registry-server $ACR_NAME.azurecr.io
