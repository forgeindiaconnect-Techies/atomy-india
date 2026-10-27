import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

def create_flowchart(output_path):
    fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 11)
    ax.axis('off')

    # Background
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')

    # Color Palette (Synced with Website Main Header Blue)
    PRIMARY = '#00A3E0'      # Website Main Header Blue (#00A3E0)
    SECONDARY = '#008CC2'    # Atomy Deep Blue
    ACCENT_GREEN = '#059669' # Emerald Green
    ACCENT_ORANGE = '#D97706'# Amber Orange
    ACCENT_PURPLE = '#7C3AED'# Purple
    BORDER_COLOR = '#BAE6FD'
    TEXT_MAIN = '#0F172A'
    TEXT_MUTED = '#475569'

    # Title Banner
    title_box = FancyBboxPatch((0.8, 10.1), 14.4, 0.75, boxstyle="round,pad=0.1,rounding_size=0.15",
                               ec=PRIMARY, fc=PRIMARY, lw=1.5)
    ax.add_patch(title_box)
    ax.text(8.0, 10.48, "FIC (ATOMY INDIA) — END-TO-END DATA FLOW & ENTITY TRANSACTION WORKFLOW",
            ha='center', va='center', color='white', fontsize=12.5, fontweight='bold', fontfamily='sans-serif')

    def draw_node(x, y, w, h, title, subtitle="", fc='#FFFFFF', ec=BORDER_COLOR, lw=1.5, title_color=TEXT_MAIN):
        box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.12",
                             ec=ec, fc=fc, lw=lw)
        ax.add_patch(box)
        if subtitle:
            ax.text(x + w/2, y + h*0.62, title, ha='center', va='center',
                    color=title_color, fontsize=9.5, fontweight='bold', fontfamily='sans-serif')
            ax.text(x + w/2, y + h*0.28, subtitle, ha='center', va='center',
                    color=TEXT_MUTED, fontsize=7.8, fontfamily='sans-serif')
        else:
            ax.text(x + w/2, y + h/2, title, ha='center', va='center',
                    color=title_color, fontsize=9.5, fontweight='bold', fontfamily='sans-serif')

    def draw_arrow(x1, y1, x2, y2, label="", color=SECONDARY, lw=1.8, label_pos=0.5):
        arrow = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle='-|>',
                                mutation_scale=14, color=color, lw=lw)
        ax.add_patch(arrow)
        if label:
            mx = x1 + (x2 - x1) * label_pos
            my = y1 + (y2 - y1) * label_pos
            ax.text(mx, my + 0.12, label, ha='center', va='bottom',
                    fontsize=7.5, fontweight='bold', color=color,
                    bbox=dict(boxstyle='square,pad=0.15', fc='white', ec='none', alpha=0.9))

    def draw_diamond(cx, cy, w, h, title, subtitle="", fc='#FEF3C7', ec=ACCENT_ORANGE):
        diamond = patches.Polygon([
            (cx, cy + h/2), (cx + w/2, cy), (cx, cy - h/2), (cx - w/2, cy)
        ], closed=True, fc=fc, ec=ec, lw=1.6)
        ax.add_patch(diamond)
        if subtitle:
            ax.text(cx, cy + 0.12, title, ha='center', va='center',
                    fontsize=8.5, fontweight='bold', color=TEXT_MAIN, fontfamily='sans-serif')
            ax.text(cx, cy - 0.22, subtitle, ha='center', va='center',
                    fontsize=7.2, color=TEXT_MUTED, fontfamily='sans-serif')
        else:
            ax.text(cx, cy, title, ha='center', va='center',
                    fontsize=8.5, fontweight='bold', color=TEXT_MAIN, fontfamily='sans-serif')

    # --- ROW 1: CATALOG & SHOPPING CART ---
    draw_node(0.8, 8.7, 3.0, 1.0, "1. Storefront Browsing", "Search & Filter (Health, Skincare, Food)\nMRP, Member Price & PV Points",
              fc='#EFF6FF', ec=SECONDARY)

    draw_node(4.4, 8.7, 3.0, 1.0, "2. Shopping Cart", "Aggregate Items, Quantities & PV\nCart State in Frontend LocalStorage",
              fc='#EFF6FF', ec=SECONDARY)

    draw_arrow(3.8, 9.2, 4.4, 9.2, "Add Product")

    draw_node(8.0, 8.7, 3.2, 1.0, "3. Apply Coupon Code", "HEMOHIM20 / WELCOME10\nCall POST /api/coupons/apply",
              fc='#F5F3FF', ec=ACCENT_PURPLE)

    draw_arrow(7.4, 9.2, 8.0, 9.2, "Enter Code")

    draw_diamond(13.0, 9.2, 2.8, 1.3, "Valid Rules?", "Product / 1st Order Check", fc='#FEF3C7', ec=ACCENT_ORANGE)
    draw_arrow(11.2, 9.2, 11.6, 9.2)

    draw_arrow(13.0, 9.85, 9.6, 9.85, "NO (Invalid)", color='#DC2626')
    ax.plot([13.0, 13.0, 9.6, 9.6], [9.85, 10.0, 10.0, 9.7], color='#DC2626', lw=1.5, ls='--')

    draw_arrow(13.0, 8.55, 13.0, 7.8, "YES (Discount Applied)", color=ACCENT_GREEN)

    # --- ROW 2: ORDER SHEET & LOGISTICS ---
    draw_node(11.5, 6.7, 3.0, 1.1, "4. Order Sheet (/order-sheet)", "Customer Address + Delivery Selection\n6-Digit Postal Code Screening",
              fc='#ECFDF5', ec=ACCENT_GREEN)

    # Courier Logistics Check (e.g. Blue Dart)
    draw_diamond(7.5, 7.25, 2.8, 1.2, "Courier PIN Check", "e.g. Blue Dart / Logistics API", fc='#FEF3C7', ec=ACCENT_ORANGE)
    draw_arrow(11.5, 7.25, 8.9, 7.25, "Verify PIN")

    draw_diamond(3.2, 7.25, 2.8, 1.2, "Subtotal >= ₹4500?", "Free Delivery Rule", fc='#FEF3C7', ec=ACCENT_ORANGE)
    draw_arrow(6.1, 7.25, 4.6, 7.25, "Serviceable")

    draw_node(0.8, 5.5, 2.5, 0.9, "Free Delivery (₹ 0.00)", "Subtotal reaches ₹4500+", fc='#DCFCE7', ec=ACCENT_GREEN)
    draw_arrow(2.5, 6.65, 2.05, 6.4, "YES", color=ACCENT_GREEN)

    draw_node(3.8, 5.5, 2.5, 0.9, "Standard Fee (₹ 150)", "Subtotal under ₹4500", fc='#FEE2E2', ec='#EF4444')
    draw_arrow(3.8, 6.65, 4.5, 6.4, "NO", color='#EF4444')

    draw_node(7.0, 5.4, 3.2, 1.0, "5. Payment Gateway Selection", "UPI (PhonePe, GPay) | Cards | COD\nCalculates Subtotal + Fee - Discount",
              fc='#EFF6FF', ec=SECONDARY)
    draw_arrow(3.3, 5.95, 7.0, 5.95)
    draw_arrow(6.3, 5.95, 7.0, 5.95)

    draw_diamond(12.5, 5.9, 2.6, 1.1, "Payment Success?", "Webhook Verify", fc='#FEF3C7', ec=ACCENT_ORANGE)
    draw_arrow(10.2, 5.9, 11.2, 5.9, "Submit")

    # --- ROW 3: DATABASE PERSISTENCE (MONGODB ATLAS) ---
    db_container = FancyBboxPatch((0.8, 2.5), 14.4, 2.3, boxstyle="round,pad=0.1,rounding_size=0.15",
                                  ec=PRIMARY, fc='#F8FAFC', lw=1.5, ls='--')
    ax.add_patch(db_container)
    ax.text(1.2, 4.55, "MONGODB ATLAS CLUSTER (Cloud Persistence & ACID Consistency Tier)",
            fontsize=9.5, fontweight='bold', color=PRIMARY)

    draw_arrow(12.5, 5.35, 12.5, 4.2, "Order Confirmed", color=ACCENT_GREEN)

    draw_node(1.2, 2.8, 2.5, 1.3, "orders", "Stores Order Document\nItems[], Totals, Status\nTracking AWB Number",
              fc='#FFFFFF', ec=PRIMARY, title_color=PRIMARY)

    draw_node(4.2, 2.8, 2.5, 1.3, "products", "Decrements Stock Quantity\nAtomic Stock Reservation\nMaintains Catalog State",
              fc='#FFFFFF', ec=PRIMARY, title_color=PRIMARY)

    draw_node(7.2, 2.8, 2.5, 1.3, "users", "Customer Profile & Addresses\nPurchase History Persistence\nFirst-Order Flag Update",
              fc='#FFFFFF', ec=PRIMARY, title_color=PRIMARY)

    draw_node(10.2, 2.8, 2.5, 1.3, "promotion_settings", "Hero Banners Metadata\nLive Active Coupons List\nAuto-Slide Timing (4500ms)",
              fc='#FFFFFF', ec=PRIMARY, title_color=PRIMARY)

    draw_arrow(12.5, 4.2, 3.7, 3.45, "Write Order", color=PRIMARY)
    draw_arrow(3.7, 3.45, 4.2, 3.45, "Update Stock", color=PRIMARY)
    draw_arrow(6.7, 3.45, 7.2, 3.45, "Log History", color=PRIMARY)

    # --- ROW 4: ADMIN OPERATIONS & DISPATCH ---
    draw_node(1.2, 0.7, 3.5, 1.3, "Admin Dashboard (/admin)", "Primary Navigation & Metrics\nTop-Docked Settings Sub-Sidebar\nReal-Time Order & Inventory Feeds",
              fc='#FEF9C3', ec=ACCENT_ORANGE, title_color='#92400E')

    draw_node(6.0, 0.7, 4.0, 1.3, "Order Dispatch & Fulfillment", "Update Status: Pending -> Shipped -> Delivered\nAssign Courier AWB Tracking (e.g. Blue Dart)\nGenerates Tax Invoices & Packing Slips",
              fc='#EFF6FF', ec=SECONDARY, title_color=PRIMARY)

    draw_node(11.2, 0.7, 3.8, 1.3, "Promotions & Banner Control", "AdPromotionManager Component\nToggle Banners, Change Headlines\nConfigure Real-Time Coupon Discounts",
              fc='#F5F3FF', ec=ACCENT_PURPLE, title_color=ACCENT_PURPLE)

    draw_arrow(2.95, 2.0, 2.95, 2.8, "Sync / Pull Data", color=TEXT_MUTED)
    draw_arrow(4.7, 1.35, 6.0, 1.35, "Manage Orders", color=SECONDARY)
    draw_arrow(8.0, 2.0, 8.0, 2.8, "Push Status", color=SECONDARY)
    draw_arrow(10.0, 1.35, 11.2, 1.35, "Configure", color=ACCENT_PURPLE)
    draw_arrow(13.1, 2.0, 13.1, 2.8, "Live Save to Atlas", color=ACCENT_PURPLE)

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='#FFFFFF')
    plt.close()
    print(f"Flowchart successfully regenerated at: {output_path}")

if __name__ == "__main__":
    create_flowchart(r"E:\EMS Documents\atomy_system_flowchart.png")
