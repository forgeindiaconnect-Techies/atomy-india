import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

SOURCE_DOC = r"E:\EMS Documents\atomy_india2_backup.docx"
TARGET_DOC = r"E:\EMS Documents\atomy_india2.docx"
SCREENSHOTS_DIR = r"c:\Users\Naveen\Desktop\Forge\Atomy_india\screenshots_manual"

doc = docx.Document(SOURCE_DOC)

# Delete existing Section 10 paragraphs (paragraphs 75 to 173) in reverse order
print(f"Original paragraph count: {len(doc.paragraphs)}")
for idx in range(len(doc.paragraphs) - 1, 74, -1):
    p = doc.paragraphs[idx]
    p._element.getparent().remove(p._element)

print(f"After removing old Section 10: {len(doc.paragraphs)} paragraphs")

# Now let's update Section 3 (paragraphs 15 to 31)
# P15 is the heading: "3. Step-by-Step User & Admin Operational Manual"
doc.paragraphs[15].text = "3. Step-by-Step Multi-Role Operational Manual & End-to-End Lifecycle"
doc.paragraphs[16].text = "This chapter provides the standardized operational runbook for all four enterprise roles across the Atomy India platform. In this architecture, the Regional Distributor acts as the frontline customer handler and local order fulfillment engine, while the Super Admin provides centralized governance, the Substitute Distributor provides redundancy, and the Customer engages through the self-service storefront."

# P17 to P24: Replace with Connected Architecture narrative & Regional Distributor runbook
doc.paragraphs[17].text = "3.1 Enterprise Architectural Role Connections & Operational Data Flow"
doc.paragraphs[18].text = "The platform unifies four distinct user dashboards into a synchronized omnichannel supply chain: (1) Super Admin (/admin), (2) Regional Distributor (/distributor - Primary Manager), (3) Substitute Distributor (/distributor - Co-Manager), and (4) Customer (/ and /profile)."
doc.paragraphs[19].text = "1. Setup & Allocation Connection (Super Admin -> Regional Distributor): Super Admin allocates territory PIN codes (strictly 1:1 distributor assignment, e.g., Selva Hub for PIN 635002) and provisions initial warehouse stock for all 82 catalog products."
doc.paragraphs[20].text = "2. Frontline Customer & Order Routing Connection (Customer -> Regional Distributor): When a customer selects delivery PIN 635002, the system reads live inventory strictly from Selva Atomy Regional Hub. Orders placed within the territory route directly to the Regional Distributor's dashboard for picking, packing, and dispatch."
doc.paragraphs[21].text = "3. Counter Collection & 6-Digit OTP Verification Connection (Regional Distributor -> Customer): For hub counter pickups, the customer presents a secure 6-digit OTP generated upon order placement. The Regional Distributor verifies this OTP in their dashboard to authorize parcel handover, instantly updating the customer's milestone stepper to 'Delivered'."
doc.paragraphs[22].text = "4. Operational Redundancy Connection (Regional Distributor -> Substitute Distributor): When the primary distributor is marked 'ON LEAVE', hub operational authority automatically unlocks for the designated Co-Manager/Substitute Distributor, ensuring zero disruption to customer deliveries."
doc.paragraphs[23].text = "5. Financial Ledger & Settlement Connection (Regional Distributor -> Super Admin): Completed dispatches automatically accrue an 8.0% commission in the Regional Distributor's ledger. The Super Admin audits transaction ledgers, resolves escalations, and clears monthly commission payouts."
doc.paragraphs[24].text = "3.2 Regional Distributor Frontline Runbook (Selva Hub - PIN 635002)"

doc.paragraphs[25].text = "Step 1 (Inbound Order Triage): The Regional Distributor monitors incoming orders in real time. Orders are filtered by delivery mode: Doorstep Line-haul vs. Hub Counter Pickup."
doc.paragraphs[26].text = "Step 2 (Local Inventory Allocation & Safety Buffers): The distributor inspects local stock on shelf. Products maintain a minimum safety buffer to prevent overselling."
doc.paragraphs[27].text = "Step 3 (Courier Dispatch & AWB Logging): For home delivery orders, the distributor packs the merchandise, prints the shipping manifest, and records the courier Airway Bill (AWB) tracking number."
doc.paragraphs[28].text = "Step 4 (Counter Handover via 6-Digit OTP Verification): When a customer arrives at the hub (RK Tower, Bayanapalli), the distributor requests their 6-digit collection OTP, validates it in the system, and completes physical parcel handover."
doc.paragraphs[29].text = "Step 5 (Commission Accrual): Verified deliveries credit 8.0% commission to the distributor's wallet, available for payout reconciliation."
doc.paragraphs[30].text = "3.3 Substitute Distributor Runbook: Operates in 'Standby Relief Mode' while primary is active. When primary takes leave, the substitute receives operational authority to fulfill orders and perform OTP counter verifications."
doc.paragraphs[31].text = "3.4 Super Admin Runbook: Manages territory PIN allocation, catalog CRUD for 82 products, discount campaigns, platform GSTIN governance, and financial settlement audits."

