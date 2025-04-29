#!/bin/bash

DB_CONTAINER_NAME=liberato-db
API_CONTAINER_NAME=liberato-api
DB_USER=root
ORIGINAL_DB=liberato
TEST_DB=liberato_test

echo "Force disconnecting users from test db..."
docker exec $DB_CONTAINER_NAME psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$TEST_DB';"

echo "Dropping test db..."
docker exec $DB_CONTAINER_NAME psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB;"

echo "Preparing new test db..."
docker exec $DB_CONTAINER_NAME psql -U $DB_USER -d postgres -c "CREATE DATABASE $TEST_DB WITH TEMPLATE $ORIGINAL_DB OWNER $DB_USER;"

echo "Running jest tests..."
docker exec $API_CONTAINER_NAME npm run test