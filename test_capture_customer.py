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

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="chrome")
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    # Open Storefront & Suppress ad popup completely
    page.goto("http://localhost:5173/")
    today_str = time.strftime("%a %b %d %Y")
    page.evaluate(f"""
        localStorage.setItem('atomy_current_user', '{json.dumps(customer_user)}');
        localStorage.setItem('atomy_customer_delivery_pincode', '635002');
        localStorage.setItem('atomy_customer_delivery_city', 'Krishnagiri');
        localStorage.setItem('atomy_ad_do_not_show_today', '{today_str}');
    """)
    page.reload()
    page.wait_for_timeout(2000)

    # Dismiss any leftover modal or overlay if present
    page.evaluate("""
        document.querySelectorAll('.launch-modal-overlay, .launch-modal-container, .launch-banner-overlay').forEach(el => el.remove());
        const closeBtn = document.querySelector('.launch-modal-close-btn, .launch-close-btn, button[aria-label=\"Close\"]');
        if (closeBtn) closeBtn.click();
    """)
    page.wait_for_timeout(1000)

    # 1. Customer Home Page
    page.screenshot(path=os.path.join(OUTPUT_DIR, "customer_01_homepage.png"), full_page=False)
    print("Captured: customer_01_homepage.png")

    # 2. Product Details Page (Click on HemoHIM)
    page.evaluate("""
        const card = Array.from(document.querySelectorAll('.product-card, .catalog-card, div')).find(el => el.textContent && el.textContent.includes('HemoHIM'));
        if (card) {
            const clickable = card.querySelector('img, h3, a, button') || card;
            clickable.click();
        } else {
            const anyCard = document.querySelector('.product-card img');
            if (anyCard) anyCard.click();
        }
    """)
    page.wait_for_timeout(2500)
    # Ensure no ad modal over product detail
    page.evaluate("document.querySelectorAll('.launch-modal-overlay, .launch-modal-container').forEach(el => el.remove());")
    page.screenshot(path=os.path.join(OUTPUT_DIR, "customer_02_product_detail.png"), full_page=False)
    print("Captured: customer_02_product_detail.png")

    # 3. Product Summary / Cart Page (Open Cart / Cart Drawer)
    page.evaluate("""
        const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Add to Cart'));
        if (addBtn) addBtn.click();
    """)
    page.wait_for_timeout(1000)
    page.evaluate("""
        const cartBtn = document.querySelector('.header-cart-icon-btn, .cart-icon-wrapper, .cart-badge-container') || Array.from(document.querySelectorAll('button, a')).find(b => b.textContent && b.textContent.includes('Cart'));
        if (cartBtn) cartBtn.click();
    """)
    page.wait_for_timeout(2000)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "customer_03_cart_summary.png"), full_page=False)
    print("Captured: customer_03_cart_summary.png")

    # 4. Payment Page (Checkout Order Sheet with Payment Gateway Options)
    page.evaluate("""
        const checkoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Checkout') || b.textContent.includes('Proceed to Buy') || b.textContent.includes('Place Order')));
        if (checkoutBtn) checkoutBtn.click();
    """)
    page.wait_for_timeout(2500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "customer_04_payment_page.png"), full_page=False)
    print("Captured: customer_04_payment_page.png")

    # 5. Order History Page (With Consignment Stepper, 6-digit OTP & Invoice)
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1000)
    page.evaluate("""
        document.querySelectorAll('.launch-modal-overlay, .launch-modal-container').forEach(el => el.remove());
        const orderHistoryBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent && b.textContent.includes('Order History'));
        if (orderHistoryBtn) orderHistoryBtn.click();
        else {
            const profileMenu = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent && (b.textContent.includes('Hello,') || b.textContent.includes('Venkataramanan') || b.textContent.includes('Naveen')));
            if (profileMenu) profileMenu.click();
        }
    """)
    page.wait_for_timeout(2000)
    # Ensure navigated to orders view
    page.evaluate("""
        const ordersTab = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent && b.textContent.includes('My Orders') || b.textContent.includes('Order History'));
        if (ordersTab) ordersTab.click();
    """)
    page.wait_for_timeout(2000)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "customer_05_order_history.png"), full_page=False)
    print("Captured: customer_05_order_history.png")

    browser.close()
    print("=== FINISHED CAPTURING CLEAN CUSTOMER PAGES ===")