print("Updated Section 3 successfully.")

# Helper functions for adding Section 10 content
def add_h(text, level):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    if level == 1:
        run.font.size = Pt(17)
        run.font.color.rgb = RGBColor(15, 23, 42)
    elif level == 2:
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(2, 132, 199)
    elif level == 3:
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(30, 41, 59)
    elif level == 4:
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(71, 85, 105)
    return p

def add_p(text, bold_prefix=None, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.size = Pt(9.5)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    run = p.add_run(text)
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.size = Pt(9.5)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    run = p.add_run(text)
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_fig(img_name, fig_num, caption):
    img_path = os.path.join(SCREENSHOTS_DIR, img_name)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(3)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(6.2))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(1)
        p_cap.paragraph_format.space_after = Pt(8)
        run_fig = p_cap.add_run(f"Figure {fig_num}: ")
        run_fig.bold = True
        run_fig.font.size = Pt(9.5)
        run_fig.font.color.rgb = RGBColor(2, 132, 199)
        run_desc = p_cap.add_run(caption)
        run_desc.italic = True
        run_desc.font.size = Pt(9.5)
        run_desc.font.color.rgb = RGBColor(100, 116, 139)
    else:
        print(f"ERROR: Image {img_name} not found!")

# ==============================================================================
# SECTION 10: COMPREHENSIVE VISUAL MANUAL
# ==============================================================================
add_h("10. Comprehensive Visual Manual: 4 Role-Based Dashboards & Operational Walkthrough", level=1)
add_p("This chapter provides an exhaustive visual reference, interface guide, and operational walkthrough of all four deployed dashboards across the Atomy India enterprise platform. In accordance with the platform's territory distribution architecture, the visual walkthrough is organized in sequential order: (1) Super Admin Dashboard, (2) Regional Distributor Dashboard (Primary Manager), (3) Substitute Distributor Dashboard (Standby & Acting Relief), and (4) Customer Storefront & Dashboard Experience.")

# ------------------------------------------------------------------------------
# 10.1 SUPER ADMIN DASHBOARD
# ------------------------------------------------------------------------------
add_h("10.1 Super Admin Dashboard (/admin): Central Governance & Global Logistics Master", level=2)
add_p("The Super Admin Dashboard serves as the central command console for enterprise executives and supply-chain controllers. It provides global oversight across nationwide sales, central inventory, territory distributor allocations, commission settlements, and platform compliance rules.")

# 10.1.1 Overview
add_h("10.1.1 Overview & Executive Command Dashboard", level=3)
add_fig("01_super_admin_overview.png", "10.1", "Super Admin Console - Overview Command Dashboard with Real-time Sales KPIs & Analytics")
add_p("The Overview Dashboard provides enterprise leadership with real-time visibility into overall platform performance, live sales volume, active distributor counts, and urgent fulfillment alerts.")
add_bullet("Displays Today's Orders, Today's Sales across all hubs, Lifetime Gross Revenue, Active Hubs Count, Total Distributors, and Registered Customers.", bold_prefix="Luminescent KPI Metric Cards: ")
add_bullet("Provides 1-click jump shortcuts to Orders, Finance, Distributors, Inventory, and Customer Directory.", bold_prefix="Interactive Navigation Triage: ")
add_bullet("Visual breakdown of purchasing volume across hourly windows, highlighting peak checkout times.", bold_prefix="Hourly Sales & Order Trend Analytics: ")

