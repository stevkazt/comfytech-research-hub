#!/bin/bash

# Script to upload products from products_db.json to the API
API_URL="http://localhost:3000/products"
JSON_FILE="/Users/johanncastellanos/dropi-app/data/products_db.json"

echo "🚀 Starting product upload to API..."
echo "📁 Reading from: $JSON_FILE"
echo "🌐 API endpoint: $API_URL"
echo ""

# Get total number of products
total_products=$(jq length "$JSON_FILE")
echo "📊 Found $total_products products to upload"
echo ""

# Initialize counters
success_count=0
error_count=0

# Process each product
for i in $(seq 0 $((total_products - 1))); do
    # Extract product data
    product=$(jq ".[$i]" "$JSON_FILE")
    product_id=$(echo "$product" | jq -r '.id')
    product_name=$(echo "$product" | jq -r '.name')
    
    echo "[$((i + 1))/$total_products] Uploading: ID $product_id - $product_name"
    
    # Send POST request
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$product" \
        "$API_URL")
    
    # Extract HTTP status
    http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*$//')
    
    # Check result
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo "   ✅ Success (HTTP $http_code)"
        success_count=$((success_count + 1))
    else
        echo "   ❌ Failed (HTTP $http_code): $response_body"
        error_count=$((error_count + 1))
    fi
    
    sleep 0.1
done

echo ""
echo "📈 Upload Summary:"
echo "   ✅ Successful: $success_count"
echo "   ❌ Failed: $error_count"
echo "   📊 Total: $total_products"

if [ $error_count -eq 0 ]; then
    echo "🎉 All products uploaded successfully!"
else
    echo "⚠️  Some products failed to upload."
fi
