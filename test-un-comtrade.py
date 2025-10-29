#!/usr/bin/env python3
"""
Test script for UN Comtrade API integration
"""

import requests
import json
from datetime import datetime

# UN Comtrade API Configuration
PRIMARY_KEY = '981ae9857dcd4788aada12fcdba5c8da'
SECONDARY_KEY = '14aaf0a676fe40fa98772d42eee702a7'
BASE_URL = 'https://comtradeapi.un.org'

def test_data_availability():
    """Test getting data availability"""
    print("🧪 Testing UN Comtrade data availability...")

    # Use the main data endpoint with maxRecords=1 to test availability
    url = f"{BASE_URL}/data/v1/get/C/A/HS"

    params = {
        'reporterCode': '842',  # USA
        'period': '2022',
        'maxRecords': 1,
        'format': 'JSON'
    }

    try:
        headers = {
            'Ocp-Apim-Subscription-Key': PRIMARY_KEY
        }
        response = requests.get(url, params=params, headers=headers, timeout=30)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Data availability check successful")
            print(f"   Status: {response.status_code}")
            dataset = data.get('dataset', [])
            print(f"   Records found: {len(dataset)}")
            print(f"   Data available: {len(dataset) > 0}")
            return True
        else:
            print(f"❌ API request failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False

    except Exception as e:
        print(f"❌ Error testing data availability: {e}")
        return False

def test_preview_data():
    """Test preview data functionality"""
    print("\n🧪 Testing UN Comtrade preview data...")

    url = f"{BASE_URL}/data/v1/get/C/A/HS"

    params = {
        'reporterCode': '842',  # USA
        'period': '2022',
        'flowCode': 'X',  # Exports
        'maxRecords': 5,
        'format': 'JSON',
        'includeDesc': True
    }

    try:
        headers = {
            'Ocp-Apim-Subscription-Key': PRIMARY_KEY
        }
        response = requests.get(url, params=params, headers=headers, timeout=30)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Preview data successful")
            print(f"   Status: {response.status_code}")

            if 'dataset' in data and isinstance(data['dataset'], list):
                print(f"   Records returned: {len(data['dataset'])}")
                if data['dataset']:
                    record = data['dataset'][0]
                    print(f"   Sample record keys: {list(record.keys())[:5]}...")
            else:
                print(f"   Response structure: {list(data.keys()) if isinstance(data, dict) else type(data)}")

            return True
        else:
            print(f"❌ Preview request failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False

    except Exception as e:
        print(f"❌ Error testing preview data: {e}")
        return False

def test_final_data():
    """Test final data retrieval (limited)"""
    print("\n🧪 Testing UN Comtrade final data (limited)...")

    url = f"{BASE_URL}/data/v1/get/C/A/HS"

    params = {
        'reporterCode': '842',  # USA
        'period': '2022',
        'flowCode': 'X',  # Exports
        'maxRecords': 10,
        'format': 'JSON',
        'includeDesc': True
    }

    try:
        response = requests.get(url, params=params, timeout=60)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Final data request successful")
            print(f"   Status: {response.status_code}")

            if 'dataset' in data and isinstance(data['dataset'], list):
                print(f"   Records returned: {len(data['dataset'])}")
                if data['dataset']:
                    record = data['dataset'][0]
                    print(f"   Sample record has {len(record)} fields")
                    print(f"   Trade value: {record.get('primaryValue', 'N/A')}")
            else:
                print(f"   Response structure: {list(data.keys()) if isinstance(data, dict) else type(data)}")

            return True
        else:
            print(f"❌ Final data request failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False

    except Exception as e:
        print(f"❌ Error testing final data: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Testing UN Comtrade API Integration")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

    # Test data availability
    availability_ok = test_data_availability()

    # Test preview data
    preview_ok = test_preview_data()

    # Test final data
    final_ok = test_final_data()

    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Data Availability: {'✅ PASS' if availability_ok else '❌ FAIL'}")
    print(f"   Preview Data: {'✅ PASS' if preview_ok else '❌ FAIL'}")
    print(f"   Final Data: {'✅ PASS' if final_ok else '❌ FAIL'}")

    success_count = sum([availability_ok, preview_ok, final_ok])
    print(f"\n🎯 Overall: {success_count}/3 tests passed")

    if success_count == 3:
        print("🎉 UN Comtrade API integration is working correctly!")
        return True
    else:
        print("⚠️ Some tests failed. Check the API keys and network connectivity.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