# 10.1.2 Product Catalog & Master Inventory
add_h("10.1.2 Product Catalog & Warehouse Master Inventory", level=3)
add_fig("02_super_admin_inventory.png", "10.2", "Master Catalog & Warehouse Stock Management - 82 Catalog SKUs & Dual Pricing")
add_p("The Master Inventory view enables central warehouse managers to maintain the complete 82-item catalog, configure pricing tiers, and inspect global stock availability.")
add_bullet("Maintains Retail Price (MRP) and discounted Distributor Price (DP) with real-time wholesale margin calculations.", bold_prefix="Dual-Tier Pricing Engine: ")
add_bullet("Assigns authentic Point Value (PV) points to each SKU to drive the network marketing bonus structure.", bold_prefix="Personal PV Allocation: ")
add_bullet("Allows updating product titles, category tags, batch numbers, safety stock buffer limits, and embedded educational video URLs.", bold_prefix="Catalog Editing Drawer: ")

# 10.1.3 Customer Orders
add_h("10.1.3 Customer Orders & Consignment Fulfillment Management", level=3)
add_fig("09_super_admin_orders.png", "10.3", "Inbound Customer Orders Pipeline - Status Filter Tabs, Carrier AWB Logging & Tax Invoices")
add_p("The Orders module oversees all customer transactions across all Indian territories, monitoring order lifecycle states from placement to carrier delivery.")
add_bullet("Segments orders into All, Processing, Dispatched, Delivered, and Delayed categories.", bold_prefix="Status Pipeline Tabs: ")
add_bullet("Staff attach courier tracking numbers (e.g. Blue Dart AWB) upon consignment dispatch.", bold_prefix="Consignment Airway Bill (AWB) Logging: ")
add_bullet("1-click generation and download of legal GST tax invoices with itemized HSN codes and tax breakdown.", bold_prefix="GST Tax Invoice Generation: ")

# 10.1.4 Finance & Settlements
add_h("10.1.4 Financial Operations & Settlement Engine", level=3)
add_fig("10_super_admin_finance.png", "10.4", "Financial Operations & Settlements Engine - UPI Gateway Reconciliation & Refund Ledger")
add_p("The Finance & Settlements Engine reconciles payment gateway transactions, handles consumer refund triage, and audits distributor commission liability.")
add_bullet("Itemizes gross sales, net settlements, pending refunds, and total distributor commission accruals.", bold_prefix="Neomorphic Financial Grid: ")
add_bullet("Tracks payment channels: UPI (Google Pay, PhonePe, Paytm), Net Banking, Cards, and COD.", bold_prefix="Payment Gateway Settlement Matrix: ")
add_bullet("Authorizes 100% pre-dispatch cancellations and 7-day zero-cost replacements for verified transit damage.", bold_prefix="Refund & Replacement Queue: ")

# 10.1.5 Territory Management
add_h("10.1.5 Territory & Postal PIN Code Management", level=3)
add_fig("03_super_admin_territories.png", "10.5", "Territory Management Console - All-India 19,000+ PIN Code Directory & 1:1 Distributor Allocation")
add_p("This console manages all-India postal delivery routing, enforcing the enterprise rule that strictly one distributor franchise is assigned per PIN code.")
add_bullet("Filters PIN codes by state, district, or 6-digit postal code to audit regional coverage.", bold_prefix="All-India Postal Directory: ")
add_bullet("Enforces 1:1 distributor assignment (e.g. PIN 635002 assigned exclusively to Selva Atomy Regional Hub).", bold_prefix="1-to-1 Territory Allocation: ")
add_bullet("Instantly identifies unassigned postal zones and reserves them for prospective franchise partners.", bold_prefix="Vacant vs. Assigned Triage: ")

# 10.1.6 Invite Distributors
add_h("10.1.6 Distributor Onboarding & Franchise Invitation Console", level=3)
add_fig("04_super_admin_invite_distributors.png", "10.6", "Distributor Onboarding Console - Franchise Invitations, Security Verification & Territory Grants")
add_p("Allows enterprise administrators to invite new franchise owners, register regional hubs, and establish contractual commission terms.")
add_bullet("Super Admin inputs business name, contact person, mobile number, and target postal territory.", bold_prefix="Franchise Invitation Form: ")
add_bullet("Assigns standard 8.0% commission rates and territory fees for new regional hub partners.", bold_prefix="Commission & Commercial Terms: ")
add_bullet("Audits active, pending, and expired invitations with 1-click re-invite capabilities.", bold_prefix="Invitation Tracking Table: ")

