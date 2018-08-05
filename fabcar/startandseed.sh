#!/bin/bash

./startFabric.sh node
node enrollAdmin.js
node registerMerchant.js
node registerProvider.js
node query.js
