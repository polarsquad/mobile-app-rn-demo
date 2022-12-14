#!/bin/bash
set -ex

ENVIRONMENT="aca-rntdemoapp-$1" 
RESOURCE_GROUP="rg-rntdemoapp-$1"
ACR_NAME="acrrntdemoapp$1"
LAW_NAME="law-rntdemoapp-$1"
REDIS_NAME="redis-rntdemoapp-$1"
LOCATION=$2
EXTERNAL_SERVICE_NAME="api"
INTERNAL_SERVICE_NAME="worker"
IMAGE_TAG=$3

az group create -n $RESOURCE_GROUP -l $LOCATION -o none

az monitor log-analytics workspace create -g $RESOURCE_GROUP -n $LAW_NAME -l $LOCATION

LAW_ID=$(az monitor log-analytics workspace show -g $RESOURCE_GROUP -n $LAW_NAME --query customerId -o tsv --only-show-errors)
LAW_KEY=$(az monitor log-analytics workspace get-shared-keys -g $RESOURCE_GROUP -n $LAW_NAME --query primarySharedKey -o tsv --only-show-errors)

az identity create \
--name "id-rntdemoapp-$1-$EXTERNAL_SERVICE_NAME" \
--resource-group $RESOURCE_GROUP

az identity create \
--name "id-rntdemoapp-$1-$INTERNAL_SERVICE_NAME" \
--resource-group $RESOURCE_GROUP

az containerapp env create \
  --name $ENVIRONMENT \
  --resource-group $RESOURCE_GROUP \
  --logs-workspace-id $LAW_ID \
  --logs-workspace-key $LAW_KEY \
  --location "$LOCATION"

ACR_ID=$(az acr show -n $ACR_NAME -g "rg-rntdemoapp-$1-ci" --query id -o tsv)

EXTERNAL_SERVICE_IDENTITY_ID=$(az identity show --name "id-rntdemoapp-$1-$EXTERNAL_SERVICE_NAME" --resource-group $RESOURCE_GROUP --query principalId -o tsv --only-show-errors)
az role assignment create \
    --assignee-object-id $EXTERNAL_SERVICE_IDENTITY_ID \
    --assignee-principal-type ServicePrincipal \
    --role AcrPull \
    --scope $ACR_ID

INTERNAL_SERVICE_IDENTITY_ID=$(az identity show --name "id-rntdemoapp-$1-$INTERNAL_SERVICE_NAME" --resource-group $RESOURCE_GROUP --query principalId -o tsv --only-show-errors)
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
REDIS_PWD=$(az redis list-keys -n $REDIS_NAME -g $RESOURCE_GROUP --query primaryKey -o tsv --only-show-errors)

WORKER_IDENTITY_ID=`az identity show \
  --name "id-rntdemoapp-$1-$INTERNAL_SERVICE_NAME" \
  --resource-group $RESOURCE_GROUP \
  --query id -o tsv`

API_IDENTITY_ID=`az identity show \
  --name "id-rntdemoapp-$1-$EXTERNAL_SERVICE_NAME" \
  --resource-group $RESOURCE_GROUP \
  --query id -o tsv`

# Deploy Container Apps
# Check if already exists - in which case deploy new revision

CONTAINER_APP_INTERNAL_NAME=$ENVIRONMENT-$INTERNAL_SERVICE_NAME
CONTAINER_APP_INTERNAL_ID=$(az containerapp list --environment $ENVIRONMENT --resource-group $RESOURCE_GROUP --query "[?contains(name, '$CONTAINER_APP_INTERNAL_NAME')].id" -o tsv)
if [ -z "$CONTAINER_APP_INTERNAL_ID" ]; then
    echo "Deploy initial revision for container app $CONTAINER_APP_INTERNAL_NAME"
    
    az containerapp create \
    --name $CONTAINER_APP_INTERNAL_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment $ENVIRONMENT \
    --image $ACR_NAME.azurecr.io/background-worker:$IMAGE_TAG \
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
else
    echo "Deploy new revision for container app $CONTAINER_APP_INTERNAL_NAME"
    az containerapp update \
    --name $CONTAINER_APP_INTERNAL_NAME \
    --resource-group $RESOURCE_GROUP \
    --image $ACR_NAME.azurecr.io/$INTERNAL_SERVICE_NAME:$IMAGE_TAG
fi

CONTAINER_APP_EXTERNAL_NAME=$ENVIRONMENT-$EXTERNAL_SERVICE_NAME
CONTAINER_APP_EXTERNAL_ID=$(az containerapp list --environment $ENVIRONMENT --resource-group $RESOURCE_GROUP --query "[?contains(name, '$CONTAINER_APP_EXTERNAL_NAME')].id" -o tsv)
if [ -z "$CONTAINER_APP_EXTERNAL_ID" ]; then
    echo "Deploy initial revision for container app $CONTAINER_APP_EXTERNAL_NAME"
    
    az containerapp create \
    --name $CONTAINER_APP_EXTERNAL_NAME \
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
else
    echo "Deploy new revision for container app $CONTAINER_APP_EXTERNAL_NAME"
    az containerapp update \
    --name $CONTAINER_APP_EXTERNAL_NAME \
    --resource-group $RESOURCE_GROUP \
    --image $ACR_NAME.azurecr.io/$EXTERNAL_SERVICE_NAME:$IMAGE_TAG
fi