# 10.1.7 Customer Accounts
add_h("10.1.7 Customer Accounts & Member Network Directory", level=3)
add_fig("11_super_admin_customers.png", "10.7", "Customer Accounts Directory - Verified Consumer Profiles, Registration Source & Lifetime PV")
add_p("A central directory of all consumer and distributor accounts registered across the storefront and mobile application.")
add_bullet("Displays customer ID, name, verified email, phone number, and delivery city/district.", bold_prefix="Customer Profile Records: ")
add_bullet("Audits total Point Value accumulated by each customer across their purchase history.", bold_prefix="Lifetime Accumulated Personal PV: ")
add_bullet("Enables administrators to inspect order frequency, reset access credentials, or audit dispute history.", bold_prefix="Account Administration: ")

# 10.1.8 Membership Privileges
add_h("10.1.8 Membership Privilege Tiers & Qualification Engine", level=3)
add_fig("05_super_admin_membership.png", "10.8", "Membership Privilege Management - Tier Qualification Rules, Annual Renewals & Benefit Matrix")
add_p("Controls the multi-tier distributor framework, membership qualification criteria, wholesale discounts, and annual renewal schedules.")
add_bullet("Configures privilege tiers across General Consumer, Verified Distributor, and Regional Hub Partner.", bold_prefix="Tier Hierarchy Governance: ")
add_bullet("Automates entitlement checks for wholesale pricing (DP) and PV bonus multipliers.", bold_prefix="Wholesale Discount Automation: ")
add_bullet("Monitors distributor subscription validity, renewal reminders, and grace period settings.", bold_prefix="Annual Renewal Cycle: ")

# 10.1.9 Support Desk
add_h("10.1.9 Customer Support Desk & Dispute Resolution Desk", level=3)
add_fig("12_super_admin_support.png", "10.9", "Customer Support & Dispute Desk - Transit Damage Claims, Replacement Dispatch & SLA Monitor")
add_p("Handles escalated customer tickets, shipping breakage claims, delivery inquiries, and dispute resolutions.")
add_bullet("Enables agents to review customer defect reports (photos of cracked bottles or leaked seals) and authorize immediate zero-cost reshipment.", bold_prefix="Transit Damage Processing: ")
add_bullet("Monitors customer service inquiry resolution within a guaranteed 4-hour SLA window.", bold_prefix="SLA Target Tracking: ")
add_bullet("Maintains full audit trails of agent responses and customer satisfaction scores.", bold_prefix="Ticket Activity Log: ")

# 10.1.10 Coupons & Offers
add_h("10.1.10 Coupons, Vouchers & Promotional Discounts Engine", level=3)
add_fig("07_super_admin_coupons.png", "10.10", "Coupons & Offers Engine - Promo Codes, Discount Percentages & Minimum Cart Thresholds")
add_p("Empowers marketing teams to launch targeted discount vouchers, seasonal promotions, and affiliate discount campaigns.")
add_bullet("Supports percentage discounts (e.g. HEMOHIM20 for 20% off) or fixed rupee deductions (e.g. WELCOME500).", bold_prefix="Voucher Configuration: ")
add_bullet("Enforces minimum qualifying cart subtotals (e.g. orders above ₹2,000) to protect product margins.", bold_prefix="Cart Threshold Rules: ")
add_bullet("Sets active start dates, expiration timestamps, and global maximum redemption counts.", bold_prefix="Campaign Scheduling: ")

# 10.1.11 Floating Ads & Banners
add_h("10.1.11 Promotional Banner & Floating Ad Campaign Manager", level=3)
add_fig("06_super_admin_floating_ad.png", "10.11", "Ad & Promotion Manager - Hero Sliders, Floating Flash Banners & Notice Tickers")
add_p("Directs all visual marketing assets displayed on the customer storefront homepage and mobile app.")
add_bullet("Uploads high-resolution promotional artwork for rotating carousel slides (HemoHIM, Absolute Skincare).", bold_prefix="Hero Carousel Management: ")
add_bullet("Configures corner floating ad cards with direct product links and flash-sale countdown timers.", bold_prefix="Floating Action Cards: ")
add_bullet("Updates real-time marquee announcements (e.g. regional delivery delays or holiday notices).", bold_prefix="Live Notice Ticker: ")

