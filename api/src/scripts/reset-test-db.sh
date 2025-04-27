#!/bin/bash

CONTAINER_NAME=liberato-db
DB_USER=root
ORIGINAL_DB=liberato
TEST_DB=liberato_test

echo "Dropping test db..."
docker exec $CONTAINER_NAME psql -U root -d postgres -c "DROP DATABASE IF EXISTS liberato_test"
echo "Preparing new test db..."
docker exec $CONTAINER_NAME psql -U root -d postgres -c "CREATE DATABASE $TEST_DB WITH TEMPLATE $ORIGINAL_DB OWNER $DB_USER;"
