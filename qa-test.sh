#!/bin/bash

echo "🧪 Fitness Tracker - Complete QA Testing"
echo "========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

test_result() {
  local status=$1
  local name=$2
  local detail=$3
  
  if [ "$status" = "PASS" ]; then
    echo -e "${GREEN}✅ PASS${NC} - $name"
    [ -n "$detail" ] && echo -e "   ${BLUE}ℹ️  $detail${NC}"
    ((PASS++))
  elif [ "$status" = "FAIL" ]; then
    echo -e "${RED}❌ FAIL${NC} - $name"
    [ -n "$detail" ] && echo -e "   ${RED}⚠️  $detail${NC}"
    ((FAIL++))
  else
    echo -e "${YELLOW}⚠️  WARN${NC} - $name"
    [ -n "$detail" ] && echo -e "   ${YELLOW}ℹ️  $detail${NC}"
    ((WARN++))
  fi
}

echo "📋 Test 1: Server Status"
echo "------------------------"
if pgrep -f "next dev -p 3001" > /dev/null; then
  test_result "PASS" "Server Process" "PID: $(pgrep -f 'next dev -p 3001' | head -1)"
else
  test_result "FAIL" "Server Process" "Not running"
fi

if ss -tlnp 2>/dev/null | grep -q ":3001"; then
  test_result "PASS" "Port 3001 Listening"
else
  test_result "FAIL" "Port 3001 Listening" "Port not open"
fi

echo ""
echo "📋 Test 2: API Endpoints"
echo "------------------------"

# Test homepage
response=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.131.21:3001 2>/dev/null)
if [ "$response" = "200" ]; then
  test_result "PASS" "Homepage (/)" "HTTP 200"
else
  test_result "FAIL" "Homepage (/)" "HTTP $response"
fi

# Test meals API
response=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.131.21:3001/api/meals 2>/dev/null)
if [ "$response" = "200" ]; then
  test_result "PASS" "Meals API (GET)" "HTTP 200"
else
  test_result "FAIL" "Meals API (GET)" "HTTP $response"
fi

echo ""
echo "📋 Test 3: Database"
echo "------------------------"

DB_PATH="/home/user01/fitness-tracker/fitness.db"
if [ -f "$DB_PATH" ]; then
  test_result "PASS" "Database File" "Found at $DB_PATH"
  
  # Check tables
  tables=$(sqlite3 $DB_PATH ".tables" 2>/dev/null)
  required_tables=("users" "profiles" "meals" "weight_logs" "water_logs" "exercises")
  
  for table in "${required_tables[@]}"; do
    if echo "$tables" | grep -q "$table"; then
      test_result "PASS" "Table: $table" "Exists"
    else
      test_result "FAIL" "Table: $table" "Missing"
    fi
  done
  
  # Check user count
  user_count=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM users;" 2>/dev/null)
  if [ "$user_count" -gt 0 ]; then
    test_result "PASS" "Demo User" "$user_count user(s) found"
  else
    test_result "WARN" "Demo User" "No users in database"
  fi
  
  # Check profile
  profile_count=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM profiles;" 2>/dev/null)
  if [ "$profile_count" -gt 0 ]; then
    test_result "PASS" "User Profile" "$profile_count profile(s) found"
  else
    test_result "WARN" "User Profile" "No profiles configured"
  fi
  
else
  test_result "FAIL" "Database File" "Not found"
fi

echo ""
echo "📋 Test 4: File Structure"
echo "------------------------"

# Check uploads directory
if [ -d "/home/user01/fitness-tracker/uploads" ]; then
  upload_count=$(ls -1 /home/user01/fitness-tracker/uploads 2>/dev/null | wc -l)
  test_result "PASS" "Uploads Directory" "$upload_count file(s)"
else
  test_result "WARN" "Uploads Directory" "Not found, will be created on first upload"
fi

# Check key files
key_files=(
  "src/app/page.tsx"
  "src/app/api/analyze/route.ts"
  "src/app/api/meals/route.ts"
  "src/lib/db.ts"
  "src/app/globals.css"
)

for file in "${key_files[@]}"; do
  if [ -f "/home/user01/fitness-tracker/$file" ]; then
    test_result "PASS" "File: $file" "Exists"
  else
    test_result "FAIL" "File: $file" "Missing"
  fi
done

echo ""
echo "📋 Test 5: AI Integration"
echo "------------------------"

# Check API configuration in code
if grep -q "aicanapi.com" /home/user01/fitness-tracker/src/app/api/analyze/route.ts; then
  test_result "PASS" "OpenClaw API Endpoint" "Configured"
else
  test_result "FAIL" "OpenClaw API Endpoint" "Not configured"