# 10.1.12 System Settings
add_h("10.1.12 System Settings & GSTIN Legal Identity Console", level=3)
add_fig("08_super_admin_settings.png", "10.12", "System Settings Console - Company Profile, GSTIN Legal Identity & Audio Notifications")
add_p("Controls enterprise governance, tax compliance, notification parameters, and administrator security credentials.")
add_bullet("Displays official company name, registered Gurugram corporate address, and verified GSTIN for B2B tax compliance.", bold_prefix="Legal Tax Compliance: ")
add_bullet("Configures real-time audio chime alerts for incoming consumer orders and support tickets.", bold_prefix="Audio & Alert Preferences: ")
add_bullet("Enables two-factor authentication (2FA), session IP auditing, and password security rotations.", bold_prefix="Admin Security Controls: ")

print("Super Admin section compiled.")

# ------------------------------------------------------------------------------
# 10.2 REGIONAL DISTRIBUTOR DASHBOARD (PRIMARY MANAGER - SELVA HUB 635002)
# ------------------------------------------------------------------------------
add_h("10.2 Regional Distributor Dashboard (/distributor): Frontline Hub Operations & Fulfillment", level=2)
add_p("The Regional Distributor Dashboard is the primary frontline operations engine of the Atomy India supply chain. In this business model, the Regional Distributor (Selva Kumar - Selva Atomy Regional Hub, PIN 635002) directly handles local customer relationships, maintains local shelf inventory, fulfills territory delivery dispatches, verifies 6-digit pickup OTPs at the hub counter, and earns an 8.0% franchise commission.")

# 10.2.1 Hub Command Center
add_h("10.2.1 Regional Hub Command Center & Sales Overview", level=3)
add_fig("13_distributor_overview.png", "10.13", "Regional Distributor Hub Overview - Territory Order Volume, Counter Pickups & 8% Commissions")
add_p("Provides the primary franchise owner with an executive snapshot of regional logistics operations, pending orders, and commission earnings.")
add_bullet("Displays total orders received within the assigned PIN (635002), dispatched shipments, and pending customer counter pickups.", bold_prefix="Territory Operational KPIs: ")
add_bullet("Real-time counter calculating total retail volume routed through the hub and accumulated 8.0% commissions.", bold_prefix="Commission Accrual Tracker: ")
add_bullet("Displays registered hub details: 'Selva Atomy Regional Hub', primary PIN 635002, Bayanapalli, Krishnagiri.", bold_prefix="Hub Identity Banner: ")

# 10.2.2 Live Hub Inventory
add_h("10.2.2 Live Hub Inventory & Safety Reserve Buffer Control", level=3)
add_fig("14_distributor_inventory.png", "10.14", "Regional Hub Stock Control - Local Shelf Quantities, Safety Reserve Buffers & Reorder Alerts")
add_p("Manages physical inventory stocked at the local franchise warehouse, ensuring accurate stock availability is broadcast to nearby customers.")
add_bullet("Lists available stock for all 82 catalog products physically stored at the Krishnagiri hub.", bold_prefix="Local Stock Ledger: ")
add_bullet("Enforces a mandatory 1-unit safety reserve buffer (e.g. if stock is 50, maximum orderable is 49) to prevent overselling.", bold_prefix="Reserve Buffer Automation: ")
add_bullet("Highlights products nearing stock depletion with visual warnings to prompt restocking requests from the central warehouse.", bold_prefix="Low Stock Reorder Alerts: ")

# 10.2.3 Hub Customer Orders & OTP Verification
add_h("10.2.3 Hub Customer Orders & 6-Digit OTP Counter Pickup Verification", level=3)
add_fig("15_distributor_orders.png", "10.15", "Hub Orders & Handover Console - 6-Digit OTP Verification for Direct Counter Collections")
add_p("The core frontline fulfillment console where the Regional Distributor manages parcel packing, carrier dispatches, and in-person counter handovers.")
add_bullet("Differentiates Doorstep Courier shipments from Direct Hub Counter Collections.", bold_prefix="Delivery Mode Segmentation: ")
add_bullet("When a customer arrives at the hub counter, the distributor enters the customer's 6-digit OTP into the verification modal. The system validates the code and records the parcel as officially delivered.", bold_prefix="6-Digit OTP Counter Verification: ")
add_bullet("For home delivery orders, the distributor logs local courier consignment tracking numbers.", bold_prefix="Line-Haul Courier Dispatch: ")

