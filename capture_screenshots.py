import os
import time
import json
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"c:\Users\Naveen\Desktop\Forge\Atomy_india\screenshots_manual"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("=== 1. CAPTURING SUPER ADMIN DASHBOARD ===")
        super_admin_session = {
            "authenticated": True,
            "adminUser": {
                "role": "SUPER_ADMIN",
                "name": "Naveen Sourabh Pal",
                "email": "naveen.admin@atomy.com",
                "roleTitle": "Super Administrator",
                "department": "E-Commerce Operations & Supply Chain",
                "lastLogin": "Just now (IST)"
            },
            "loginTimestamp": int(time.time() * 1000)
        }

        page.goto("http://localhost:5174/")
        page.evaluate(f"localStorage.setItem('atomy_admin_session', '{json.dumps(super_admin_session)}');")
        page.reload()
        page.wait_for_timeout(2000)

        # Overview
        page.screenshot(path=os.path.join(OUTPUT_DIR, "01_super_admin_overview.png"), full_page=False)
        print("Captured: 01_super_admin_overview.png")

        # Inventory
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[1]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02_super_admin_inventory.png"), full_page=False)
        print("Captured: 02_super_admin_inventory.png")

        # Territories
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[2]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "03_super_admin_territories.png"), full_page=False)
        print("Captured: 03_super_admin_territories.png")

        # Invite Distributors
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[3]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "04_super_admin_invite_distributors.png"), full_page=False)
        print("Captured: 04_super_admin_invite_distributors.png")

        # Membership
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[4]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "05_super_admin_membership.png"), full_page=False)
        print("Captured: 05_super_admin_membership.png")

        # Floating Ads
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[5]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "06_super_admin_floating_ad.png"), full_page=False)
        print("Captured: 06_super_admin_floating_ad.png")

        # Coupons
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[6]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "07_super_admin_coupons.png"), full_page=False)
        print("Captured: 07_super_admin_coupons.png")

        # Settings
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[7]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "08_super_admin_settings.png"), full_page=False)
        print("Captured: 08_super_admin_settings.png")

        # Orders (via Overview KPI card 1 click or mobile drawer click)
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[0]?.click();")
        page.wait_for_timeout(1000)
        page.evaluate("document.querySelector('.kpi-curve-card')?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "09_super_admin_orders.png"), full_page=False)
        print("Captured: 09_super_admin_orders.png")

        # Finance & Settlements (via KPI card 2)
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[0]?.click();")
        page.wait_for_timeout(1000)
        page.evaluate("document.querySelectorAll('.kpi-curve-card')[1]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "10_super_admin_finance.png"), full_page=False)
        print("Captured: 10_super_admin_finance.png")

        # Customers (via KPI card 6)
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[0]?.click();")
        page.wait_for_timeout(1000)
        page.evaluate("document.querySelectorAll('.kpi-curve-card')[5]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "11_super_admin_customers.png"), full_page=False)
        print("Captured: 11_super_admin_customers.png")

        # Customer Support Desk
        page.evaluate("document.querySelector('.mobile-hamburger-btn')?.click();")
        page.wait_for_timeout(500)
        page.evaluate("""
            const btns = Array.from(document.querySelectorAll('.mobile-drawer-nav-item'));
            const sup = btns.find(b => b.textContent.includes('Support'));
            if (sup) sup.click();
        """)
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "12_super_admin_support.png"), full_page=False)
        print("Captured: 12_super_admin_support.png")

        print("=== 2. CAPTURING REGIONAL DISTRIBUTOR DASHBOARD (PRIMARY - SELVA HUB 635002) ===")
        selva_session = {
            "authenticated": True,
            "adminUser": {
                "role": "DISTRIBUTOR_ADMIN",
                "distributorId": "DIST-635002",
                "businessName": "Selva Atomy Regional Hub",
                "contactPerson": "Selva Kumar",
                "email": "selvakumarc029@gmail.com",
                "phone": "+91 95388 53454",
                "primaryPincode": "635002",
                "assignedPincodes": ["635002"],
                "hubAddress": "RK Tower, Rayakotta main road, bayanapalli, Krishnagiri - 635002",
                "commissionRate": 8.0,
                "distributorRole": "PRIMARY_MANAGER",
                "status": "ACTIVE",
                "onLeave": False
            },
            "loginTimestamp": int(time.time() * 1000)
        }
        page.evaluate(f"localStorage.setItem('atomy_admin_session', '{json.dumps(selva_session)}');")
        page.reload()
        page.wait_for_timeout(2000)

        # Overview
        page.screenshot(path=os.path.join(OUTPUT_DIR, "13_distributor_overview.png"), full_page=False)
        print("Captured: 13_distributor_overview.png")

        # Inventory
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[1]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "14_distributor_inventory.png"), full_page=False)
        print("Captured: 14_distributor_inventory.png")

        # Orders & OTP Handover
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[2]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "15_distributor_orders.png"), full_page=False)
        print("Captured: 15_distributor_orders.png")

        # Customers
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[3]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "16_distributor_customers.png"), full_page=False)
        print("Captured: 16_distributor_customers.png")

        # Support
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[4]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "17_distributor_support.png"), full_page=False)
        print("Captured: 17_distributor_support.png")

        # Membership PV
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[5]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "18_distributor_membership.png"), full_page=False)
        print("Captured: 18_distributor_membership.png")

        # Finance & Commission Ledger
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[6]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "19_distributor_finance.png"), full_page=False)
        print("Captured: 19_distributor_finance.png")

        # Hub Settings & Leave Delegation
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[7]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "20_distributor_settings.png"), full_page=False)
        print("Captured: 20_distributor_settings.png")

        print("=== 3. CAPTURING SUBSTITUTE DISTRIBUTOR DASHBOARD (CO-MANAGER) ===")
        # Standby Mode (Primary Active)
        sub_session_standby = {
            "authenticated": True,
            "adminUser": {
                "role": "DISTRIBUTOR_ADMIN",
                "distributorId": "DIST-635002-SUB",
                "businessName": "Selva Regional Hub (Co-Manager)",
                "contactPerson": "Acting Co-Manager",
                "email": "acting.hub@atomy.in",
                "primaryPincode": "635002",
                "parentHubId": "DIST-635002",
                "parentHubName": "Selva Atomy Regional Hub",
                "primaryManagerName": "Selva Kumar",
                "distributorRole": "SUB_DISTRIBUTOR",
                "status": "ACTIVE"
            },
            "loginTimestamp": int(time.time() * 1000)
        }
        page.evaluate(f"localStorage.setItem('atomy_admin_session', '{json.dumps(sub_session_standby)}');")
        page.reload()
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "21_substitute_standby_mode.png"), full_page=False)
        print("Captured: 21_substitute_standby_mode.png")

        # Acting Mode (Primary on leave)
        sub_session_acting = {
            "authenticated": True,
            "adminUser": {
                "role": "DISTRIBUTOR_ADMIN",
                "distributorId": "DIST-635002-SUB",
                "businessName": "Selva Regional Hub (Co-Manager)",
                "contactPerson": "Acting Co-Manager",
                "email": "acting.hub@atomy.in",
                "primaryPincode": "635002",
                "parentHubId": "DIST-635002",
                "parentHubName": "Selva Atomy Regional Hub",
                "primaryManagerName": "Selva Kumar",
                "distributorRole": "PRIMARY_MANAGER",
                "status": "ACTIVE",
                "onLeave": False
            },
            "loginTimestamp": int(time.time() * 1000)
        }
        page.evaluate(f"localStorage.setItem('atomy_admin_session', '{json.dumps(sub_session_acting)}');")
        page.reload()
        page.wait_for_timeout(2000)
        page.evaluate("document.querySelectorAll('.sidebar-nav-button')[2]?.click();")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "22_substitute_acting_orders.png"), full_page=False)
        print("Captured: 22_substitute_acting_orders.png")

        print("=== 4. CAPTURING CUSTOMER DASHBOARD & STOREFRONT EXPERIENCE ===")
        customer_user = {
            "customerId": "CUST-20261009-1001",
            "name": "Naveen",
            "fullName": "Naveen Sourabh Pal",
            "username": "naveen",
            "email": "naveen.mj2.45@gmail.com",
            "phone": "+91 9876543210",
            "role": "CUSTOMER",
            "isMember": True,
            "pincode": "635002",
            "city": "Krishnagiri",
            "state": "Tamil Nadu",
            "address": "RK Tower, Rayakotta main road, Bayanapalli, Krishnagiri"
        }

        page.goto("http://localhost:5173/")
        page.evaluate(f"""
            localStorage.setItem('atomy_current_user', '{json.dumps(customer_user)}');
            localStorage.setItem('atomy_customer_delivery_pincode', '635002');
            localStorage.setItem('atomy_customer_delivery_city', 'Krishnagiri');
        """)
        page.reload()
        page.wait_for_timeout(2500)

        # Storefront Homepage
        page.screenshot(path=os.path.join(OUTPUT_DIR, "23_customer_storefront_home.png"), full_page=False)
        print("Captured: 23_customer_storefront_home.png")

        # Delivery Location Modal
        page.evaluate("""
            const locBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.textContent && el.textContent.includes('635002') && el.textContent.includes('Krishnagiri'));
            if (locBtn) locBtn.click();
            else {
                const mapBtn = document.querySelector('.header-location-pill, .header-delivery-badge');
                if (mapBtn) mapBtn.click();
            }
        """)
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "24_customer_location_modal.png"), full_page=False)
        print("Captured: 24_customer_location_modal.png")

        # Close modal if open
        page.evaluate("document.querySelector('.lang-region-close-btn')?.click();")
        page.wait_for_timeout(1000)

        # Product Detail Page
        page.evaluate("""
            const card = document.querySelector('.product-card, .catalog-card');
            if (card) card.click();
            else {
                const img = document.querySelector('.product-card-img, img');
                if (img) img.click();
            }
        """)
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "25_customer_product_detail.png"), full_page=False)
        print("Captured: 25_customer_product_detail.png")

        # Order Sheet & Checkout
        page.evaluate("""
            const buyNow = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Buy Now'));
            if (buyNow) buyNow.click();
        """)
        page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "26_customer_checkout_ordersheet.png"), full_page=False)
        print("Captured: 26_customer_checkout_ordersheet.png")

        # Customer Orders History & Stepper
        page.goto("http://localhost:5173/")
        page.wait_for_timeout(1000)
        page.evaluate("""
            const orderLink = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent && el.textContent.includes('Order History'));
            if (orderLink) orderLink.click();
            else {
                window.location.hash = '#orders';
            }
        """)
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "27_customer_order_tracking.png"), full_page=False)
        print("Captured: 27_customer_order_tracking.png")

        # Customer Profile & Personal PV Console
        page.evaluate("""
            const profileLink = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent && (el.textContent.includes('My Profile') || el.textContent.includes('Hello,') || el.textContent.includes('Venkataramanan') || el.textContent.includes('Naveen')));
            if (profileLink) profileLink.click();
            else {
                window.location.hash = '#profile';
            }
        """)
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "28_customer_profile_pv.png"), full_page=False)
        print("Captured: 28_customer_profile_pv.png")

        browser.close()
        print("=== ALL SCREENSHOTS SUCCESSFULLY CAPTURED! ===")

if __name__ == "__main__":
    capture_all()
