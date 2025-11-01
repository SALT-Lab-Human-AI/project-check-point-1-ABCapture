#!/bin/bash

# OAuth Setup Verification Script
# This script checks if your database and environment are properly configured for Google OAuth

echo "========================================="
echo "Google OAuth Setup Verification"
echo "========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "   Please copy .env.example to .env and fill in your credentials"
    exit 1
else
    echo "✅ .env file exists"
fi

# Check for required environment variables
echo ""
echo "Checking environment variables..."
echo ""

check_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env | cut -d '=' -f2-)
    
    if [ -z "$var_value" ] || [ "$var_value" = "your_"* ] || [ "$var_value" = "gsk_your"* ]; then
        echo "❌ $var_name is not set or using placeholder value"
        return 1
    else
        echo "✅ $var_name is set"
        return 0
    fi
}

all_vars_set=true

check_env_var "DATABASE_URL" || all_vars_set=false
check_env_var "SESSION_SECRET" || all_vars_set=false
check_env_var "GOOGLE_CLIENT_ID" || all_vars_set=false
check_env_var "GOOGLE_CLIENT_SECRET" || all_vars_set=false
check_env_var "GOOGLE_CALLBACK_URL" || all_vars_set=false

echo ""
if [ "$all_vars_set" = false ]; then
    echo "❌ Some environment variables are missing or not configured"
    echo "   Please update your .env file with actual values"
    echo ""
    echo "To get Google OAuth credentials:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create a project or select existing"
    echo "3. Go to APIs & Services > Credentials"
    echo "4. Create OAuth 2.0 Client ID"
    echo "5. Add authorized redirect URI: http://localhost:5050/auth/google/callback"
    echo ""
    exit 1
else
    echo "✅ All required environment variables are set"
fi

# Check database connection
echo ""
echo "Checking database connection..."
echo ""

DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2-)

if command -v psql &> /dev/null; then
    if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        echo "✅ Database connection successful"
        
        # Check if OAuth columns exist
        echo ""
        echo "Checking if OAuth migration has been run..."
        echo ""
        
        GOOGLE_ID_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='google_id';" 2>/dev/null | xargs)
        PROVIDER_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='provider';" 2>/dev/null | xargs)
        DISPLAY_NAME_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='display_name';" 2>/dev/null | xargs)
        
        if [ -z "$GOOGLE_ID_EXISTS" ] || [ -z "$PROVIDER_EXISTS" ] || [ -z "$DISPLAY_NAME_EXISTS" ]; then
            echo "❌ OAuth columns are missing from users table!"
            echo "   You need to run the database migration:"
            echo ""
            echo "   psql \$DATABASE_URL -f migrations/add_oauth_support.sql"
            echo ""
            echo "   Or use Drizzle Kit:"
            echo "   npm run db:push"
            echo ""
            exit 1
        else
            echo "✅ OAuth columns exist in users table"
            echo "   - google_id: ✅"
            echo "   - provider: ✅"
            echo "   - display_name: ✅"
        fi
        
        # Check if password is nullable
        PASSWORD_NULLABLE=$(psql "$DATABASE_URL" -t -c "SELECT is_nullable FROM information_schema.columns WHERE table_name='users' AND column_name='password';" 2>/dev/null | xargs)
        
        if [ "$PASSWORD_NULLABLE" = "YES" ]; then
            echo "   - password nullable: ✅"
        else
            echo "   - password nullable: ❌ (needs to be nullable for OAuth users)"
            echo ""
            echo "   Run the migration to fix this:"
            echo "   psql \$DATABASE_URL -f migrations/add_oauth_support.sql"
            echo ""
            exit 1
        fi
        
    else
        echo "❌ Cannot connect to database"
        echo "   Please check your DATABASE_URL in .env"
        exit 1
    fi
else
    echo "⚠️  psql not found - skipping database checks"
    echo "   Install PostgreSQL client to verify database setup"
fi

echo ""
echo "========================================="
echo "✅ All checks passed!"
echo "========================================="
echo ""
echo "Your Google OAuth setup is ready. To test:"
echo "1. Start the server: npm run dev"
echo "2. Go to http://localhost:5050/login"
echo "3. Click 'Continue with Google'"
echo "4. Check server logs for detailed OAuth flow"
echo ""
echo "If you still get errors, check the server logs for:"
echo "  [OAuth] - OAuth flow steps"
echo "  [GoogleStrategy] - Google authentication"
echo "  [Storage] - Database operations"
echo "  [API] - API endpoint calls"
echo ""