# 10.2.4 Territory Customers Directory
add_h("10.2.4 Territory Customers Directory & Local Member Accounts", level=3)
add_fig("16_distributor_customers.png", "10.16", "Regional Customers Directory - Registered Consumers in PIN 635002 Territory & Order Histories")
add_p("Gives the distributor visibility into all consumers residing in their postal franchise area, fostering strong local customer relationships.")
add_bullet("Filters customer accounts residing in Krishnagiri PIN 635002 territory.", bold_prefix="Territory Customer Roster: ")
add_bullet("Shows customer purchase frequency, lifetime order totals, and preferred delivery methods (Hub Pickup vs. Doorstep).", bold_prefix="Order History Tracking: ")
add_bullet("Provides direct phone and email contact details for delivery coordination and pickup reminders.", bold_prefix="Direct Communication Channels: ")

# 10.2.5 Hub Member PV Network
add_h("10.2.5 Hub Member PV Network & Personal Bonus Audit", level=3)
add_fig("18_distributor_membership.png", "10.17", "Hub Member PV Console - Local Member Bonus Accumulation & Tier Progression")
add_p("Monitors the network marketing Point Value (PV) performance of members associated with the regional distributor's hub.")
add_bullet("Tracks personal PV accumulated by territory members, driving distributor tier advancement.", bold_prefix="Member PV Accumulation: ")
add_bullet("Identifies top-tier purchasing members eligible for promotional distributor privileges.", bold_prefix="High-Volume Member Recognition: ")
add_bullet("Audits commission allocations derived from PV bonus points generated within the franchise territory.", bold_prefix="PV-to-Commission Reconciliation: ")

# 10.2.6 Hub Settlements & Commission Ledger
add_h("10.2.6 Hub Settlements & 8.0% Territory Commission Ledger", level=3)
add_fig("19_distributor_finance.png", "10.18", "Hub Financial Ledger - 8% Commission Accrual, Payout Requests & Order Itemization")
add_p("Provides exhaustive financial accounting for the franchise owner, itemizing every earned commission per completed order.")
add_bullet("Automatically computes 8.0% commission on the gross total of every order delivered by the hub.", bold_prefix="8.0% Franchise Commission: ")
add_bullet("Displays available commission balance ready for withdrawal and settled payout history.", bold_prefix="Wallet & Payout Requests: ")
add_bullet("Itemizes transaction IDs, customer names, delivery dates, and exact rupee commission earned per order.", bold_prefix="Transaction Audit Ledger: ")

# 10.2.7 Hub Support Desk
add_h("10.2.7 Hub Support Desk & Regional Delivery Inquiries", level=3)
add_fig("17_distributor_support.png", "10.19", "Hub Support Desk - Local Delivery Questions, Pickup Reminders & Customer Resolutions")
add_p("Enables the local distributor to resolve customer questions regarding hub opening hours, order ready status, and counter pickup directions.")
add_bullet("Lists customer inquiries specifically routed to Selva Hub for local resolution.", bold_prefix="Territory Ticket Queue: ")
add_bullet("Provides automated message templates with hub address (RK Tower, Bayanapalli) and operating hours (9:30 AM - 7:30 PM).", bold_prefix="Quick Pickup Guidance: ")
add_bullet("Allows local distributors to escalate product defects to Super Admin for warranty replacements.", bold_prefix="Central Escalation Pathway: ")

# 10.2.8 Hub Settings & Leave Delegation
add_h("10.2.8 Hub Settings & Manager Leave Delegation Console", level=3)
add_fig("20_distributor_settings.png", "10.20", "Hub Settings Console - Primary Manager Leave Delegation, Co-Manager Assignment & Hub Info")
add_p("The operational settings console featuring the Primary Manager Leave Delegation architecture that powers the Substitute Distributor role.")
add_bullet("Maintains hub legal business name, manager contact person (Selva Kumar), phone (+91 95388 53454), and physical address.", bold_prefix="Franchise Identity Profile: ")
add_bullet("Allows Selva Kumar to enter leave dates, provide a handover reason, and designate an authorized Substitute/Co-Manager.", bold_prefix="Leave Delegation Console: ")
add_bullet("Clicking 'Activate Leave Delegation' sets status to 'ON_LEAVE', which automatically unlocks full operational permissions for the Substitute Distributor.", bold_prefix="Relief Activation Switch: ")

print("Regional Distributor section compiled.")

# ------------------------------------------------------------------------------
# 10.3 SUBSTITUTE DISTRIBUTOR DASHBOARD (CO-MANAGER / ACTING RELIEF)
# ------------------------------------------------------------------------------
add_h("10.3 Substitute Distributor Dashboard (/distributor): Standby Relief & Operational Redundancy", level=2)
add_p("The Substitute Distributor (Co-Manager) Dashboard provides operational continuity and prevents single-point-of-failure risks. Under standard conditions, the substitute remains in Standby Relief Mode to prevent double-entry. When the primary manager takes leave, the substitute automatically assumes full acting authority.")

