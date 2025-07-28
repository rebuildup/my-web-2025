#!/bin/bash
# Ultra-Fast Test Script with Advanced Optimizations
# samuido website - Lightning Fast Quality Check

set -e

# Configuration
PARALLEL_JOBS=${PARALLEL_JOBS:-4}
CACHE_DIR=".test-cache"
SKIP_SLOW_TESTS=${SKIP_SLOW_TESTS:-false}
VERBOSE=${VERBOSE:-false}
FORCE=${FORCE:-false}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m'

# Create cache directory
mkdir -p "$CACHE_DIR"

# Function to check if files changed
files_changed() {
    local pattern=$1
    local test_name=$2
    local cache_file="$CACHE_DIR/${test_name//[^a-zA-Z0-9]/_}.hash"
    
    # Find files matching pattern, excluding common ignore patterns
    local files=$(find . -name "node_modules" -prune -o -name ".next" -prune -o -name ".git" -prune -o -name "$CACHE_DIR" -prune -o \
                  \( -name "$pattern" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -type f -print 2>/dev/null)
    
    if [ -z "$files" ]; then
        return 0  # No files found, run test
    fi
    
    # Calculate hash of all matching files
    local current_hash
    if command -v md5sum >/dev/null 2>&1; then
        current_hash=$(echo "$files" | xargs md5sum 2>/dev/null | sort | md5sum | cut -d' ' -f1)
    elif command -v md5 >/dev/null 2>&1; then
        current_hash=$(echo "$files" | xargs md5 2>/dev/null | sort | md5 | cut -d' ' -f4)
    else
        # Fallback: use file modification times
        current_hash=$(echo "$files" | xargs stat -c %Y 2>/dev/null | sort | md5sum | cut -d' ' -f1)
    fi
    
    if [ -f "$cache_file" ]; then
        local cached_hash=$(cat "$cache_file")
        if [ "$current_hash" = "$cached_hash" ]; then
            return 1  # No changes
        fi
    fi
    
    echo "$current_hash" > "$cache_file"
    return 0  # Files changed
}

# Optimized test runner with caching
run_cached_test() {
    local test_name=$1
    local test_command=$2
    local file_pattern=$3
    local force_run=${4:-false}
    
    # Skip if no changes and not forced
    if [ "$force_run" = "false" ] && [ "$FORCE" = "false" ] && ! files_changed "$file_pattern" "$test_name"; then
        if [ "$VERBOSE" = "true" ]; then
            echo -e "${YELLOW}↷ $test_name (cached)${NC}"
        else
            echo -ne "${YELLOW}↷${NC}"
        fi
        return 0
    fi
    
    # Run test
    local log_file="/tmp/test_${test_name// /_}.log"
    if eval "$test_command" > "$log_file" 2>&1; then
        echo -ne "${GREEN}✓${NC}"
        return 0
    else
        echo -e "\n${RED}✗ $test_name failed:${NC}"
        grep -E "(error|Error|ERROR|fail|Fail|FAIL)" "$log_file" 2>/dev/null | head -20 || echo "Check $log_file for details"
        return 1
    fi
}

# Parallel test execution
run_parallel_tests() {
    local pids=()
    local results=()
    local temp_dir=$(mktemp -d)
    
    # ESLint
    (run_cached_test "ESLint" "npm run lint --silent" "*.ts,*.tsx,*.js,*.jsx" "false"; echo $? > "$temp_dir/eslint") &
    pids+=($!)
    
    # TypeScript
    (run_cached_test "TypeScript" "npm run type-check --silent" "*.ts,*.tsx" "false"; echo $? > "$temp_dir/typescript") &
    pids+=($!)
    
    # Jest
    (run_cached_test "Jest" "npm run test --silent -- --bail --passWithNoTests" "*.test.ts,*.test.tsx,*.spec.ts" "false"; echo $? > "$temp_dir/jest") &
    pids+=($!)
    
    # Prettier
    (run_cached_test "Prettier" "npm run format:check --silent" "*.ts,*.tsx,*.js,*.jsx,*.json,*.md" "false"; echo $? > "$temp_dir/prettier") &
    pids+=($!)
    
    # Wait for all background jobs
    for pid in "${pids[@]}"; do
        wait $pid
    done
    
    # Check results
    local all_passed=true
    for result_file in "$temp_dir"/*; do
        if [ "$(cat "$result_file")" != "0" ]; then
            all_passed=false
        fi
    done
    
    rm -rf "$temp_dir"
    
    if [ "$all_passed" = "false" ]; then
        return 1
    fi
    return 0
}

# Main execution
start_time=$(date +%s.%N 2>/dev/null || date +%s)
echo -e "${CYAN}=== Lightning Test Run ===${NC}"
echo -n "Tests: "

# Run parallel tests
if ! run_parallel_tests; then
    exit 1
fi

# Build (always run as it affects deployment)
echo -n " Build"
if ! run_cached_test "Build" "npm run build --silent" "*.ts,*.tsx,*.js,*.jsx,next.config.*,package.json,tailwind.config.*" "true"; then
    exit 1
fi

# E2E tests (optional for ultra-fast mode)
if [ "$SKIP_SLOW_TESTS" != "true" ]; then
    echo -n " E2E"
    if ! run_cached_test "Playwright" "npx playwright test --quiet --reporter=dot --workers=2" "*.ts,*.tsx,e2e/*.spec.ts" "false"; then
        exit 1
    fi
fi

# Report
if command -v bc >/dev/null 2>&1; then
    end_time=$(date +%s.%N 2>/dev/null || date +%s)
    duration=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "0")
    duration_formatted=$(printf "%.2f" "$duration" 2>/dev/null || echo "N/A")
else
    duration_formatted="N/A"
fi

echo -e "\n${GREEN}✓ All tests passed${NC} ${GRAY}(${duration_formatted}s)${NC}"

# Optional: Show what was skipped
if [ "$VERBOSE" = "true" ]; then
    echo -e "${YELLOW}Note: ↷ indicates cached/skipped tests${NC}"
fi

echo -e "${CYAN}=== Lightning Test Completed ===${NC}"