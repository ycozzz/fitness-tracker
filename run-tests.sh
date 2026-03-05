#!/bin/bash

echo "🧪 Fitness Tracker - 自動測試"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Test function
test_api() {
  local name=$1
  local url=$2
  local expected_code=$3
  
  echo -n "Testing $name... "
  response=$(curl -s -o /dev/null -w "%{http_code}" $url)
  
  if [ "$response" -eq "$expected_code" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
    ((PASS++))
  else
    echo -e "${RED}❌ FAIL${NC} (Expected $expected_code, got $response)"
    ((FAIL++))
  fi
}

# 1. Test homepage
test_api "Homepage" "http://192.168.131.21:3001" 200

# 2. Test meals API (GET)
test_api "Meals API (GET)" "http://192.168.131.21:3001/api/meals" 200

# 3. Test database
echo -n "Testing Database... "
if [ -f "/home/user01/fitness-tracker/fitness.db" ]; then
  tables=$(sqlite3 /home/user01/fitness-tracker/fitness.db ".tables" 2>/dev/null)
  if [[ $tables == *"meals"* ]] && [[ $tables == *"users"* ]]; then
    echo -e "${GREEN}✅ PASS${NC} (All tables exist)"
    ((PASS++))
  else
    echo -e "${RED}❌ FAIL${NC} (Missing tables)"
    ((FAIL++))
  fi
else
  echo -e "${RED}❌ FAIL${NC} (Database not found)"
  ((FAIL++))
fi

# 4. Test uploads directory
echo -n "Testing Uploads Directory... "
if [ -d "/home/user01/fitness-tracker/uploads" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️  WARN${NC} (Directory not found, creating...)"
  mkdir -p /home/user01/fitness-tracker/uploads
  ((PASS++))
fi

# 5. Test process
echo -n "Testing Server Process... "
if pgrep -f "next dev -p 3001" > /dev/null; then
  echo -e "${GREEN}✅ PASS${NC} (Server running)"
  ((PASS++))
else
  echo -e "${RED}❌ FAIL${NC} (Server not running)"
  ((FAIL++))
fi

# 6. Test port
echo -n "Testing Port 3001... "
if ss -tlnp | grep -q ":3001"; then
  echo -e "${GREEN}✅ PASS${NC} (Port listening)"
  ((PASS++))
else
  echo -e "${RED}❌ FAIL${NC} (Port not listening)"
  ((FAIL++))
fi

# 7. Test database records
echo -n "Testing Database Records... "
user_count=$(sqlite3 /home/user01/fitness-tracker/fitness.db "SELECT COUNT(*) FROM users;" 2>/dev/null)
if [ "$user_count" -gt 0 ]; then
  echo -e "${GREEN}✅ PASS${NC} ($user_count users)"
  ((PASS++))
else
  echo -e "${RED}❌ FAIL${NC} (No users found)"
  ((FAIL++))
fi

# Summary
echo ""
echo "================================"
echo "Test Results:"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo "  Total: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed!${NC}"
  exit 1
fi
