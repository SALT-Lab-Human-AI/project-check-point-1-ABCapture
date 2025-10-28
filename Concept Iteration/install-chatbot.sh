#!/bin/bash

# ABCapture Chatbot Installation Script
# This script installs the Groq SDK and helps configure the API key

echo "========================================="
echo "ABCapture Chatbot Installation"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✓ Found package.json"
echo ""

# Step 1: Install Groq SDK
echo "Step 1: Installing Groq SDK..."
echo "Running: npm install groq-sdk"
echo ""

npm install groq-sdk

if [ $? -eq 0 ]; then
    echo "✓ Groq SDK installed successfully"
else
    echo "❌ Failed to install Groq SDK"
    exit 1
fi

echo ""

# Step 2: Check for .env file
echo "Step 2: Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env from .env.example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created .env file"
    else
        echo "❌ .env.example not found"
        echo "Please create .env file manually"
        exit 1
    fi
else
    echo "✓ Found .env file"
fi

echo ""

# Step 3: Check for GROQ_API_KEY
echo "Step 3: Checking for Groq API key..."

if grep -q "GROQ_API_KEY=gsk_" .env; then
    echo "✓ GROQ_API_KEY appears to be configured"
    echo ""
    echo "⚠️  Note: Please verify your API key is correct"
else
    echo "⚠️  GROQ_API_KEY not found or not configured"
    echo ""
    echo "To configure your Groq API key:"
    echo "1. Visit: https://console.groq.com/keys"
    echo "2. Sign up for a free account (if needed)"
    echo "3. Create an API key"
    echo "4. Copy the key (starts with 'gsk_')"
    echo "5. Add to .env file:"
    echo "   GROQ_API_KEY=gsk_your_actual_key_here"
    echo ""
    
    read -p "Do you have a Groq API key ready? (y/n): " has_key
    
    if [ "$has_key" = "y" ] || [ "$has_key" = "Y" ]; then
        read -p "Enter your Groq API key: " api_key
        
        if [[ $api_key == gsk_* ]]; then
            # Add or update GROQ_API_KEY in .env
            if grep -q "GROQ_API_KEY=" .env; then
                # Update existing
                sed -i.bak "s/GROQ_API_KEY=.*/GROQ_API_KEY=$api_key/" .env
                rm .env.bak 2>/dev/null
            else
                # Add new
                echo "GROQ_API_KEY=$api_key" >> .env
            fi
            echo "✓ API key added to .env"
        else
            echo "⚠️  Warning: API key doesn't start with 'gsk_'"
            echo "Please verify the key is correct"
        fi
    else
        echo ""
        echo "Please get your API key from: https://console.groq.com/keys"
        echo "Then add it to the .env file manually"
    fi
fi

echo ""
echo "========================================="
echo "Installation Summary"
echo "========================================="
echo ""

# Verify installation
if npm list groq-sdk > /dev/null 2>&1; then
    echo "✓ Groq SDK: Installed"
else
    echo "❌ Groq SDK: Not installed"
fi

if [ -f ".env" ]; then
    echo "✓ .env file: Exists"
else
    echo "❌ .env file: Missing"
fi

if grep -q "GROQ_API_KEY=gsk_" .env 2>/dev/null; then
    echo "✓ GROQ_API_KEY: Configured"
else
    echo "⚠️  GROQ_API_KEY: Not configured or invalid"
fi

echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""
echo "1. Verify your GROQ_API_KEY in .env file"
echo "2. Restart the server: npm run dev"
echo "3. Test the chatbot:"
echo "   - Navigate to Chat page"
echo "   - Select a student"
echo "   - Send a message: 'Hello'"
echo "   - Verify AI responds"
echo ""
echo "For troubleshooting, see:"
echo "  - CHATBOT_TROUBLESHOOTING.md"
echo "  - CHATBOT_DEBUG_SUMMARY.md"
echo ""
echo "========================================="
