import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

TARGET_PATH = r"E:\EMS Documents\atomy_inida1.docx"
FLOWCHART_IMAGE_PATH = r"E:\EMS Documents\atomy_system_flowchart.png"

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
    # FIRST PAGE: EXACTLY MATCHING USER SCREENSHOT (WHITE & BLACK DESIGN)
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
    run_sub = p_sub.add_run("Document 1: Master Technical & Functional Specifications")
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(14)
    run_sub.font.italic = True
    run_sub.font.color.rgb = BLACK

    # 3. Horizontal Dividing Line across the page (Matching the image)
    p_line = doc.add_paragraph()
    p_line.paragraph_format.space_before = Pt(0)
    p_line.paragraph_format.space_after = Pt(54) # Space between horizontal line and table
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
        ("Status", "Final Draft")
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

    # 5. Explicit Page Break: Cover page ends here cleanly
    doc.add_page_break()

    # =========================================================================
    # BODY CONTENT: 1.5 LINE SPACING, FLOWS NATURALLY
    # =========================================================================
    add_chapter_heading("1. Abstract")
    add_body("The Atomy India E-Commerce Platform is an enterprise-grade digital commerce application engineered by Forge India Connect Pvt Ltd (FIC) specifically for direct-selling, consumer wellness, functional foods, and premium Korean skincare products in the Indian marketplace. Built upon a modern decoupled three-tier architecture—leveraging React 18 with Vite on the client presentation layer, an enterprise Java 17 and Spring Boot REST API backend operating on port 8085, and a resilient MongoDB Atlas cloud cluster—the system seamlessly bridges direct consumer purchasing with hierarchical multi-tier member pricing and Point Value (PV) calculations.")
    add_body("A core innovation of the platform is its live dynamic promotion and coupon engine, synchronized directly with MongoDB Atlas, eliminating hardcoded business logic. The system enforces strict cart-level and customer-level discount rules: vouchers such as HEMOHIM20 are dynamically restricted only to qualifying HemoHIM product items, while promotional coupons such as WELCOME10 strictly validate past order history to grant discounts solely to first-time ordering accounts. Integrated with national courier delivery networks (utilizing Blue Dart Express as an illustrative reference implementation) for automated postal code validation, the platform provides automated delivery fee computation—providing Free Door Delivery for orders of ₹4,500 and above, and applying a standard ₹150 delivery fee for sub-threshold orders. With an administrative backoffice featuring live stock controls, top-docked settings sub-sidebars, and multi-channel payment handling (UPI, Cards, Net Banking, and COD), Atomy India (FIC) delivers a robust, scalable, and audit-compliant e-commerce solution.")

    add_chapter_heading("2. Introduction & Background")
    add_body("Traditional direct-selling and consumer distribution platforms in India have historically been burdened by legacy client-server monoliths, rigid desktop-centric user interfaces, disjointed inventory syncing, and manual promotional workflows. For consumer health, cosmetics, and personal care brands operating across diverse Indian states, marketing agility is paramount. Marketing campaigns, flash sale banners, and coupon promotions frequently require instant updates without incurring server downtime or scheduled release cycles.")
    add_body("To address these operational bottlenecks, Forge India Connect Pvt Ltd developed the Atomy India (FIC) e-commerce system. The platform unifies high-resolution catalog browsing, dynamic promotional management, automated courier serviceability checks, and customer self-service order tracking into a unified, high-performance web experience.")

    add_section_heading("2.1 Project Objectives")
    add_bullet("Real-Time Promotional & Banner Agility: Empower administrative marketing operators to update hero carousels, banner text, button links, and active promotion banners on the live storefront instantly from the admin console without rebuilding or redeploying code.", "Dynamic Marketing Control: ")
    add_bullet("Multi-Tier Member Pricing & Point Value (PV): Calculate and display Retail MRP, Member/Distributor discounted pricing, and accumulated Point Values across all product lines (Health Care, Skin Care, Personal Care, Living, and Food).", "Automated Commercial Tiering: ")
    add_bullet("Rule-Restricted Intelligent Coupon Engine: Dynamically evaluate applied discount codes against cart contents (e.g., product-specific voucher HEMOHIM20) and customer order history (e.g., first-order restriction WELCOME10) with immediate price recalculations.", "Conditional Coupon Validation: ")
    add_bullet("Multi-Carrier Logistics & Automated Shipping Calculation: Verify customer 6-digit PIN codes against courier coverage zones (e.g., Blue Dart Express / regional logistics partners) before payment, enforcing automated shipping rules: Free Door Delivery on orders of ₹4,500 or more, and a standard delivery fee of ₹150 below ₹4,500.", "Integrated Courier Logistics: ")
    add_bullet("Dual-Interface Architecture: Deliver a responsive, mobile-optimized consumer storefront (port 5173) alongside a centralized administrative command center (port 5174) equipped with a top-docked settings navigation sub-sidebar.", "Dual Portal Operations: ")

    add_section_heading("1.6 Target Stakeholders & System Roles")
    add_body("To ensure operational clarity and security, the system defines streamlined roles across customer and administrative operations (with dedicated Admin command and customer self-service):")

    stakeholder_headers = ["Functional Category", "System Role", "Primary Responsibilities & Access Scope"]
    stakeholder_data = [
        ["End Consumers", "Guest Customer", "Browses product catalog, searches products, verifies delivery pincode, adds items to cart, and registers an account."],
        ["End Consumers", "Registered Member", "Accesses member-discounted pricing, earns Point Values (PV), applies eligible first-order/exclusive coupons, saves delivery addresses, and tracks orders."],
        ["Field Operations", "Distributor / Member Agent", "Views distributor pricing tiers, tracks accumulated PV points across personal and group orders, and places bulk replenishment orders."],
        ["Platform Management", "Admin", "Full administrative authority over product catalog listings, inventory quantities, active promotional banners, coupon rules, inbound orders, dispatch tracking statuses, and system settings."]
    ]
    create_styled_table(stakeholder_headers, stakeholder_data, col_widths=[1.5, 1.8, 3.2])
    add_figure_caption("Table 1: Target Stakeholders & System Role Responsibility Matrix")

    # =========================================================================
    # 3. SYSTEM ARCHITECTURE & TECHNOLOGY STACK
    # =========================================================================
    add_chapter_heading("3. System Architecture & Component Design")
    add_body("The Atomy India (FIC) e-commerce system is constructed on a modern three-tier decoupled client-server architecture designed for high availability, zero downtime deployment, and sub-150ms API response latency.")

    add_section_heading("3.1 Technology Stack Summary")
    add_body("The complete technology stack utilized in developing and operating the Atomy India (FIC) platform is detailed below:")

    tech_headers = ["Layer / Domain", "Technology", "Version", "Role & Architectural Purpose"]
    tech_data = [
        ["Storefront Frontend", "React / JavaScript", "v18.3+", "High-performance reactive user interface for consumer browsing and ordering."],
        ["Admin Frontend", "React / JavaScript", "v18.3+", "Enterprise administration dashboard with interactive controls, charts, and top-docked settings."],
        ["Build Tooling", "Vite", "v5.x", "Sub-second Hot Module Replacement (HMR) and optimized ES module bundling."],
        ["Styling Architecture", "Vanilla CSS & Tokens", "CSS3 / Flexbox / Grid", "Pixel-perfect bespoke styling with zero heavy framework bloat."],
        ["Backend Runtime", "Java OpenJDK", "17 LTS", "High-throughput enterprise virtual machine with garbage collection optimization."],
        ["Backend Framework", "Spring Boot", "3.x", "Production-ready RESTful web services, dependency injection, and actuator."],
        ["Data Persistence", "MongoDB Atlas", "6.0+ Cluster", "Distributed document database with automatic sharding and replication."],
        ["Data Access Layer", "Spring Data MongoDB", "3.x", "Type-safe document repository mapping, reactive queries, and indexing."],
        ["Logistics API", "Courier Partner API (e.g. Blue Dart)", "REST v2.0", "Automated PIN code serviceability validation and shipment dispatching."],
        ["Build Orchestration", "Maven Wrapper (mvnw)", "3.9+", "Deterministic multi-module dependency management and jar packaging."]
    ]
    create_styled_table(tech_headers, tech_data, col_widths=[1.5, 1.4, 1.1, 2.5])
    add_figure_caption("Table 2: Technology Stack & Architectural Specifications")

    # =========================================================================
    # 4. COMPLETE MODULE DOCUMENTATION & FEATURE BREAKDOWN
    # =========================================================================
    add_chapter_heading("4. Complete Module Documentation & Feature Breakdown")

    add_section_heading("4.1 Storefront & Catalog Browsing Module")
    add_body("The storefront provides intuitive discovery across the core Atomy India product categories:")
    add_bullet("Health Care (e.g., HemoHIM 20ml x 60 packets, Korean Red Ginseng Spherical Granule, Milk Thistle Rhodiola).", "Health Care Category: ")
    add_bullet("Skin Care & Beauty (e.g., Atomy Absolute CellActive Skincare Set, Atomy The Fame Set, Evening Care 4 Set, Absolute Ampoule).", "Skin Care Category: ")
    add_bullet("Personal Care (e.g., Atomy Toothpaste with Propolis Extract & Green Tea, Toothbrush, Scalpcare Hair & Body Shampoo).", "Personal Care Category: ")
    add_bullet("Living & Food (e.g., Atomy Cafe Arabica 100% Instant Coffee, Dish Detergent, Fabric Softener, Pure Spirulina).", "Living & Food Category: ")
    add_bullet("Each product item provides high-resolution product photography, detailed ingredients tables, directions for use, embedded YouTube demonstration videos, and clear stock status badges.", "Rich Media Showcase: ")

    add_section_heading("4.2 Dynamic Coupon & Promotion Engine Module")
    add_body("The coupon engine evaluates discount rules on the fly by querying the active configuration from MongoDB Atlas:")
    add_bullet("Synchronizes live coupon rules and hero banners directly from MongoDB Atlas collection 'promotion_settings', eliminating hardcoded values.", "Live Cloud Sync: ")
    add_bullet("HEMOHIM20 coupon: Applies a 20% discount strictly on qualifying HemoHIM products. If HemoHIM items are absent from the cart, the coupon fails validation with an explicit notice to the customer.", "Product-Specific Voucher (HEMOHIM20): ")
    add_bullet("WELCOME10 coupon: Applies a 10% discount solely for first-time ordering customers. The backend validates the customer's prior order history in MongoDB; if any completed orders exist, the voucher is rejected.", "First-Order Voucher (WELCOME10): ")
    add_bullet("The checkout sheet recalculates line items, coupon discounts, GST, and final totals in real-time upon code entry or removal.", "Real-Time Ledger Recalculation: ")

    add_section_heading("4.3 Promotional Banner & Ad Management Module")
    add_body("Managed directly within the Admin dashboard under the AdPromotionManager component:")
    add_bullet("Configures sliding hero banner slides with headline, subtitle, background image asset, and direct product catalog call-to-action (CTA).", "Hero Banner Carousel: ")
    add_bullet("Provides instant toggle switches to activate or deactivate marketing campaigns without code deployment or application restart.", "Live Active/Inactive Toggles: ")
    add_bullet("Configures auto-slide interval (default 4500ms) with smooth GPU-accelerated transition animations.", "Configurable Slide Timing: ")

    add_section_heading("4.4 Checkout, Order Sheet & Pincode Logistics Module")
    add_body("The Order Sheet (/order-sheet) encapsulates full transaction completion and delivery validation:")
    add_bullet("Enforces postal code verification using courier serviceability matrices (using Blue Dart Express as the representative delivery partner) prior to order placement.", "Pincode Validation: ")
    add_bullet("Free Delivery: Orders with subtotal of ₹4,500 and above qualify for Free Door Delivery (Standard Fee: ₹0.00).", "Free Shipping Rule (>= ₹4,500): ")
    add_bullet("Standard Delivery: Orders below ₹4,500 incur a standard ₹150 delivery surcharge, with a live countdown banner indicating the remaining amount required for free shipping.", "Standard Shipping Fee (₹150): ")
    add_bullet("Multi-Payment Options: Supports UPI QR/VPA, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD) where pincode coverage allows.", "Payment Methods: ")
    add_bullet("Upon order confirmation, stock is reserved atomically and confirmation notifications are dispatched.", "Order Confirmation: ")

    add_section_heading("4.5 Customer Profile, Order History & Address Management")
    add_body("The Customer Profile provides self-service order tracking and account management:")
    add_bullet("Chronological order history with real-time status badges (Order Placed, Verified, Dispatched, Out for Delivery, Delivered).", "Order Tracking: ")
    add_bullet("Allows customers to maintain multiple delivery addresses (Home, Office, Alternate) with default address tagging for instant checkout.", "Address Book: ")
    add_bullet("Provides instant PDF invoice downloads detailing line items, GST breakdown, and courier tracking numbers.", "Tax Invoices: ")

    add_section_heading("4.6 Admin Backoffice & Top-Docked Settings Sub-Sidebar")
    add_body("The Admin Dashboard provides operations teams with complete command over catalog, sales, and configuration:")
    add_bullet("Primary navigation docks core modules: Dashboard Overview, Orders, Product Catalog, Coupons, Ads & Banners, and Reports.", "Primary Sidebar: ")
    add_bullet("The Settings section features a dedicated top-docked hamburger menu that seamlessly joins sub-sidebar controls at the top-left of the screen.", "Top-Docked Settings Sub-Sidebar: ")
    add_bullet("Allows the Admin to transition order states from Pending to Shipped, assign courier tracking Airway Bill (AWB) numbers, and update delivery logs.", "Order Processing: ")

    # =========================================================================
    # 5. DATABASE DESIGN & TRANSACTIONAL FLOWCHART
    # =========================================================================
    add_chapter_heading("5. Database Design & Transactional Flowchart")

    add_section_heading("5.1 MongoDB Collections & Document Schemas")
    add_body("The persistence tier utilizes MongoDB Atlas collections optimized for high read throughput, horizontal scaling, and flexible document models:")

    schema_headers = ["Collection Name", "Primary Key (_id)", "Document Description & Key Fields"]
    schema_data = [
        ["products", "ObjectId / String", "Catalog items. Fields: name, sku, category, mrp, memberPrice, distributorPrice, pv, stockQuantity, images[], youtubeUrl, isActive."],
        ["orders", "ObjectId / String", "Customer order transactions. Fields: orderNumber, customerId, customerName, shippingAddress{}, items[], subtotal, discount, deliveryFee, total, paymentMethod, status, trackingNumber, createdAt."],
        ["coupons", "ObjectId / String", "Discount coupon definitions. Fields: code, discountType (PERCENTAGE/FIXED), discountValue, minOrderValue, maxDiscount, allowedProductIds[], isFirstOrderOnly, expiryDate, isActive."],
        ["promotion_settings", "ObjectId / String", "Global promotional and banner settings. Fields: heroBanners[], flashSaleBanner{}, activeOfferCoupons[], autoSlideInterval (4500ms), updatedAt."],
        ["users", "ObjectId / String", "Customer and admin account credentials. Fields: email, passwordHash, fullName, phoneNumber, role (ADMIN/CUSTOMER), savedAddresses[], createdAt."],
        ["banners", "ObjectId / String", "Storefront visual marketing assets. Fields: title, subtitle, imageUrl, buttonText, buttonLink, displayOrder, isActive."]
    ]
    create_styled_table(schema_headers, schema_data, col_widths=[1.5, 1.4, 3.6])
    add_figure_caption("Table 3: MongoDB Atlas Collections & Schema Definitions")

    add_section_heading("5.2 End-to-End System Data Flow & Entity Transaction Flowchart")
    add_body("The transactional lifecycle—from storefront product catalog lookup, cart item accumulation, conditional coupon validation (HEMOHIM20 / WELCOME10), multi-carrier postal code screening, automated shipping fee calculation (Free Delivery >= ₹4,500), payment execution, MongoDB Atlas multi-collection persistence, to administrative order dispatch—is illustrated in the system flowchart below:")

    # Insert High-Resolution Flowchart Image
    if os.path.exists(FLOWCHART_IMAGE_PATH):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(FLOWCHART_IMAGE_PATH, width=Inches(6.5))
        add_figure_caption("Figure 5.1: End-to-End System Data Flow, Entity Validation, and Order Fulfillment Flowchart")

    # =========================================================================
    # 6. API DOCUMENTATION & REST SPECIFICATIONS
    # =========================================================================
    add_chapter_heading("6. API Documentation & REST Specifications")

    add_section_heading("6.1 Authentication & Security Headers")
    add_body("All administrative endpoints require authentication headers. Client requests to protected resources must supply a valid Bearer token:")
    add_bullet("Content-Type: application/json (standard payload encoding).")
    add_bullet("Accept: application/json (standard response format).")
    add_bullet("Authorization: Bearer <JWT_ACCESS_TOKEN> (required for administrative and profile operations).")

    add_section_heading("6.2 Backend REST Controllers & Endpoint Specifications")
    add_body("The Spring Boot API server operates on port 8085. The key REST endpoints are detailed in the matrix below:")

    api_headers = ["HTTP Method", "Endpoint URI", "Controller", "Access Role", "Functional Description"]
    api_data = [
        ["GET", "/api/products", "ProductController", "Public", "Fetches active product catalog with category and keyword filtering."],
        ["GET", "/api/products/{id}", "ProductController", "Public", "Retrieves comprehensive details, media galleries, and YouTube links."],
        ["POST", "/api/products", "ProductController", "Admin", "Creates a new product item with pricing tiers, stock, and SKU."],
        ["PUT", "/api/products/{id}", "ProductController", "Admin", "Updates product information, stock quantities, or pricing."],
        ["DELETE", "/api/products/{id}", "ProductController", "Admin", "Deactivates or removes a product listing from the storefront."],
        ["GET", "/api/promotions", "PromotionController", "Public", "Retrieves active hero banners, seasonal notices, and offer coupons."],
        ["PUT", "/api/promotions", "PromotionController", "Admin", "Saves banner configurations, active coupons, and slide timings."],
        ["GET", "/api/coupons", "CouponController", "Public/Admin", "Lists available promotional coupons and discount details."],
        ["POST", "/api/coupons/apply", "CouponController", "Customer", "Validates coupon against cart items, spend thresholds, and user history."],
        ["POST", "/api/orders", "OrderController", "Customer", "Submits a finalized order sheet, reserves stock, and triggers confirmation."],
        ["GET", "/api/orders/user/{id}", "OrderController", "Customer", "Fetches chronological order history for a specific logged-in user."],
        ["GET", "/api/orders", "OrderController", "Admin", "Returns paginated list of all customer orders for processing."],
        ["PATCH", "/api/orders/{id}/status", "OrderController", "Admin", "Updates order delivery stage (Pending, Shipped, Delivered)."],
        ["GET", "/api/logistics/pincode/{code}", "LogisticsController", "Public", "Validates shipping pincode against courier delivery coverage matrix."]
    ]
    create_styled_table(api_headers, api_data, col_widths=[0.9, 1.8, 1.3, 1.0, 1.5])
    add_figure_caption("Table 4: Core Spring Boot REST API Endpoint Matrix")

    # =========================================================================
    # 7. ROLES & PERMISSIONS (RBAC) - IN PARAGRAPHS
    # =========================================================================
    add_chapter_heading("7. Roles & Permissions (RBAC)")
    add_body("The Atomy India (FIC) e-commerce system implements a streamlined, two-tier Role-Based Access Control (RBAC) model. By adhering strictly to the principle of least privilege, the security architecture establishes clear, unambiguous boundaries between Platform Administration (Admin) and Consumer / Field Operations (Customer, Registered Member, and Distributor). All administrative interactions are guarded at the Spring Security filter layer and validated via cryptographically signed JWT tokens, ensuring that unauthorized clients cannot invoke backoffice management routines.")

    add_section_heading("7.1 Platform Administrator (Admin) Role & Privileges")
    add_body("The Administrator role holds comprehensive operational authority over the platform's core commercial, marketing, and order fulfillment systems. Operating through the dedicated Administrative Dashboard (/admin on port 5174), the Admin is authorized to perform the following critical operations:")
    add_bullet("Full Product Catalog Management: Create, edit, categorize, and archive product listings across all lines (Health Care, Skin Care, Personal Care, Living, and Food), including uploading high-resolution imagery and embedding YouTube video links.", "Catalog Operations: ")
    add_bullet("Inventory & Stock Control: Adjust real-time warehouse inventory quantities, establish minimum safety stock alert levels, and toggle immediate stock availability indicators (In Stock, Low Stock, Sold Out).", "Inventory Management: ")
    add_bullet("Live Promotional Campaign Configuration: Through the AdPromotionManager module, configure and deploy hero carousel banners, promotional announcement cards, auto-slide timing intervals, and active marketing links without redeploying code.", "Marketing Agility: ")
    add_bullet("Dynamic Coupon & Rule Enforcement: Define conditional voucher codes, discount algorithms (Percentage vs. Fixed Amount), minimum order thresholds, and strict product-specific constraints (e.g., HEMOHIM20).", "Coupon Control: ")
    add_bullet("Inbound Order Processing & Status Pipeline: Access the complete chronological stream of incoming customer orders, review itemized line totals, transition dispatch stages from Pending to Shipped, and log courier tracking Airway Bill (AWB) numbers.", "Order Pipeline: ")
    add_bullet("System Logistics & Threshold Administration: Adjust regional postal code serviceability rules, modify delivery fee policies (such as the Free Delivery threshold of ₹4,500), and review platform audit logs.", "System Settings: ")

    add_section_heading("7.2 Customer, Registered Member & Distributor Tier Privileges")
    add_body("The Customer tier encompasses public guest visitors, registered direct-selling members, and field distributor agents interacting through the public storefront web application (port 5173). Their operational permissions are strictly scoped to self-service consumer activities:")
    add_bullet("Catalog Discovery & Product Exploration: Search, filter, and inspect detailed product specifications, ingredients lists, usage instructions, and promotional media across all available catalog categories.", "Catalog Browsing: ")
    add_bullet("Tiered Price & PV Visibility: View transparent pricing models reflecting Retail Price (MRP), Member/Distributor discounted pricing, and Point Values (PV) earned upon checkout.", "Commercial Pricing: ")
    add_bullet("Cart Item Accumulation: Add items to persistent local carts, adjust purchase quantities, and receive real-time updates on subtotal calculations and free shipping qualification.", "Shopping Cart: ")
    add_bullet("Coupon Code Application: Apply qualifying promotional vouchers at checkout. The system automatically restricts eligibility based on cart items and customer order history (e.g., WELCOME10 for first-order accounts).", "Discount Application: ")
    add_bullet("Order Finalization & Secure Payment: Complete order sheets by selecting verified delivery addresses and submitting payment via UPI QR/VPA, Credit/Debit Cards, Net Banking, or Cash on Delivery (COD).", "Checkout & Settlement: ")
    add_bullet("Self-Service Account Management: Access private customer profiles to track real-time delivery milestones, manage saved shipping addresses, and download official PDF tax invoices.", "Order History: ")
    add_bullet("Strict Access Restrictions (DENY): Customers and distributors are strictly barred from accessing the administrative console (/admin), altering catalog pricing or stock levels, modifying coupon parameters, or inspecting other customers' order records.", "Security Boundary: ")

    # =========================================================================
    # 8. THIRD-PARTY INTEGRATION & LOGISTICS
    # =========================================================================
    add_chapter_heading("8. Third-Party Integration & Logistics")

    add_section_heading("8.1 Courier Logistics & Delivery Integration")
    add_body("The platform features an extensible multi-carrier logistics abstraction layer designed to integrate with leading national courier networks (such as Blue Dart Express, Delhivery, DTDC, and India Post). In the platform's reference implementation, Blue Dart Express is configured as the representative logistics partner for automated serviceability checks and consignment dispatching:")
    add_bullet("Automated PIN code screening validates customer destination postal codes against the courier delivery matrix prior to checkout completion.", "Pincode Verification: ")
    add_bullet("Free delivery applies automatically when subtotal reaches or exceeds ₹4,500 (Delivery Fee: ₹0.00).", "Free Delivery Rule (>= ₹4,500): ")
    add_bullet("Orders under ₹4,500 incur a standard ₹150 courier delivery surcharge, with live prompts indicating the remaining spend required for free delivery.", "Standard Delivery Surcharge (₹150): ")
    add_bullet("Upon marking orders as Shipped in the admin dashboard, courier tracking Airway Bill (AWB) numbers are stored for real-time customer consignment tracking.", "Airway Bill (AWB) Tracking: ")

    add_section_heading("8.2 Payment Gateway Integration")
    add_bullet("Unified Payments Interface (UPI): QR code generation and deep-linking (PhonePe, Google Pay, Paytm, BHIM).")
    add_bullet("Card & Net Banking: Tokenized debit/credit card processing with 3D Secure OTP verification.")
    add_bullet("Cash on Delivery (COD): Available conditionally based on courier postal code serviceability.")

    thirdparty_headers = ["Integrated Service", "Provider / Protocol", "Integration Endpoint / Purpose", "Criticality"]
    thirdparty_data = [
        ["Logistics & Serviceability", "Courier Partner (e.g. Blue Dart)", "REST API / Pincode validation & tracking updates", "High (Core Checkout)"],
        ["Payment Gateway Aggregator", "Razorpay / Cashfree", "HTTPS Webhooks / UPI, Card, Net Banking handling", "Critical (Financial)"],
        ["Cloud Database Backbone", "MongoDB Atlas (AWS Mumbai)", "Mongo Driver / Document clustering & persistence", "Critical (Data Store)"],
        ["Video Streaming & Demos", "YouTube Embedded API", "iFrame Integration / Product video demonstrations", "Medium (UX)"]
    ]
    create_styled_table(thirdparty_headers, thirdparty_data, col_widths=[1.6, 1.5, 2.4, 1.0])
    add_figure_caption("Table 5: Third-Party Service Integration Directory")

    # =========================================================================
    # 9. SECURITY HANDOVER & COMPLIANCE
    # =========================================================================
    add_chapter_heading("9. Security Handover & Compliance")

    add_section_heading("9.1 Data Security, Encryption & Password Hashing")
    add_bullet("Passwords encrypted with BCrypt salted hashing (work factor 10) prior to database insertion.", "One-Way Salting: ")
    add_bullet("Customer addresses, phone numbers, and orders encrypted using AES-256 at rest in MongoDB Atlas.", "At-Rest Protection: ")
    add_bullet("Enforced TLS 1.3 across all client-server and database communications.", "In-Transit Security: ")

    add_section_heading("9.2 API Security & CORS Controls")
    add_bullet("Spring Security explicitly whitelists only trusted storefront (port 5173) and admin (port 5174) origins.", "CORS Whitelisting: ")
    add_bullet("Jakarta Bean Validation protects endpoints against malformed JSON and injection attacks.", "Input Validation: ")

    security_headers = ["Security Domain", "Applied Control / Standard", "Implementation Detail & Verification"]
    security_data = [
        ["Authentication", "BCrypt Salted Hash + JWT", "Work factor 10 hashing; stateless JWT session tokens with expiration."],
        ["Transport Security", "TLS 1.3 / HTTPS Only", "All endpoints reject unencrypted HTTP requests; HSTS header enabled."],
        ["API Access", "CORS Strict Whitelist", "Restricted to authorized storefront and admin production origins."],
        ["Data Privacy", "Role-Based Data Filtering", "Customers can only retrieve their own order records; admin endpoints guarded."],
        ["Audit Logging", "Logback / SLF4J Audit", "Administrative changes to stock, coupons, and orders are logged with timestamps."]
    ]
    create_styled_table(security_headers, security_data, col_widths=[1.5, 1.8, 3.2])
    add_figure_caption("Table 6: Security Controls & Compliance Matrix")

    # =========================================================================
    # 10. DEPLOYMENT GUIDE & INFRASTRUCTURE HANDOVER
    # =========================================================================
    add_chapter_heading("10. Deployment Guide & Infrastructure Handover")

    add_section_heading("10.1 Environment Prerequisites & Port Topology")
    port_headers = ["Service Component", "Local / Live URI", "Port Topology", "Runtime Environment"]
    port_data = [
        ["Spring Boot REST Backend (Cloud)", "https://atomy-india-lqsy.onrender.com", "Port 443 (HTTPS)", "Java 17 LTS / Render Cloud"],
        ["Spring Boot REST Backend (Local)", "http://localhost:8085 (or http://192.168.1.27:8085)", "Port 8085 (HTTP)", "Java 17 LTS / Embedded Tomcat 10"],
        ["Storefront Web Application", "http://localhost:5173", "Port 5173 (Dev/Vite)", "Node 20+ / Vite React 19 Frontend"],
        ["Admin Dashboard Application", "http://localhost:5174", "Port 5174 (Dev/Vite)", "Node 20+ / Vite React 19 Admin"],
        ["MongoDB Atlas Cluster", "cluster1.fc21g7g.mongodb.net", "Port 27017 (TLS)", "Cloud Managed Replica Set (atomy_india)"]
    ]
    create_styled_table(port_headers, port_data, col_widths=[1.8, 2.1, 1.2, 1.7])
    add_figure_caption("Table 7: Service Port Allocation & Deployment Topology")

    add_body("Domain Status & Cloud Endpoints: The system currently runs without a custom commercial domain (e.g., .in or .com). Backend REST services are deployed on Render Cloud PaaS (https://atomy-india-lqsy.onrender.com) with automated cloud SSL/TLS encryption, and database services are hosted on MongoDB Atlas Cloud. Acquisition and DNS binding of an official brand domain are slated for the subsequent production launch phase.")

    add_section_heading("10.2 Service Build & Runbook")
    add_bullet("Backend Build: Run './mvnw.cmd clean package -DskipTests' to generate the target/atomy_india-0.0.1-SNAPSHOT.jar package.", "Backend Package: ")
    add_bullet("Backend Run: Execute 'java -jar target/atomy_india-0.0.1-SNAPSHOT.jar' on port 8085.", "Backend Launch: ")
    add_bullet("Storefront Build: Run 'cd atomy_india-frontend && npm run build' to produce optimized /dist bundle for Nginx.", "Storefront Package: ")
    add_bullet("Admin Build: Run 'cd atomy_india-admin && npm run build' to produce administrative /dist assets.", "Admin Package: ")

    # =========================================================================
    # 11. BACKUP & DISASTER RECOVERY GUIDE
    # =========================================================================
    add_chapter_heading("11. Backup & Disaster Recovery Guide")
    add_bullet("Automated Snapshots: MongoDB Atlas automated continuous backups with point-in-time recovery (PITR) retained on 7-day, 30-day, and 365-day schedules.", "Cloud Backup: ")
    add_bullet("Manual Export: 'mongodump --uri=\"mongodb+srv://.../atomy_db\" --out=/backups/$(date +%F)'", "CLI Dump: ")
    add_bullet("Manual Restore: 'mongorestore --uri=\"mongodb+srv://.../atomy_db\" --drop /backups/2026-10-27/atomy_db'", "CLI Restore: ")

    backup_headers = ["Disaster Scenario", "Target RPO (Data Loss Window)", "Target RTO (Recovery Time)", "Mitigation Strategy"]
    backup_data = [
        ["Database Primary Node Crash", "< 5 Seconds", "< 30 Seconds", "Automated MongoDB Atlas replica set failover to secondary node."],
        ["Accidental Table/Collection Drop", "< 1 Hour", "< 45 Minutes", "Point-in-Time Recovery (PITR) restore to exact second prior to incident."],
        ["Cloud Zone Outage (Mumbai)", "< 15 Minutes", "< 2 Hours", "Multi-availability-zone cluster replication spanning 3 AWS data centers."],
        ["Application Server Failure", "0 Minutes (Stateless)", "< 5 Minutes", "Automated container/service restart via systemd or Docker daemon."]
    ]
    create_styled_table(backup_headers, backup_data, col_widths=[1.8, 1.4, 1.4, 1.9])
    add_figure_caption("Table 8: Disaster Recovery Objectives (RTO & RPO) SLA Matrix")

    # Save Document
    doc.save(TARGET_PATH)
    print(f"Successfully generated updated Document 1 at: {TARGET_PATH}")
    print(f"Total Paragraphs: {len(doc.paragraphs)}")
    print(f"Total Tables: {len(doc.tables)}")

if __name__ == "__main__":
    create_document()