fi

if grep -q "claude-3-5-sonnet" /home/user01/fitness-tracker/src/app/api/analyze/route.ts; then
  test_result "PASS" "AI Model" "Claude 3.5 Sonnet"
else
  test_result "FAIL" "AI Model" "Not configured"
fi

echo ""
echo "📋 Test 6: UI Components"
echo "------------------------"

# Check for key UI elements in page.tsx
ui_elements=(
  "selectedMeal"
  "analyzing"
  "backdrop-blur"
  "animate-blob"
  "gradient"
)

for element in "${ui_elements[@]}"; do
  if grep -q "$element" /home/user01/fitness-tracker/src/app/page.tsx; then
    test_result "PASS" "UI Element: $element" "Found"
  else
    test_result "FAIL" "UI Element: $element" "Missing"
  fi
done

echo ""
echo "📋 Test 7: Workflow Simulation"
echo "------------------------"

# Test meal creation workflow
echo "Testing meal creation workflow..."

# Create test meal data
test_meal='{
  "mealType": "lunch",
  "foodName": "測試食物",
  "calories": 500,
  "protein": 30,
  "carbs": 50,
  "fat": 15,
  "servingSize": "1份"
}'

response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://192.168.131.21:3001/api/meals \
  -H "Content-Type: application/json" \
  -d "$test_meal" 2>/dev/null)

if [ "$response" = "200" ]; then
  test_result "PASS" "Meal Creation API" "HTTP 200"
  
  # Verify meal was saved
  meal_count=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM meals WHERE food_name='測試食物';" 2>/dev/null)
  if [ "$meal_count" -gt 0 ]; then
    test_result "PASS" "Meal Saved to DB" "$meal_count record(s)"
    # Clean up test data
    sqlite3 $DB_PATH "DELETE FROM meals WHERE food_name='測試食物';" 2>/dev/null
  else
    test_result "FAIL" "Meal Saved to DB" "Not found"
  fi
else
  test_result "FAIL" "Meal Creation API" "HTTP $response"
fi

echo ""
echo "📋 Test 8: Performance"
echo "------------------------"

# Test response time
start=$(date +%s%N)
curl -s http://192.168.131.21:3001 > /dev/null 2>&1
end=$(date +%s%N)
duration=$(( (end - start) / 1000000 ))

if [ $duration -lt 3000 ]; then
  test_result "PASS" "Homepage Load Time" "${duration}ms (< 3s)"
elif [ $duration -lt 5000 ]; then
  test_result "WARN" "Homepage Load Time" "${duration}ms (3-5s)"
else
  test_result "FAIL" "Homepage Load Time" "${duration}ms (> 5s)"
fi

# Check memory usage
mem_usage=$(ps aux | grep "next dev -p 3001" | grep -v grep | awk '{print $4}')
if [ -n "$mem_usage" ]; then
  mem_mb=$(ps aux | grep "next dev -p 3001" | grep -v grep | awk '{print $6/1024}' | head -1)
  if (( $(echo "$mem_usage < 5.0" | bc -l) )); then
    test_result "PASS" "Memory Usage" "${mem_usage}% (~${mem_mb}MB)"
  else
    test_result "WARN" "Memory Usage" "${mem_usage}% (~${mem_mb}MB) - High"
  fi
fi

echo ""
echo "📋 Test 9: Error Handling"
echo "------------------------"

# Test invalid meal type
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://192.168.131.21:3001/api/meals \
  -H "Content-Type: application/json" \
  -d '{"mealType":"invalid"}' 2>/dev/null)

if [ "$response" = "500" ] || [ "$response" = "400" ]; then
  test_result "PASS" "Invalid Input Handling" "Returns error (HTTP $response)"
else
  test_result "WARN" "Invalid Input Handling" "HTTP $response"
fi

echo ""
echo "📋 Test 10: Mobile Optimization"
echo "------------------------"

# Check for mobile-friendly meta tags and CSS
if grep -q "viewport" /home/user01/fitness-tracker/src/app/layout.tsx 2>/dev/null; then
  test_result "PASS" "Viewport Meta Tag" "Configured"
else
  test_result "WARN" "Viewport Meta Tag" "Not found"
fi

if grep -q "@media" /home/user01/fitness-tracker/src/app/globals.css; then
  test_result "PASS" "Responsive CSS" "Media queries found"
else
  test_result "WARN" "Responsive CSS" "No media queries"
fi

echo ""
echo "========================================="
echo "📊 Test Summary"
echo "========================================="
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo "   Total: $((PASS + FAIL + WARN))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 All critical tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  $FAIL test(s) failed. Please review.${NC}"
  exit 1
fi