# 10.3.1 Standby Mode
add_h("10.3.1 Standby Relief Mode (Primary Manager Active — Operational Lock)", level=3)
add_fig("21_substitute_standby_mode.png", "10.21", "Substitute Distributor Standby View - Operational Lockout While Primary Manager is Active")
add_p("When the Primary Distributor (Selva Kumar) is actively on duty, the Substitute Distributor's console enforces strict operational lockout.")
add_bullet("A high-visibility banner informs the co-manager that Primary Manager Selva Kumar is on duty.", bold_prefix="Standby Relief Banner: ")
add_bullet("Operational navigation tabs (Inventory, Orders, Customers, Membership, Settlements) are securely locked to prevent conflicting dispatches or unauthorized actions.", bold_prefix="Security Lockout Controls: ")
add_bullet("Displays parent hub name, territory PIN (635002), and substitute account ID for verification.", bold_prefix="Franchise Summary Card: ")

# 10.3.2 Acting Mode
add_h("10.3.2 Acting Hub Manager Mode (Primary on Leave — Operational Unlock)", level=3)
add_fig("22_substitute_acting_orders.png", "10.22", "Acting Hub Manager Console - Unlocked Order Fulfillment & OTP Handover During Primary Leave")
add_p("The moment the Primary Manager activates leave, the Substitute Distributor dashboard seamlessly unlocks full operational capabilities.")
add_bullet("The substitute gains full access to fulfill inbound customer orders and record carrier tracking.", bold_prefix="Unlocked Dispatch Authority: ")
add_bullet("The substitute can verify 6-digit customer pickup OTPs at the counter, ensuring customer collections are never delayed.", bold_prefix="Counter OTP Verification: ")
add_bullet("All actions taken during relief duty are logged with the substitute's timestamp for transparent audit upon the primary manager's return.", bold_prefix="Handover Activity Logging: ")

print("Substitute Distributor section compiled.")

# ------------------------------------------------------------------------------
# 10.4 CUSTOMER DASHBOARD & STOREFRONT EXPERIENCE
# ------------------------------------------------------------------------------
add_h("10.4 Customer Dashboard & Storefront Experience (/ & /profile): Consumer Journey", level=2)
add_p("The Customer Storefront delivers a friction-free, omnichannel shopping experience. In the regional distribution architecture, the customer discovers local hub stock, reviews itemized product summaries, executes multi-channel payments, and monitors live 5-stage consignment milestones with 6-digit pickup OTPs.")

# 10.4.1 Storefront Home
add_h("10.4.1 Customer Storefront Home & Shopping Mall Showcase", level=3)
add_fig("clean_01_customer_home.png", "10.23", "Customer Storefront Home - Category Navigation, Promotional Hero Carousel & Notice Ticker")
add_p("The brand entrance showcasing promotional campaigns, category quick-filters, and immediate regional stock indicators with zero intrusive ad popups.")
add_bullet("High-definition rotating promotional slides featuring flagship Atomy product lines.", bold_prefix="Hero Promotional Carousel: ")
add_bullet("Instant zero-reload filtering across Health Care, Skin Care, Personal Care, Food, and Home.", bold_prefix="Category Filter Navigation: ")
add_bullet("Top header displays the customer's active delivery PIN (635002) and connected Selva Atomy Regional Hub.", bold_prefix="Delivery Location Badge: ")

# 10.4.2 Product Detail
add_h("10.4.2 Product Details & Educational View (HemoHIM Formulation)", level=3)
add_fig("clean_02_product_detail.png", "10.24", "Product Detail Page - Transparent Dual Pricing (Retail MRP vs Member DP), Earned PV & Selva Hub Stock")
add_p("Delivers thorough product education, pricing transparency, Point Value rewards, and local hub stock validation.")
add_bullet("Contrasts standard Retail MRP (₹13,000) with discounted Member/Distributor Price (₹9,450).", bold_prefix="Dual-Tier Price Transparency: ")
add_bullet("Clearly displays the exact Point Value (PV) earned upon purchase (80,000 PV).", bold_prefix="Earned PV Badge: ")
add_bullet("Validates that the product is 'In Stock at Selva atomy hub (PIN 635002) • Fast Regional Dispatch'.", bold_prefix="Regional Hub Stock Confirmation: ")
add_bullet("Provides quantity selectors, 1-click 'Add to Cart', and instant 'Buy Now' buttons.", bold_prefix="Instant Checkout Triggers: ")

