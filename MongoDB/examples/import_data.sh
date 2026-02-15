#!/bin/bash

# MongoDB Sample Data Import Script
# This script imports sample data into MongoDB

echo "🔄 Importing sample data into MongoDB..."

# Check if MongoDB is running
if ! mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "❌ Error: MongoDB is not running. Please start MongoDB first."
    echo "   Run: mongod"
    exit 1
fi

# Import the sample data
mongoimport --db=learning_db --collection=items --file=sample_data.json --jsonArray --drop

if [ $? -eq 0 ]; then
    echo "✅ Sample data imported successfully!"
    echo ""
    echo "Verify the import:"
    echo "  mongosh"
    echo "  use learning_db"
    echo "  db.items.countDocuments()"
    echo "  db.items.find().pretty()"
else
    echo "❌ Import failed. Check the error message above."
    exit 1
fi
