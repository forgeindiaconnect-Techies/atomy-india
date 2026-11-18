import os
import json
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"c:\Users\Naveen\Desktop\Forge\Atomy_india\screenshots_manual"
os.makedirs(OUTPUT_DIR, exist_ok=True)

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

cart_item = [
    {
        "id": "D00101",
        "name": "HemoHIM *1set",
        "price": 9450,
        "originalPrice": 13000,
        "quantity": 1,
        "pv": 80000,
        "image": "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        "category": "Health",
        "inStock": True
    }
]

sample_order = [
    {
        "id": "ATOMY-IN-2026-9812",
        "orderId": "ATOMY-IN-2026-9812",
        "createdAt": "2026-11-17T10:30:00Z",
        "orderDate": "17 Nov 2026",
        "customerName": "Naveen Sourabh Pal",
        "customerEmail": "naveen.mj2.45@gmail.com",
        "customerPhone": "+91 9876543210",
        "deliveryMode": "HUB_PICKUP",
        "pickupOtp": "842915",
        "orderStatus": "DISPATCHED",
        "status": "DISPATCHED",
        "hubName": "Selva atomy hub",
        "hubAddress": "RK Tower, Rayakotta main road, bayanapalli, Krishnagiri - 635002",
        "pincode": "635002",
        "city": "Krishnagiri",
        "state": "Tamil Nadu",
        "totalAmount": 9450,
        "finalTotal": 9450,
        "totalPv": 80000,
        "paymentMethod": "UPI (Google Pay)",
        "paymentStatus": "PAID",
        "items": [
            {
                "id": "D00101",
                "name": "HemoHIM *1set",
                "quantity": 1,
                "price": 9450,
                "pv": 80000
            }
        ]
    }
]

today_str = time.strftime("%a %b %d %Y")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="chrome")
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    # Pre-configure localStorage
    page.goto("http://localhost:5173/")
    page.evaluate(f"""
        localStorage.setItem('atomy_current_user', '{json.dumps(customer_user)}');
        localStorage.setItem('atomy_customer_delivery_pincode', '635002');
        localStorage.setItem('atomy_customer_delivery_city', 'Krishnagiri');
        localStorage.setItem('atomy_customer_cart', '{json.dumps(cart_item)}');
        localStorage.setItem('atomy_placed_orders', '{json.dumps(sample_order)}');
        localStorage.setItem('atomy_ad_do_not_show_today', '{today_str}');
    """)
    page.reload()
    page.wait_for_timeout(2000)

    # 1. Clean Customer Home Page (Ad completely removed)
    page.evaluate("""
        document.querySelectorAll('.launch-modal-overlay, .launch-modal-container, .launch-banner-overlay').forEach(el => el.remove());
        const closeBtn = document.querySelector('.launch-modal-close-btn');
        if (closeBtn) closeBtn.click();
    """)
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "clean_01_customer_home.png"), full_page=False)
    print("SUCCESS: clean_01_customer_home.png")

    # 2. Product Details Page (HemoHIM D00101)
    page.goto("http://localhost:5173/product?id=D00101")
    page.wait_for_timeout(2000)
    page.evaluate("""
        document.querySelectorAll('.launch-modal-overlay, .launch-modal-container').forEach(el => el.remove());
    """)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "clean_02_product_detail.png"), full_page=False)
    print("SUCCESS: clean_02_product_detail.png")

    # 3. Product Summary / Cart Page
    page.goto("http://localhost:5173/cart")
    page.wait_for_timeout(2000)
    page.evaluate("""
        document.querySelectorAll('.launch-modal-overlay, .launch-modal-container').forEach(el => el.remove());
    """)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "clean_03_product_summary.png"), full_page=False)
    print("SUCCESS: clean_03_product_summary.png")

    # 4. Payment Page (Checkout Order Sheet)
    page.goto("http://localhost:5173/order-sheet")
    page.wait_for_timeout(2500)
    page.evaluate("""
        document.querySelectorAll('.launch-modal-overlay, .launch-modal-container').forEach(el => el.remove());
        window.scrollTo({ top: 300, behavior: 'instant' });
    """)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "clean_04_payment_page.png"), full_page=False)
    print("SUCCESS: clean_04_payment_page.png")

    # 5. Order History Page (Live Stepper & OTP)
    page.goto("http://localhost:5173/orders")
    page.wait_for_timeout(2000)
    page.evaluate("""
        document.querySelectorAll('.launch-modal-overlay, .launch-modal-container').forEach(el => el.remove());
    """)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "clean_05_order_history.png"), full_page=False)
    print("SUCCESS: clean_05_order_history.png")

    browser.close()
    print("=== ALL 5 CLEAN CUSTOMER PAGES CAPTURED ===")
