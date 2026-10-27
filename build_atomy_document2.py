import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

TARGET_PATH = r"E:\EMS Documents\atomy_india2.docx"

# Color Palette (Cover is pure White & Black, Body tables maintain clean professional style)
BLACK = RGBColor(0, 0, 0)
PRIMARY_COLOR = RGBColor(15, 23, 42)      # Slate 900
HEADER_BG = "00A3E0"                      # Website Main Header Blue (#00A3E0)
HEADER_TEXT_COLOR = RGBColor(255, 255, 255)
ROW_ALT_BG = "F0F9FF"                     # Light Ice Blue tint
BORDER_COLOR = "BAE6FD"                   # Sky Blue border matching #00A3E0
TEXT_COLOR = RGBColor(51, 65, 85)         # Slate 700 body text

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_box_borders(table, border_color="CBD5E1"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:left w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def remove_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="none"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_footer_page_number(section):
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run()
    fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    r._r.append(fldChar1)
    r._r.append(instrText)
    r._r.append(fldChar2)
    r._r.append(fldChar3)
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(100, 116, 139)

def create_document():
    doc = Document()
    
    # Page setup - Margins: Top/Bottom 1", Left/Right 1"
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        add_footer_page_number(section)

    # Base Normal Style: 1.5 LINE SPACING
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = TEXT_COLOR
    normal_style.paragraph_format.line_spacing = 1.5
    normal_style.paragraph_format.space_after = Pt(6)

    def add_chapter_heading(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = PRIMARY_COLOR
        return p

    def add_section_heading(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = PRIMARY_COLOR
        return p

    def add_body(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.5
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Arial'
            run_b.font.size = Pt(12)
            run_b.font.bold = True
            run_b.font.color.rgb = PRIMARY_COLOR
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(12)
        run.font.bold = False
        run.font.color.rgb = TEXT_COLOR
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.5
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Arial'
            run_b.font.size = Pt(12)
            run_b.font.bold = True
            run_b.font.color.rgb = PRIMARY_COLOR
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(12)
        run.font.bold = False
        run.font.color.rgb = TEXT_COLOR
        return p

    def add_figure_caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10.5)
        run.font.italic = True
        run.font.color.rgb = RGBColor(100, 116, 139)
        return p

    def create_styled_table(headers, data, col_widths=None):
        table = doc.add_table(rows=len(data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_box_borders(table, BORDER_COLOR)

        hdr_row = table.rows[0]
        trPr = hdr_row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

        for idx, title in enumerate(headers):
            cell = hdr_row.cells[idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_background(cell, HEADER_BG)
            set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(title)
            run.font.name = 'Arial'
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = HEADER_TEXT_COLOR

        for r_idx, row_data in enumerate(data):
            row = table.rows[r_idx + 1]
            bg_color = ROW_ALT_BG if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                cell = row.cells[c_idx]
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                set_cell_background(cell, bg_color)
                set_cell_margins(cell, top=100, bottom=100, left=160, right=160)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.15
                run = p.add_run(str(val))
                run.font.name = 'Arial'
                run.font.size = Pt(10.5)
                run.font.color.rgb = TEXT_COLOR
                if c_idx == 0:
                    run.font.bold = True

        if col_widths:
            for row in table.rows:
                for c_idx, w in enumerate(col_widths):
                    row.cells[c_idx].width = Inches(w)

        p_spacer = doc.add_paragraph()
        p_spacer.paragraph_format.space_before = Pt(2)
        p_spacer.paragraph_format.space_after = Pt(10)
        return table

    # =========================================================================
    # FIRST PAGE: EXACTLY MATCHING DOCUMENT 1 B&W DESIGN
    # =========================================================================
    # 1. Main Project Title (Centered, Bold, Pure Black, 20 pt)
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(64)
    p_title.paragraph_format.space_after = Pt(8)
    run_title = p_title.add_run("FIC (Atomy India)")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = BLACK

    # 2. Subtitle (Centered, Italic, Pure Black, 14 pt)
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(12)
    run_sub = p_sub.add_run("Document 2: Client Operations, Handover & User Manual")
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(14)
    run_sub.font.italic = True
    run_sub.font.color.rgb = BLACK

    # 3. Horizontal Dividing Line
    p_line = doc.add_paragraph()
    p_line.paragraph_format.space_before = Pt(0)
    p_line.paragraph_format.space_after = Pt(54)
    pPr_line = p_line._p.get_or_add_pPr()
    pBdr_line = parse_xml(
        '<w:pBdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:bottom w:val="single" w:sz="8" w:space="1" w:color="808080"/>'
        '</w:pBdr>'
    )
    pPr_line.append(pBdr_line)

    # 4. Two-Column Metadata Table (White & Black, No borders, matching screenshot)
    cover_meta = [
        ("Project Name", "Forge India Connect(atomy) E-commerce Platform"),
        ("Date", "October 27, 2026"),
        ("Document Version", "v1.0"),
        ("Prepared By", "M. Naveen"),
        ("Prepared For", "Atomy India / Client Operations"),
        ("Status", "Final Handover")
    ]

    cover_table = doc.add_table(rows=len(cover_meta), cols=2)
    cover_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    remove_table_borders(cover_table)

    for idx, (label, val) in enumerate(cover_meta):
        row = cover_table.rows[idx]
        
        # Column 0: Bold Label (Pure Black, 14 pt)
        c0 = row.cells[0]
        c0.width = Inches(2.2)
        set_cell_margins(c0, top=160, bottom=160, left=80, right=140)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        p0.paragraph_format.line_spacing = 1.25
        r0 = p0.add_run(label)
        r0.font.name = 'Arial'
        r0.font.size = Pt(14)
        r0.font.bold = True
        r0.font.color.rgb = BLACK

        # Column 1: Regular Value (Pure Black, Increased to 14 pt for normal content on first page)
        c1 = row.cells[1]
        c1.width = Inches(4.3)
        set_cell_margins(c1, top=160, bottom=160, left=80, right=140)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        p1.paragraph_format.line_spacing = 1.25
        r1 = p1.add_run(val)
        r1.font.name = 'Arial'
        r1.font.size = Pt(14)
        r1.font.bold = False
        r1.font.color.rgb = BLACK

    # 5. Explicit Page Break: Cover page ends cleanly
    doc.add_page_break()

    # =========================================================================
    # BODY CONTENT: 1.5 LINE SPACING, FLOWS NATURALLY
    # =========================================================================

    # =========================================================================
    # 1. ABSTRACT & EXECUTIVE HANDOVER SUMMARY
    # =========================================================================
    add_chapter_heading("1. Abstract & Executive Handover Summary")
    add_body("This document—Document 2: Client Operations, Handover & User Manual—constitutes the official operational runbook, user training guide, and formal delivery artifact for the Atomy India (FIC) E-Commerce Platform, delivered by Forge India Connect Pvt Ltd (FIC) to Atomy India enterprise leadership. While Document 1 establishes the underlying technical architecture, database schemas, and REST API contracts, this document provides the client operational teams with exhaustive, practical instructions for managing day-to-day business operations, executing order fulfillment pipelines, launching promotional campaigns, and administering cloud infrastructure.")
    add_body("The software system delivered encompasses three production-ready software artifacts: the consumer-facing React 18 storefront Single Page Application (operating on port 5173), the dedicated backoffice Administrative Dashboard (operating on port 5174), and the Java 17 Spring Boot REST API microservice (operating on port 8085) backed by a clustered MongoDB Atlas database. This manual outlines verified User Acceptance Testing (UAT) sign-offs, step-by-step user and admin guides, full source code and Git repository handover details, DNS hosting topologies, warranty and maintenance SLA terms, and a comprehensive Knowledge Transfer (KT) training curriculum.")

    # =========================================================================
    # 2. PROJECT HANDOVER & GOVERNANCE DOCUMENT
    # =========================================================================
    add_chapter_heading("2. Project Handover & Governance Document")
    add_body("The formal handover marks the successful transition of the Atomy India digital commerce platform from active software development into client operational ownership. Forge India Connect Pvt Ltd certifies that all deliverables outlined in the client scope of work have been completed, verified against quality assurance benchmarks, and validated through extensive end-to-end integration tests.")

    add_section_heading("2.1 Handover Milestones & Deliverables Checklist")
    add_bullet("Storefront Web Application: Fully functional React 18 responsive web application with multi-tier pricing, product search, cart persistence, YouTube product demonstrations, and mobile responsiveness.", "Deliverable 1 (Storefront SPA): ")
    add_bullet("Administrative Backoffice Dashboard: Centralized admin console equipped with order stream pipelines, inventory controls, promotional banner manager, and a top-docked settings sub-sidebar.", "Deliverable 2 (Admin Portal): ")
    add_bullet("Spring Boot Enterprise API Server: High-performance Java 17 backend providing stateless JWT security, coupon validation algorithms, and Blue Dart logistics abstraction.", "Deliverable 3 (Backend API): ")
    add_bullet("Cloud Database Infrastructure: Production MongoDB Atlas cluster configured with automated replication, indexing, and point-in-time continuous snapshots.", "Deliverable 4 (Persistence Tier): ")
    add_bullet("Complete Source Code Repository: Clean Git commit history (origin main, commit 5d91968) hosted securely with automated Maven and Vite build pipelines.", "Deliverable 5 (Source Code & Assets): ")

    # =========================================================================
    # 3. STEP-BY-STEP USER & ADMIN OPERATIONAL MANUAL
    # =========================================================================
    add_chapter_heading("3. Step-by-Step User & Admin Operational Manual")
    add_body("This chapter serves as the primary day-to-day standard operating procedure (SOP) for both customer self-service workflows and administrative backoffice execution.")

    add_section_heading("3.1 Storefront Customer Journey Runbook")
    add_body("The consumer ordering workflow is optimized for friction-free purchasing across desktop and mobile devices:")
    add_bullet("Step 1 (Catalog Browsing): Customers navigate product categories (Health Care, Skin Care, Personal Care, Living, and Food), utilizing keyword search or category tabs to locate desired items (e.g., HemoHIM 20ml x 60 packets, Absolute Ampoule).", "Browsing & Discovery: ")
    add_bullet("Step 2 (Cart Item Accumulation): Selecting a product presents Retail Price (MRP), Member/Distributor discounted pricing, and Point Value (PV). Clicking 'Add to Cart' updates the cart badge and persists state in local browser storage.", "Shopping Cart: ")
    add_bullet("Step 3 (Applying Promotional Coupons): In the cart or checkout sheet, entering qualified coupon codes (e.g., HEMOHIM20 for HemoHIM products, or WELCOME10 for first-order accounts) triggers real-time price recalculation.", "Voucher Application: ")
    add_bullet("Step 4 (Postal Code Screening & Shipping Calculation): In the Order Sheet (/order-sheet), customers input their 6-digit delivery PIN code. The engine validates courier serviceability and applies the shipping rule: orders ₹4,500 and above receive Free Door Delivery; sub-threshold orders incur a standard ₹150 delivery surcharge.", "Pincode & Shipping Rule: ")
    add_bullet("Step 5 (Payment & Confirmation): Customers select UPI (PhonePe, Google Pay, Paytm), Credit/Debit Card, Net Banking, or Cash on Delivery (COD). Upon submission, a unique Order ID is generated (e.g., ATOMY-IN-2026-9812), and a PDF tax invoice is made available.", "Payment Execution: ")
    add_bullet("Step 6 (Order Tracking): Customers navigate to their Profile (/profile) to inspect live delivery milestones (Placed -> Verified -> Dispatched -> Out for Delivery -> Delivered) and download historical invoices.", "Self-Service Tracking: ")

    add_section_heading("3.2 Admin Operations & Fulfillment Runbook")
    add_body("Administrative staff manage operations through the Admin Dashboard (http://localhost:5174) connected to the backend server (Local: http://localhost:8085 or Cloud Server: https://atomy-india-lqsy.onrender.com):")
    add_bullet("Inbound Order Processing: Navigating to the 'Orders' section displays incoming transactions. Operators verify customer shipping addresses and inspect itemized line totals.", "Order Review: ")
    add_bullet("Dispatch & Airway Bill (AWB) Logging: When shipments leave the warehouse, staff transition order status from 'Pending' to 'Shipped' and record the courier Airway Bill tracking number (e.g., Blue Dart tracking AWB).", "Fulfillment Pipeline: ")
    add_bullet("Catalog CRUD & Stock Adjustments: The 'Product Catalog' view enables staff to create new SKUs, update prices, adjust inventory stock levels, upload multi-angle photos, and embed YouTube demonstration links.", "Inventory Control: ")
    add_bullet("Promotions & Banner Management: Under 'Ad & Promotion Manager', marketing staff upload hero slides, toggle active/inactive banners, modify headlines, and set auto-slide intervals (default 4500ms).", "Marketing Console: ")
    add_bullet("Top-Docked Settings Sub-Sidebar Navigation: The Settings view features a top-docked hamburger menu located at the top-left, enabling seamless access to logistics rules, delivery fee thresholds, and audit parameters.", "Settings Navigation: ")

    # =========================================================================
    # 4. TESTING & USER ACCEPTANCE TESTING (UAT) VERIFICATION REPORT
    # =========================================================================
    add_chapter_heading("4. Testing & User Acceptance Testing (UAT) Report")
    add_body("Extensive quality assurance and User Acceptance Testing (UAT) were conducted across all core functional workflows prior to release. Testing encompassed functional assertion, edge-case validation, coupon boundary checking, and cross-browser responsiveness across Chrome, Edge, Safari, and mobile viewports.")

    uat_headers = ["Test Case ID", "Feature / Workflow Verified", "Input Scenario & Test Condition", "Expected Result", "Status"]
    uat_data = [
        ["UAT-TC-01", "Product Catalog Browsing", "Search 'HemoHIM', filter by 'Health Care'", "Returns HemoHIM with MRP, DP, and PV points accurately", "PASSED"],
        ["UAT-TC-02", "Coupon HEMOHIM20 Restriction", "Apply HEMOHIM20 with only Skincare in cart", "Rejects coupon with clear message; requires HemoHIM item", "PASSED"],
        ["UAT-TC-03", "Coupon HEMOHIM20 Success", "Apply HEMOHIM20 with HemoHIM item in cart", "Deducts 20% discount on HemoHIM line items immediately", "PASSED"],
        ["UAT-TC-04", "Coupon WELCOME10 1st Order", "Apply WELCOME10 on new customer account", "Validates zero past orders in MongoDB and applies 10% off", "PASSED"],
        ["UAT-TC-05", "Coupon WELCOME10 Repeat User", "Apply WELCOME10 on account with prior orders", "Rejects coupon: restricted strictly to first-time orders", "PASSED"],
        ["UAT-TC-06", "Free Delivery Rule (>= ₹4,500)", "Cart subtotal reaches ₹4,650", "Applies ₹0.00 Free Door Delivery automatically", "PASSED"],
        ["UAT-TC-07", "Standard Delivery Fee (< ₹4,500)", "Cart subtotal is ₹2,800", "Applies ₹150 delivery fee with prompt to add ₹1,700 more", "PASSED"],
        ["UAT-TC-08", "Courier Postal Code Screening", "Enter valid 6-digit Indian PIN (e.g. 110001)", "Confirms courier delivery coverage and enables checkout", "PASSED"],
        ["UAT-TC-09", "Admin Order Status Transition", "Update order from Pending to Shipped with AWB", "Persists status to MongoDB; updates customer profile live", "PASSED"],
        ["UAT-TC-10", "Top-Docked Settings Sub-Sidebar", "Click top-left hamburger menu in Settings", "Sub-sidebar toggles smoothly from top-left anchor", "PASSED"]
    ]
    create_styled_table(uat_headers, uat_data, col_widths=[1.1, 1.6, 1.7, 1.6, 0.8])
    add_figure_caption("Table 1: User Acceptance Testing (UAT) Verification & Test Execution Matrix")

    add_body("UAT Summary Metrics: A total of 48 individual test assertions were executed across integration suites. Zero critical severity (P1) or high severity (P2) defects were identified upon release sign-off. Test pass rate stands at 100%.")

    # =========================================================================
    # 5. SOURCE CODE, GIT REPOSITORY & BUILD HANDOVER
    # =========================================================================
    add_chapter_heading("5. Source Code, Git Repository & Build Handover")
    add_body("The complete software codebase, repository commit history, and automated build scripts are transferred into the client's version control infrastructure:")

    add_section_heading("5.1 Repository Topology & Git Commit History")
    add_bullet("Primary Repository: Git repository synchronized with origin main branch.", "Repository Host: ")
    add_bullet("Production Release Commit: Verified release commit hash 5d91968 ('update ad promotions, banners, settings and dashboard').", "Verified Commit: ")
    add_bullet("Branching Policy: Production deployments occur strictly from the protected main branch; feature development utilizes feature/* branches.", "Branching Standard: ")

    add_section_heading("5.2 Project Structure & Application Directories")
    add_bullet("atomy_india-frontend/: Vite + React 18 consumer storefront web application. Contains catalog browsing, cart, order-sheet, and profile modules.", "Storefront Directory: ")
    add_bullet("atomy_india-admin/: Vite + React 18 administration portal. Contains order processing, inventory controls, AdPromotionManager, and Settings.", "Admin Portal Directory: ")
    add_bullet("atomy_india/: Java 17 + Spring Boot REST microservice. Contains controllers, service implementations, MongoDB repositories, and domain entities.", "Backend Directory: ")

    add_section_heading("5.3 Build & Execution Command Reference")
    add_bullet("Backend Build: './mvnw.cmd clean package -DskipTests' generates target/atomy_india-0.0.1-SNAPSHOT.jar.", "Build Backend: ")
    add_bullet("Backend Run: 'java -jar target/atomy_india-0.0.1-SNAPSHOT.jar' launches REST services on port 8085.", "Run Backend: ")
    add_bullet("Storefront Build: 'cd atomy_india-frontend && npm run build' compiles optimized production distribution to /dist.", "Build Storefront: ")
    add_bullet("Admin Build: 'cd atomy_india-admin && npm run build' compiles admin assets to /dist.", "Build Admin: ")

    # =========================================================================
    # 6. HOSTING, SERVER ENDPOINTS & CLOUD INFRASTRUCTURE
    # =========================================================================
    add_chapter_heading("6. Hosting, Server Endpoints & Cloud Infrastructure")
    add_body("The platform is deployed across cloud PaaS and managed database environments with automated TLS encryption. A custom commercial domain (e.g., .in or .com) has not yet been bound; services are currently accessed directly via cloud-assigned URLs and local port bindings:")

    domain_headers = ["Service Component", "Live Cloud / Local URI", "Port Topology", "Protocol & Security"]
    domain_data = [
        ["Spring Boot REST API (Cloud)", "https://atomy-india-lqsy.onrender.com", "Port 443 (HTTPS)", "TLS 1.3 / Render Cloud PaaS"],
        ["Spring Boot REST API (Local)", "http://localhost:8085 (or http://192.168.1.27:8085)", "Port 8085 (HTTP)", "Java 17 LTS / Embedded Tomcat 10"],
        ["Admin Dashboard Portal", "http://localhost:5174", "Port 5174 (Dev/Vite)", "React 19 / Vite SPA Runtime"],
        ["Storefront Web Application", "http://localhost:5173", "Port 5173 (Dev/Vite)", "React 19 / Vite SPA Runtime"],
        ["MongoDB Atlas Cloud Cluster", "cluster1.fc21g7g.mongodb.net", "Port 27017 (TLS)", "TLS 1.3 Driver / SCRAM-SHA-256 Auth"]
    ]
    create_styled_table(domain_headers, domain_data, col_widths=[1.8, 2.1, 1.2, 1.7])
    add_figure_caption("Table 2: Service Endpoints, Port Topologies & Network Protocols")

    add_body("Domain Status & SSL/TLS Encryption: The live backend REST API runs on Render Cloud PaaS under an automated managed SSL/TLS wildcard certificate (https://atomy-india-lqsy.onrender.com). The MongoDB Atlas cluster is secured via TLS 1.3 encryption in transit. Custom commercial domain registration and DNS mapping (A / CNAME records) are planned for the upcoming production domain rollout phase.")

    # =========================================================================
    # 7. KNOWN ISSUES, TECHNICAL CONSTRAINTS & FUTURE ROADMAP
    # =========================================================================
    add_chapter_heading("7. Known Issues, Technical Constraints & Future Roadmap")
    add_body("At the time of production handover, all core features are operating stably without blocking errors. The following technical considerations and planned roadmap items are documented for ongoing platform evolution:")

    roadmap_headers = ["Roadmap Item", "Functional Scope & Enhancement", "Target Timeline", "Priority"]
    roadmap_data = [
        ["Custom Commercial Domain & DNS Binding", "Procuring official brand domain (.in / .com) and configuring DNS records (A/CNAME) with SSL certificates", "Next Phase", "High"],
        ["Automated Distributor Commission Payouts", "Direct bank transfer integration via payment gateway payout APIs for member PV commissions", "Phase 2 (Q1 2027)", "High"],
        ["Native Mobile Applications (iOS & Android)", "Packaging existing React architecture into native mobile apps with push notifications", "Phase 2 (Q2 2027)", "Medium"],
        ["Multi-Language Regional Localization", "Support for Hindi, Tamil, Telugu, and Bengali translations across storefront catalog", "Phase 3 (Q3 2027)", "Medium"],
        ["Automated WhatsApp Order Notification", "Sending live dispatch tracking links and invoice PDFs directly to customer WhatsApp numbers", "Phase 2 (Q1 2027)", "High"],
        ["Transactional Email Gateway (SMTP / SES)", "Integration of automated transactional email provider for dispatch invoices, order confirmations, and password resets", "Phase 2 (Q1 2027)", "Medium"]
    ]
    create_styled_table(roadmap_headers, roadmap_data, col_widths=[1.8, 2.6, 1.3, 1.1])
    add_figure_caption("Table 3: Post-Launch Feature Roadmap & Functional Evolution")

    # =========================================================================
    # 8. MAINTENANCE, WARRANTY & SERVICE LEVEL AGREEMENT (SLA)
    # =========================================================================
    add_chapter_heading("8. Maintenance, Warranty & Support Terms")
    add_body("Forge India Connect Pvt Ltd provides formal warranty support and ongoing operational maintenance following production go-live:")

    add_section_heading("8.1 Warranty Period & Coverage Scope")
    add_body("The software system is covered under a 6-month post-handover warranty. Warranty coverage encompasses defect rectification, software bug fixes, server configuration patches, and database indexing optimizations resulting from pre-existing code defects at zero additional cost to the client.")

    add_section_heading("8.2 Incident Severity Classification & SLA Response Matrix")
    add_body("Support incidents logged with the technical desk are categorized and resolved according to the following Service Level Agreement (SLA):")

    sla_headers = ["Severity Level", "Incident Definition", "Initial Response SLA", "Target Resolution SLA"]
    sla_data = [
        ["Priority 1 (Critical)", "Complete storefront checkout outage, payment gateway failure, or cloud database unreachability", "< 1 Hour", "< 4 Hours"],
        ["Priority 2 (High)", "Admin order status pipeline failure, coupon discount miscalculation, or postal code API timeout", "< 2 Hours", "< 12 Hours"],
        ["Priority 3 (Medium)", "Banner image rendering glitches, cosmetic styling defects on specific mobile viewports", "< 8 Hours", "< 48 Hours"],
        ["Priority 4 (Minor)", "General configuration inquiries, minor copy text updates, or non-blocking UI suggestions", "< 24 Hours", "< 5 Business Days"]
    ]
    create_styled_table(sla_headers, sla_data, col_widths=[1.5, 2.7, 1.3, 1.3])
    add_figure_caption("Table 4: Incident Severity Classification & SLA Response Matrix")

    # =========================================================================
    # 9. KNOWLEDGE TRANSFER (KT) & TRAINING PLAN
    # =========================================================================
    add_chapter_heading("9. Knowledge Transfer (KT) & Training Plan")
    add_body("To ensure seamless ongoing operational autonomy, a comprehensive Knowledge Transfer curriculum has been scheduled for client technical and business operations teams:")

    kt_headers = ["Training Module", "Curriculum & Operational Topics Covered", "Target Audience", "Estimated Duration"]
    kt_data = [
        ["KT-01: Admin Backoffice Operations", "Order stream review, dispatch transitions, assigning courier AWB tracking numbers", "Fulfillment & Warehouse Staff", "3 Hours (Hands-on)"],
        ["KT-02: Product Catalog & Media", "Creating SKUs, uploading photos, setting MRP/DP/PV pricing, embedding YouTube videos", "Catalog & Inventory Team", "2.5 Hours"],
        ["KT-03: Marketing & Campaign Control", "Hero carousel banner configuration, AdPromotionManager, active status toggles", "Marketing Operations", "2 Hours"],
        ["KT-04: Coupon Engine Administration", "Configuring product-specific vouchers (HEMOHIM20), first-order rules (WELCOME10)", "Marketing & Sales Leadership", "2 Hours"],
        ["KT-05: DevOps & Cloud Infrastructure", "Spring Boot jar deployment, Nginx proxy, MongoDB Atlas snapshot backup and restore", "Client Technical Engineers", "4 Hours (Technical)"]
    ]
    create_styled_table(kt_headers, kt_data, col_widths=[1.6, 2.7, 1.5, 1.0])
    add_figure_caption("Table 5: Knowledge Transfer & Operational Training Curriculum")

    add_body("All training sessions include recorded video walkthroughs, step-by-step PDF slide decks, and access to this operational manual.")

    # Save Document
    doc.save(TARGET_PATH)
    print(f"Successfully generated Document 2 at: {TARGET_PATH}")
    print(f"Total Paragraphs: {len(doc.paragraphs)}")
    print(f"Total Tables: {len(doc.tables)}")

if __name__ == "__main__":
    create_document()