# 10.4.3 Product Summary & Cart
add_h("10.4.3 Product Summary & Shopping Cart Ledger", level=3)
add_fig("clean_03_product_summary.png", "10.25", "Product Summary & Shopping Cart - Itemized Quantities, Wholesale Member Pricing & Free Delivery Tracker")
add_p("The itemized cart summary where consumers verify product selections, adjust quantities, and review total accumulated PV points before purchasing.")
add_bullet("Displays SKU line items, thumbnail previews, selected quantities, and discounted member prices.", bold_prefix="Itemized Product Roster: ")
add_bullet("Real-time calculator summing Point Value (PV) earned across all selected products.", bold_prefix="Total PV Accumulation: ")
add_bullet("Free Shipping progress bar confirming that orders above ₹4,500 qualify for free regional dispatch.", bold_prefix="Delivery Fee Incentive: ")

# 10.4.4 Payment Page
add_h("10.4.4 Payment & Checkout Order Sheet (Multi-Channel Gateways)", level=3)
add_fig("clean_04_payment_page.png", "10.26", "Checkout Order Sheet - Fulfillment Method Selection (Hub Counter Pickup vs Doorstep Courier) & Payment Options")
add_p("Guides the consumer through final fulfillment choices and secure multi-channel payment gateway transactions.")
add_bullet("Customers choose between Free Counter Collection at Selva Hub or Home Courier Delivery.", bold_prefix="Fulfillment Mode Selector: ")
add_bullet("Integrated UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit/Debit Cards, and Cash on Delivery (COD).", bold_prefix="Multi-Channel Payment Gateways: ")
add_bullet("Allows entering discount vouchers (e.g. HEMOHIM20) for instant price deductions.", bold_prefix="Coupon & Voucher Application: ")
add_bullet("Complete financial breakdown of subtotal, tax breakdown, shipping charges, and final payable amount.", bold_prefix="Order Cost Breakdown: ")

# 10.4.5 Order History & OTP
add_h("10.4.5 Order History, Consignment Tracking Stepper & Pickup OTP", level=3)
add_fig("clean_05_order_history.png", "10.27", "Live Order Tracking - 5-Stage Milestone Progress Stepper & 6-Digit Counter Pickup OTP")
add_p("Provides real-time consignment visibility and generates the secure 6-digit OTP needed for in-person hub counter collections.")
add_bullet("Visual progress indicator: Order Placed -> Verified -> Packed -> Dispatched -> Delivered.", bold_prefix="5-Stage Consignment Stepper: ")
add_bullet("For hub pickup orders, prominently displays the confidential 6-digit OTP (e.g. 842915) to be presented to distributor Selva Kumar.", bold_prefix="6-Digit Counter Pickup OTP: ")
add_bullet("Lists distributor contact details, hub operating hours (9:30 AM - 7:30 PM), and pickup instructions.", bold_prefix="Hub Pickup Instructions: ")
add_bullet("Enables customers to instantly download official GST tax invoices with commercial HSN breakdowns.", bold_prefix="Tax Invoice Download: ")

# 10.4.6 Customer Profile & PV Console
add_h("10.4.6 Customer Profile, Address Book & Personal PV Points Console", level=3)
add_fig("28_customer_profile_pv.png", "10.28", "Customer Profile Console - Member Credentials, Address Book & Lifetime Personal PV Balance")
add_p("Empowers buyers to manage personal account details, shipping addresses, and lifetime network marketing bonuses.")
add_bullet("Displays customer ID (CUST-20261009-1001), verified mobile, email, and member status.", bold_prefix="Member Identity Profile: ")
add_bullet("Tracks cumulative lifetime personal PV earned across all purchases, driving tier progression.", bold_prefix="Lifetime Personal PV Balance: ")
add_bullet("Enables managing multiple shipping destinations with automatic PIN code validation.", bold_prefix="Saved Address Management: ")

print("Customer Storefront section compiled.")

# Save to target file
doc.save(TARGET_DOC)
print(f"=== SUCCESSFULLY GENERATED UPDATED DOCUMENT AT {TARGET_DOC} ===")
print(f"Final paragraph count: {len(doc.paragraphs)}")
