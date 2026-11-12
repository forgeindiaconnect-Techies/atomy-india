package com.example.atomy_india.service;

import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.OrderItem;
import com.example.atomy_india.model.OrderTracking;
import com.example.atomy_india.model.Membership;
import com.example.atomy_india.model.DistributorUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@Service
public class BrevoEmailService {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key:${BREVO_API_KEY:}}")
    private String apiKey;

    @Value("${brevo.sender.email:daggerking7828@gmail.com}")
    private String senderEmail;

    @Value("${brevo.sender.name:Forge India Connect}")
    private String senderName;

    @Value("${brevo.admin.email:daggerking7828@gmail.com}")
    private String adminEmail;

    @Value("${brevo.storefront.url:http://localhost:5173}")
    private String storefrontUrl;

    @Value("${brevo.admin.url:http://localhost:5174}")
    private String adminUrl;

    @Value("${brevo.mobile.scheme:atomyindia}")
    private String mobileAppScheme;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Resolves the storefront URL for customer-facing tracking and portal links
     */
    private String getEffectiveStorefrontUrl() {
        if (storefrontUrl != null && !storefrontUrl.trim().isEmpty()) {
            return storefrontUrl.trim().replaceAll("/+$", "");
        }
        return "http://localhost:5173";
    }

    /**
     * Resolves the admin portal URL for administrator notifications
     */
    private String getEffectiveAdminUrl() {
        if (adminUrl != null && !adminUrl.trim().isEmpty()) {
            return adminUrl.trim().replaceAll("/+$", "");
        }
        return "http://localhost:5174";
    }

    /**
     * Mobile-Optimized HTML Email Wrapper with responsive styles for iOS/Android/Gmail/Outlook
     */
    private String wrapEmailHtml(String title, String subtitle, String contentHtml) {
        return "<!DOCTYPE html>"
                + "<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">"
                + "<head>"
                + "<meta charset=\"UTF-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                + "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">"
                + "<title>" + escapeHtml(title) + "</title>"
                + "<style>"
                + "  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }"
                + "  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }"
                + "  img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }"
                + "  body { margin:0; padding:0; width:100% !important; background-color:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }"
                + "  @media only screen and (max-width: 600px) {"
                + "    .email-container { width:100% !important; max-width:100% !important; }"
                + "    .mobile-card { border-radius:0 !important; border-left:none !important; border-right:none !important; }"
                + "    .mobile-pad { padding:20px 14px !important; }"
                + "    .header-pad { padding:20px 14px !important; }"
                + "    .btn-block { display:block !important; width:100% !important; box-sizing:border-box !important; text-align:center !important; margin:8px 0 !important; }"
                + "    .item-title { font-size:13px !important; }"
                + "    .meta-box td { font-size:12.5px !important; }"
                + "  }"
                + "</style>"
                + "</head>"
                + "<body style=\"margin:0;padding:0;background-color:#f1f5f9;-webkit-font-smoothing:antialiased;\">"
                + "<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f1f5f9;margin:0;padding:16px 0;\">"
                + "  <tr>"
                + "    <td align=\"center\" style=\"padding:0 8px;\">"
                + "      <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"email-container mobile-card\" style=\"max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.04);\">"
                + "        <!-- Brand Header Bar -->"
                + "        <tr>"
                + "          <td align=\"center\" class=\"header-pad\" style=\"background:linear-gradient(135deg,#00A3E0 0%,#0284c7 100%);padding:24px 20px;text-align:center;\">"
                + "            <div style=\"font-size:22px;font-weight:900;color:#ffffff;letter-spacing:1px;text-transform:uppercase;\">FIC &bull; ATOMY INDIA</div>"
                + "            <div style=\"font-size:12.5px;color:#e0f2fe;margin-top:4px;font-weight:500;\">" + escapeHtml(subtitle) + "</div>"
                + "          </td>"
                + "        </tr>"
                + "        <!-- Body Content -->"
                + "        <tr>"
                + "          <td class=\"mobile-pad\" style=\"padding:28px 22px;color:#334155;font-size:14px;line-height:1.6;\">"
                + contentHtml
                + "          </td>"
                + "        </tr>"
                + "        <!-- Brand Footer -->"
                + "        <tr>"
                + "          <td style=\"background:#f8fafc;padding:18px 20px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:11.5px;line-height:1.6;\">"
                + "            <div>&copy; 2026 Forge India Connect Pvt Ltd (FIC) &bull; Official Atomy India Partner</div>"
                + "            <div style=\"margin-top:4px;\">Support: <a href=\"mailto:daggerking7828@gmail.com\" style=\"color:#00A3E0;text-decoration:none;\">daggerking7828@gmail.com</a> | Helpline: 1800-103-8855</div>"
                + "          </td>"
                + "        </tr>"
                + "      </table>"
                + "    </td>"
                + "  </tr>"
                + "</table>"
                + "</body>"
                + "</html>";
    }

    /**
     * Builds responsive Live Tracking Action Links:
     * - Web Browser orders: primary button routes to server web tracking url
     * - Mobile App orders: primary button opens mobile app deep link scheme with web fallback
     */
    private String buildTrackingActionHtml(CustomerOrder order) {
        String baseStorefront = getEffectiveStorefrontUrl();
        String scheme = (mobileAppScheme != null && !mobileAppScheme.trim().isEmpty()) ? mobileAppScheme.trim() : "atomyindia";
        String orderId = (order != null && order.getOrderId() != null) ? order.getOrderId() : "";
        
        String webTrackingUrl = baseStorefront + "/orders?orderId=" + escapeHtml(orderId);
        String mobileAppUrl = scheme + "://orders?orderId=" + escapeHtml(orderId);
        boolean isMobileOrder = order != null && "MOBILE_APP".equalsIgnoreCase(order.getOrderSource());

        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"text-align:center;margin:24px 0 8px;padding:18px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;\">");
        
        if (isMobileOrder) {
            sb.append("<div style=\"display:inline-block;background:#e0f2fe;color:#0284c7;font-size:11.5px;font-weight:bold;padding:3px 10px;border-radius:12px;text-transform:uppercase;margin-bottom:10px;\">&#128241; Ordered from Mobile App</div><br>")
              .append("<a href=\"").append(mobileAppUrl).append("\" class=\"btn-block\" style=\"background:#00A3E0;color:#ffffff;padding:13px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 3px 8px rgba(0,163,224,0.3);margin:4px 0;\">&#128241; Open Live Tracking in Atomy App &rarr;</a>")
              .append("<div style=\"margin-top:12px;font-size:12.5px;color:#64748b;\">")
              .append("Or track via Web Browser: <br>")
              .append("<a href=\"").append(webTrackingUrl).append("\" style=\"color:#00A3E0;font-weight:600;word-break:break-all;text-decoration:underline;\">").append(webTrackingUrl).append("</a>")
              .append("</div>");
        } else {
            sb.append("<div style=\"display:inline-block;background:#f0f9ff;color:#0284c7;font-size:11.5px;font-weight:bold;padding:3px 10px;border-radius:12px;text-transform:uppercase;margin-bottom:10px;\">&#128187; Ordered from Web Storefront</div><br>")
              .append("<a href=\"").append(webTrackingUrl).append("\" class=\"btn-block\" style=\"background:#00A3E0;color:#ffffff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 3px 8px rgba(0,163,224,0.3);margin:4px 0;\">&#128666; Track Live Order Online &rarr;</a>")
              .append("<div style=\"margin-top:12px;font-size:12px;color:#64748b;\">")
              .append("Using the Mobile App? <a href=\"").append(mobileAppUrl).append("\" style=\"color:#00A3E0;font-weight:bold;text-decoration:underline;\">Open in Atomy Mobile App</a>")
              .append("</div>");
        }
        
        sb.append("</div>");
        return sb.toString();
    }

    /**
     * Core async email dispatcher using Brevo v3 HTTP REST API
     */
    public CompletableFuture<Boolean> sendEmailAsync(String toEmail, String toName, String subject, String htmlContent) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (toEmail == null || toEmail.trim().isEmpty()) {
                    log.warn("Cannot send email: recipient email address is empty");
                    return false;
                }

                String cleanApiKey = (apiKey != null) ? apiKey.trim() : "";
                if (cleanApiKey.isEmpty()) {
                    log.error("Brevo API Key is missing. Email skipped.");
                    return false;
                }

                String recipientName = (toName != null && !toName.trim().isEmpty()) ? toName.trim() : "Valued Customer";

                // Build JSON payload safely
                String jsonPayload = "{"
                        + "\"sender\":{\"name\":\"" + escapeJson(senderName) + "\",\"email\":\"" + escapeJson(senderEmail) + "\"},"
                        + "\"to\":[{\"email\":\"" + escapeJson(toEmail.trim()) + "\",\"name\":\"" + escapeJson(recipientName) + "\"}],"
                        + "\"subject\":\"" + escapeJson(subject) + "\","
                        + "\"htmlContent\":\"" + escapeJson(htmlContent) + "\""
                        + "}";

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BREVO_API_URL))
                        .timeout(Duration.ofSeconds(15))
                        .header("api-key", cleanApiKey)
                        .header("Content-Type", "application/json")
                        .header("Accept", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("Brevo email sent successfully to {} (Status: {})", toEmail, response.statusCode());
                    return true;
                } else {
                    log.error("Failed to send Brevo email to {}. HTTP {}: {}", toEmail, response.statusCode(), response.body());
                    return false;
                }
            } catch (Exception e) {
                log.error("Exception while sending Brevo email to {}: {}", toEmail, e.getMessage(), e);
                return false;
            }
        });
    }

    // =========================================================================
    // 1. PASSWORD RESET OTP EMAIL
    // =========================================================================
    public void sendPasswordResetOtp(String toEmail, String customerName, String otp) {
        String name = (customerName != null && !customerName.trim().isEmpty()) ? customerName : "Member";
        String subject = "Password Reset OTP: " + otp + " - FIC (Atomy India)";

        String innerContent = "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Password Reset Request</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(name) + "</strong>,</p>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">We received a request to reset your password. Use the verification code below to complete your password reset:</p>"
                + "<div style=\"background:#f0f9ff;border:2px dashed #00A3E0;border-radius:8px;padding:18px;text-align:center;margin:22px 0;\">"
                + "  <span style=\"font-size:32px;font-weight:bold;letter-spacing:8px;color:#00A3E0;font-family:monospace;\">" + escapeHtml(otp) + "</span>"
                + "</div>"
                + "<p style=\"color:#64748b;font-size:12.5px;line-height:1.5;\">This verification code is valid for <strong>15 minutes</strong>. For your security, never share this OTP with anyone.</p>"
                + "<p style=\"color:#94a3b8;font-size:12px;margin-top:20px;border-top:1px solid #f1f5f9;padding-top:14px;\">If you did not request this password reset, please ignore this email. Your existing password remains safe and unchanged.</p>";

        String html = wrapEmailHtml("Password Reset OTP", "Account Security Verification", innerContent);
        sendEmailAsync(toEmail, name, subject, html);
    }

    // =========================================================================
    // 2. PASSWORD RESET SUCCESS CONFIRMATION
    // =========================================================================
    public void sendPasswordResetSuccess(String toEmail, String customerName) {
        String name = (customerName != null && !customerName.trim().isEmpty()) ? customerName : "Member";
        String subject = "Password Changed Successfully - FIC (Atomy India)";
        String signInUrl = getEffectiveStorefrontUrl() + "/signin";

        String innerContent = "<h2 style=\"color:#059669;font-size:18px;margin-top:0;\">&#10004; Password Updated Successfully</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(name) + "</strong>,</p>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Your password for your FIC (Atomy India) account has been updated successfully. You can now sign in with your new credentials.</p>"
                + "<div style=\"text-align:center;margin:24px 0;\">"
                + "  <a href=\"" + escapeHtml(signInUrl) + "\" class=\"btn-block\" style=\"background:#00A3E0;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;\">Sign In to Your Account</a>"
                + "</div>"
                + "<p style=\"color:#94a3b8;font-size:12px;border-top:1px solid #f1f5f9;padding-top:14px;\">If you did not make this change, please contact customer support immediately at daggerking7828@gmail.com.</p>";

        String html = wrapEmailHtml("Password Changed", "Account Update Confirmation", innerContent);
        sendEmailAsync(toEmail, name, subject, html);
    }

    // =========================================================================
    // 2B. HUB SELF-PICKUP HANDOVER VERIFICATION OTP EMAIL
    // =========================================================================
    public void sendPickupVerificationOtp(CustomerOrder order, String otp, String hubName) {
        if (order == null || order.getCustomerEmail() == null || order.getCustomerEmail().trim().isEmpty()) {
            return;
        }

        String name = (order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty())
                ? order.getCustomerName() : "Customer";
        String orderId = order.getOrderId();
        String safeHub = (hubName != null && !hubName.trim().isEmpty()) ? hubName : "Atomy Regional Logistics Hub";
        String subject = "🔐 Handover OTP: " + otp + " for Order #" + orderId + " - " + safeHub;

        String innerContent = "<div style=\"background:#ecfdf5;border:1.5px solid #86efac;border-radius:10px;padding:16px;margin-bottom:20px;\">"
                + "  <div style=\"color:#166534;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;\">&#128205; IN-STORE COUNTER COLLECTION</div>"
                + "  <div style=\"color:#15803d;font-size:16px;font-weight:bold;margin-top:4px;\">" + escapeHtml(safeHub) + "</div>"
                + "</div>"
                + "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Hub Pickup Security Verification</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(name) + "</strong>,</p>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">You (or someone on your behalf) are collecting Order <strong>#" + escapeHtml(orderId) + "</strong> at the regional hub counter. To prevent false collection and confirm safe handover, please tell or show the 6-digit OTP below to the distributor at the counter:</p>"
                + "<div style=\"background:#f0fdf4;border:2px dashed #16a34a;border-radius:10px;padding:22px;text-align:center;margin:24px 0;\">"
                + "  <div style=\"font-size:12px;color:#15803d;font-weight:700;letter-spacing:1px;margin-bottom:6px;\">YOUR SECURE HANDOVER OTP</div>"
                + "  <span style=\"font-size:36px;font-weight:bold;letter-spacing:10px;color:#15803d;font-family:monospace;\">" + escapeHtml(otp) + "</span>"
                + "  <div style=\"font-size:11.5px;color:#64748b;margin-top:8px;\">Valid for <strong>10 minutes</strong> &bull; One-Time Use</div>"
                + "</div>"
                + "<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:20px;\">"
                + "  <div style=\"font-size:13px;color:#334155;font-weight:600;margin-bottom:4px;\">Order Details:</div>"
                + "  <div style=\"font-size:12.5px;color:#64748b;\">Order ID: <strong>#" + escapeHtml(orderId) + "</strong></div>"
                + "  <div style=\"font-size:12.5px;color:#64748b;\">Total Amount: <strong>&#8377;" + (order.getTotalAmount() != null ? order.getTotalAmount() : "0.00") + "</strong></div>"
                + "</div>"
                + "<p style=\"color:#b91c1c;font-size:12px;background:#fef2f2;border-left:3px solid #ef4444;padding:8px 12px;margin:0 0 16px 0;\">"
                + "  &#9888; <strong>Security Alert:</strong> Never share this OTP over phone, WhatsApp or SMS. Only read this code directly to the Atomy hub counter staff in person when receiving your physical parcel."
                + "</p>";

        String html = wrapEmailHtml("Hub Pickup OTP", "Counter Handover Security Code", innerContent);
        sendEmailAsync(order.getCustomerEmail(), name, subject, html);
    }

    public void sendPickupDeliveredConfirmation(CustomerOrder order, String hubName) {
        if (order == null || order.getCustomerEmail() == null || order.getCustomerEmail().trim().isEmpty()) {
            return;
        }

        String name = (order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty())
                ? order.getCustomerName() : "Customer";
        String orderId = order.getOrderId();
        String safeHub = (hubName != null && !hubName.trim().isEmpty()) ? hubName : "Atomy Regional Logistics Hub";
        String subject = "📦 Order Handed Over & Collected: #" + orderId + " - FIC (Atomy India)";

        String innerContent = "<h2 style=\"color:#15803d;font-size:18px;margin-top:0;\">&#10004; Parcel Successfully Collected!</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(name) + "</strong>,</p>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Your order <strong>#" + escapeHtml(orderId) + "</strong> has been verified via OTP and successfully handed over to you at <strong>" + escapeHtml(safeHub) + "</strong>.</p>"
                + "<div style=\"background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:20px 0;\">"
                + "  <div style=\"font-size:13px;color:#166534;font-weight:bold;\">&#10004; Delivery Status: DELIVERED (Collected at Hub Counter)</div>"
                + "  <div style=\"font-size:12px;color:#475569;margin-top:4px;\">Thank you for shopping with Atomy India. We hope you enjoy your products!</div>"
                + "</div>"
                + "<div style=\"text-align:center;margin:24px 0;\">"
                + "  <a href=\"" + escapeHtml(getEffectiveStorefrontUrl() + "/orders") + "\" class=\"btn-block\" style=\"background:#0284c7;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;\">View Order History</a>"
                + "</div>";

        String html = wrapEmailHtml("Order Collected", "Handover Confirmation", innerContent);
        sendEmailAsync(order.getCustomerEmail(), name, subject, html);
    }

    // =========================================================================
    // 3. ORDER CONFIRMATION EMAIL (CUSTOMER)
    // =========================================================================
    public void sendOrderConfirmation(CustomerOrder order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().trim().isEmpty()) {
            return;
        }

        String subject = "Order Confirmed: #" + order.getOrderId() + " - FIC (Atomy India)";

        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsHtml.append("<tr>")
                        .append("<td style=\"padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;\">")
                        .append("<div style=\"font-weight:600;color:#0f172a;\" class=\"item-title\">").append(escapeHtml(item.getProductName())).append("</div>")
                        .append("<div style=\"font-size:11.5px;color:#64748b;margin-top:2px;\">&#8377;").append(item.getPrice()).append(" per unit</div>")
                        .append("</td>")
                        .append("<td style=\"padding:10px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569;text-align:center;font-weight:600;\">").append(item.getQuantity()).append("</td>")
                        .append("<td style=\"padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#0f172a;font-weight:bold;text-align:right;\">&#8377;").append(item.getSubtotal()).append("</td>")
                        .append("</tr>");
            }
        }

        boolean isPickup = "STORE_PICKUP".equalsIgnoreCase(order.getFulfillmentType());
        String destinationCardHtml;
        if (isPickup) {
            String hubLoc = (order.getHubAddress() != null && !order.getHubAddress().trim().isEmpty())
                    ? order.getHubAddress().trim() : order.getAssignedDistributorName();
            destinationCardHtml = "<div style=\"margin:18px 0;padding:14px 16px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;\">"
                    + "<div style=\"font-size:12px;font-weight:bold;color:#15803d;text-transform:uppercase;margin-bottom:4px;\">&#127970; Direct Store / Hub Counter Pickup</div>"
                    + "<div style=\"font-size:13.5px;font-weight:bold;color:#0f172a;\">" + escapeHtml(hubLoc) + "</div>"
                    + "<div style=\"font-size:12px;color:#475569;margin-top:4px;\">Please present this Order ID (<strong>#" + escapeHtml(order.getOrderId()) + "</strong>) at the counter to collect your packed parcel.</div>"
                    + "</div>";
        } else {
            destinationCardHtml = "<div style=\"margin:18px 0;padding:14px 16px;background:#f0f9ff;border-left:4px solid #00A3E0;border-radius:6px;\">"
                    + "<div style=\"font-size:12px;font-weight:bold;color:#0369a1;text-transform:uppercase;margin-bottom:4px;\">&#128666; Doorstep Delivery Destination</div>"
                    + "<div style=\"font-size:13px;color:#1e293b;line-height:1.5;\">" + escapeHtml(order.getShippingAddress()) + ", " + escapeHtml(order.getCity()) + ", " + escapeHtml(order.getState()) + " - " + escapeHtml(order.getPincode()) + "</div>"
                    + "<div style=\"font-size:12px;color:#64748b;margin-top:4px;\">Contact Phone: " + escapeHtml(order.getCustomerPhone()) + "</div>"
                    + "</div>";
        }

        String innerContent = "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Thank you for your order!</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(order.getCustomerName()) + "</strong>, we have received your order <strong>#" + escapeHtml(order.getOrderId()) + "</strong>.</p>"
                + "<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse:collapse;margin:18px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;\">"
                + "  <thead>"
                + "    <tr style=\"background:#00A3E0;color:#ffffff;\">"
                + "      <th style=\"padding:10px 12px;text-align:left;font-size:12px;font-weight:bold;\">Product Description</th>"
                + "      <th style=\"padding:10px 8px;text-align:center;font-size:12px;font-weight:bold;width:40px;\">Qty</th>"
                + "      <th style=\"padding:10px 12px;text-align:right;font-size:12px;font-weight:bold;width:80px;\">Subtotal</th>"
                + "    </tr>"
                + "  </thead>"
                + "  <tbody>" + itemsHtml + "</tbody>"
                + "</table>"
                + "<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"meta-box\" style=\"background:#f8fafc;padding:14px 16px;border-radius:8px;border:1px solid #e2e8f0;margin:18px 0;\">"
                + "  <tr>"
                + "    <td style=\"padding:4px 0;font-size:13px;color:#64748b;text-align:left;\">Delivery Surcharge:</td>"
                + "    <td style=\"padding:4px 0;font-size:13px;text-align:right;\">" + (order.getShippingFee().doubleValue() == 0 ? "<strong style=\"color:#059669;\">FREE</strong>" : "&#8377;" + order.getShippingFee()) + "</td>"
                + "  </tr>"
                + "  <tr>"
                + "    <td style=\"padding:10px 0 2px;font-size:15px;color:#0f172a;font-weight:bold;text-align:left;border-top:1px solid #e2e8f0;\">Total Amount Paid:</td>"
                + "    <td style=\"padding:10px 0 2px;font-size:17px;color:#00A3E0;font-weight:bold;text-align:right;border-top:1px solid #e2e8f0;\">&#8377;" + order.getTotalAmount() + "</td>"
                + "  </tr>"
                + "</table>"
                + destinationCardHtml
                + buildTrackingActionHtml(order);

        String html = wrapEmailHtml("Order Confirmation #" + order.getOrderId(), "Order Confirmation & Tax Invoice", innerContent);
        sendEmailAsync(order.getCustomerEmail(), order.getCustomerName(), subject, html);
    }

    // =========================================================================
    // 4. ORDER SHIPPED / DISPATCHED EMAIL (CUSTOMER)
    // =========================================================================
    public void sendOrderShipped(CustomerOrder order, OrderTracking tracking) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().trim().isEmpty()) {
            return;
        }

        boolean isPickup = "STORE_PICKUP".equalsIgnoreCase(order.getFulfillmentType());
        String courier = (tracking != null && tracking.getCourierPartner() != null) ? tracking.getCourierPartner() : "Blue Dart Express";
        String awb = (tracking != null && tracking.getTrackingNumber() != null) ? tracking.getTrackingNumber() : "AWB-IN-" + order.getOrderId();
        
        String subject = isPickup 
                ? "Order Ready for Pickup: #" + order.getOrderId() + " at Regional Hub"
                : "Order Dispatched: #" + order.getOrderId() + " via " + courier;

        String trackingDetailsHtml;
        if (isPickup) {
            String hubLoc = (order.getHubAddress() != null && !order.getHubAddress().trim().isEmpty())
                    ? order.getHubAddress().trim() : order.getAssignedDistributorName();
            trackingDetailsHtml = "<div style=\"background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:8px;padding:16px 18px;margin:18px 0;\">"
                    + "  <div style=\"font-size:12px;font-weight:bold;color:#15803d;text-transform:uppercase;margin-bottom:6px;\">&#127970; Pickup Counter Ready</div>"
                    + "  <div style=\"font-size:13.5px;color:#0f172a;line-height:1.6;\"><strong>Collection Point:</strong> " + escapeHtml(hubLoc) + "</div>"
                    + "  <div style=\"font-size:13px;color:#334155;margin-top:4px;\"><strong>Order Verification ID:</strong> <span style=\"font-family:monospace;font-weight:bold;color:#16a34a;\">#" + escapeHtml(order.getOrderId()) + "</span></div>"
                    + "</div>";
        } else {
            trackingDetailsHtml = "<div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #00A3E0;border-radius:8px;padding:16px 18px;margin:18px 0;\">"
                    + "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"meta-box\" style=\"font-size:13px;line-height:1.7;\">"
                    + "    <tr><td style=\"color:#64748b;padding:3px 0;width:140px;\">Courier Partner:</td><td style=\"color:#0284c7;font-weight:bold;\">" + escapeHtml(courier) + "</td></tr>"
                    + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Airway Bill (AWB):</td><td style=\"font-family:monospace;font-weight:bold;color:#0f172a;\">" + escapeHtml(awb) + "</td></tr>"
                    + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Delivery Status:</td><td style=\"color:#059669;font-weight:bold;\">IN ACTIVE TRANSIT</td></tr>"
                    + "  </table>"
                    + "</div>";
        }

        String innerContent = "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">" + (isPickup ? "&#127970; Your Order is Ready for Counter Pickup!" : "&#128666; Your Package is on the Way!") + "</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(order.getCustomerName()) + "</strong>,</p>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">" 
                + (isPickup 
                    ? "Great news! Your order <strong>#" + escapeHtml(order.getOrderId()) + "</strong> has been packed and is ready for pickup at our regional logistics counter."
                    : "Great news! Your order <strong>#" + escapeHtml(order.getOrderId()) + "</strong> has been packed and handed over to our delivery partner.")
                + "</p>"
                + trackingDetailsHtml
                + buildTrackingActionHtml(order);

        String html = wrapEmailHtml(subject, "Order Fulfillment Update", innerContent);
        sendEmailAsync(order.getCustomerEmail(), order.getCustomerName(), subject, html);
    }

    // =========================================================================
    // 5. INTERNAL ADMIN ALERT: NEW ORDER PLACED
    // =========================================================================
    public void sendAdminNewOrderAlert(CustomerOrder order) {
        String subject = "\uD83D\uDED2 [NEW ORDER] #" + order.getOrderId() + " - \u20B9" + order.getTotalAmount();
        String adminOrdersUrl = getEffectiveAdminUrl() + "/orders";

        String innerContent = "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">&#128276; Admin Alert: New Customer Order</h2>"
                + "<p style=\"font-size:14px;color:#475569;\">A new customer order has been placed on <strong>FIC (Atomy India)</strong>.</p>"
                + "<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"meta-box\" style=\"background:#f8fafc;padding:14px 16px;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;font-size:13px;line-height:1.8;\">"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;width:130px;\">Order ID:</td><td style=\"font-weight:bold;color:#0f172a;\">" + escapeHtml(order.getOrderId()) + "</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Customer Name:</td><td style=\"color:#1e293b;\">" + escapeHtml(order.getCustomerName()) + "</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Email / Phone:</td><td style=\"color:#1e293b;\">" + escapeHtml(order.getCustomerEmail()) + " / " + escapeHtml(order.getCustomerPhone()) + "</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Total Amount:</td><td style=\"font-weight:bold;color:#00A3E0;\">&#8377;" + order.getTotalAmount() + "</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Order Source:</td><td style=\"font-weight:bold;color:#475569;\">" + escapeHtml(order.getOrderSource() != null ? order.getOrderSource() : "WEB_BROWSER") + "</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Fulfillment:</td><td style=\"color:#1e293b;\">" + escapeHtml(order.getFulfillmentType()) + "</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Destination PIN:</td><td style=\"color:#1e293b;\">" + escapeHtml(order.getPincode()) + " (" + escapeHtml(order.getCity()) + ")</td></tr>"
                + "</table>"
                + "<div style=\"text-align:center;margin-top:24px;\">"
                + "  <a href=\"" + escapeHtml(adminOrdersUrl) + "\" class=\"btn-block\" style=\"background:#00A3E0;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13.5px;display:inline-block;\">Open Central Admin Dashboard &rarr;</a>"
                + "</div>";

        String html = wrapEmailHtml("New Order Received", "Super Admin Notification", innerContent);
        sendEmailAsync(adminEmail, "Admin", subject, html);
    }

    // =========================================================================
    // 6. ORDER DELAYED APOLOGY EMAIL (CUSTOMER)
    // =========================================================================
    public void sendOrderDelayedApology(CustomerOrder order, int delayDays, String expectedDateStr, String courierPartner, String trackingNumber) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().trim().isEmpty()) {
            return;
        }

        String customerName = (order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty())
                ? order.getCustomerName().trim() : "Valued Member";
        String courier = (courierPartner != null && !courierPartner.trim().isEmpty()) ? courierPartner : "Blue Dart Express";
        String awb = (trackingNumber != null && !trackingNumber.trim().isEmpty()) ? trackingNumber : ("AWB-IN-" + order.getOrderId());
        String targetDate = (expectedDateStr != null && !expectedDateStr.trim().isEmpty()) ? expectedDateStr : "Within 24 to 48 Hours";

        String subject = "Delivery Update: Important Notice Regarding Your Atomy Order #" + order.getOrderId();

        String innerContent = "<div style=\"display:inline-block;background:#fff1f2;border:1px solid #fecdd3;color:#e11d48;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:14px;\">&#9888; Slight Transit Delay</div>"
                + "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;line-height:1.4;\">We sincerely apologize for the delay!</h2>"
                + "<p style=\"color:#334155;font-size:14px;line-height:1.6;\">Dear <strong>" + escapeHtml(customerName) + "</strong>,</p>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">We are reaching out with an important delivery update regarding your order <strong>#" + escapeHtml(order.getOrderId()) + "</strong>. Your shipment is taking slightly longer than our standard delivery window to arrive.</p>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Please be assured that your 100% authentic Atomy products are safely packed. Our logistics team is actively coordinating with <strong>" + escapeHtml(courier) + "</strong> to expedite delivery to your destination.</p>"
                + "<div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #00A3E0;border-radius:8px;padding:16px 18px;margin:20px 0;\">"
                + "  <h4 style=\"margin:0 0 10px;font-size:13.5px;color:#0369a1;\">Updated Delivery Details</h4>"
                + "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"meta-box\" style=\"font-size:13px;line-height:1.8;\">"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;width:140px;\">Order ID:</td><td style=\"font-weight:bold;color:#0f172a;\">#" + escapeHtml(order.getOrderId()) + "</td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Estimated Arrival:</td><td style=\"color:#0284c7;font-weight:bold;\">" + escapeHtml(targetDate) + "</td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Carrier Partner:</td><td style=\"color:#1e293b;\">" + escapeHtml(courier) + "</td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Airway Bill (AWB):</td><td style=\"font-family:monospace;font-weight:bold;color:#0f172a;\">" + escapeHtml(awb) + "</td></tr>"
                + "  </table>"
                + "</div>"
                + buildTrackingActionHtml(order)
                + "<p style=\"color:#64748b;font-size:12px;line-height:1.6;margin-top:20px;border-top:1px solid #f1f5f9;padding-top:12px;\">We truly value your patience and trust in Forge India Connect. For urgent queries, contact care at <a href=\"mailto:daggerking7828@gmail.com\" style=\"color:#00A3E0;\">daggerking7828@gmail.com</a>.</p>";

        String html = wrapEmailHtml("Delivery Status Update", "Transit Update & Apology", innerContent);
        sendEmailAsync(order.getCustomerEmail(), customerName, subject, html);
    }

    // =========================================================================
    // 7. NEW SIGN UP WELCOME EMAIL (CUSTOMER)
    // =========================================================================
    public void sendCustomerWelcomeEmail(String toEmail, String customerName) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            return;
        }

        String name = (customerName != null && !customerName.trim().isEmpty()) ? customerName.trim() : "Valued Customer";
        String subject = "Welcome to Atomy India - Absolute Quality at Absolute Price!";
        String storeUrl = getEffectiveStorefrontUrl();

        String innerContent = "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Hello " + escapeHtml(name) + ",</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Thank you for joining <strong>Atomy India</strong>! We are thrilled to welcome you to our community dedicated to <em>Absolute Quality at Absolute Price</em>.</p>"
                + "<div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #00A3E0;border-radius:8px;padding:16px 18px;margin:20px 0;\">"
                + "  <h4 style=\"margin:0 0 10px;color:#0369a1;font-size:13.5px;\">What You Can Expect:</h4>"
                + "  <ul style=\"margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.8;\">"
                + "    <li><strong>100% Genuine Korean Imports:</strong> Premium healthcare (HemoHIM), skincare, and home essentials.</li>"
                + "    <li><strong>Fast Doorstep Delivery:</strong> Live milestone tracking across India via Blue Dart Express.</li>"
                + "    <li><strong>Distributor Club:</strong> Optional membership enrollment for DP pricing & PV point rewards.</li>"
                + "  </ul>"
                + "</div>"
                + "<div style=\"text-align:center;margin:26px 0 10px;\">"
                + "  <a href=\"" + escapeHtml(storeUrl) + "\" class=\"btn-block\" style=\"background:#00A3E0;color:#ffffff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;\">Start Exploring Atomy Products &rarr;</a>"
                + "</div>";

        String html = wrapEmailHtml("Welcome to Atomy India", "Welcome to Atomy India Platform", innerContent);
        sendEmailAsync(toEmail, name, subject, html);
    }

    // =========================================================================
    // 8. MEMBERSHIP PURCHASE WELCOME CONFIRMATION (CUSTOMER)
    // =========================================================================
    public void sendMembershipWelcomeEmail(Membership membership) {
        if (membership == null || membership.getCustomerEmail() == null || membership.getCustomerEmail().trim().isEmpty()) {
            return;
        }

        String name = (membership.getCustomerName() != null && !membership.getCustomerName().trim().isEmpty())
                ? membership.getCustomerName().trim() : "Valued Member";
        String planName = "MONTHLY".equalsIgnoreCase(membership.getPlan()) ? "Monthly Distributor Pass" : "Annual Elite Distributor Plan";
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        String expiryFormatted = membership.getExpiryDate() != null ? membership.getExpiryDate().format(dtf) : "Active";
        String subject = "\uD83C\uDF89 Welcome to Atomy Distributor Club! [Plan: " + membership.getPlan() + "]";
        String memberPortalUrl = getEffectiveStorefrontUrl() + "/membership";

        String innerContent = "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Congratulations " + escapeHtml(name) + "!</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Your <strong>" + escapeHtml(planName) + "</strong> is now officially active. You have unlocked wholesale distributor pricing across the entire Atomy catalog.</p>"
                + "<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 18px;margin:20px 0;\">"
                + "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"meta-box\" style=\"font-size:13px;line-height:1.8;\">"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;width:140px;\">Membership ID:</td><td style=\"font-family:monospace;font-weight:bold;color:#00A3E0;\">" + escapeHtml(membership.getId()) + "</td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Selected Plan:</td><td style=\"color:#1e293b;\">" + escapeHtml(planName) + "</td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Amount Paid:</td><td style=\"font-weight:bold;color:#0f172a;\">&#8377;" + membership.getAmountPaid() + " (" + escapeHtml(membership.getPaymentMethod()) + ")</td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Valid Until:</td><td style=\"color:#059669;font-weight:bold;\">" + escapeHtml(expiryFormatted) + "</td></tr>"
                + "  </table>"
                + "</div>"
                + "<div style=\"text-align:center;margin:26px 0 10px;\">"
                + "  <a href=\"" + escapeHtml(memberPortalUrl) + "\" class=\"btn-block\" style=\"background:#00A3E0;color:#ffffff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;\">View Member Dashboard &rarr;</a>"
                + "</div>";

        String html = wrapEmailHtml("Distributor Membership Active", "Distributor Club Membership", innerContent);
        sendEmailAsync(membership.getCustomerEmail(), name, subject, html);
    }

    // =========================================================================
    // 9. MEMBERSHIP EXPIRED NOTICE (CUSTOMER)
    // =========================================================================
    public void sendMembershipExpiredEmail(Membership membership) {
        if (membership == null || membership.getCustomerEmail() == null || membership.getCustomerEmail().trim().isEmpty()) {
            return;
        }

        String name = (membership.getCustomerName() != null && !membership.getCustomerName().trim().isEmpty())
                ? membership.getCustomerName().trim() : "Valued Member";
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        String expiryFormatted = membership.getExpiryDate() != null ? membership.getExpiryDate().format(dtf) : "Recently";
        String subject = "\u26A0\uFE0F Notice: Your Atomy Distributor Membership Has Expired - Renew Today";
        String renewUrl = getEffectiveStorefrontUrl() + "/membership";

        String innerContent = "<div style=\"display:inline-block;background:#fff1f2;border:1px solid #fecdd3;color:#e11d48;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:14px;\">&#9888; Plan Expired</div>"
                + "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Dear " + escapeHtml(name) + ",</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Your Atomy Distributor Membership (ID: <strong>" + escapeHtml(membership.getId()) + "</strong>) expired on <strong>" + escapeHtml(expiryFormatted) + "</strong>.</p>"
                + "<div style=\"background:#fff1f2;border:1px solid #fecdd3;border-left:4px solid #e11d48;border-radius:8px;padding:16px 18px;margin:20px 0;\">"
                + "  <h4 style=\"margin:0 0 8px;color:#9f1239;font-size:13.5px;\">Impact on Your Account:</h4>"
                + "  <ul style=\"margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.8;\">"
                + "    <li>Product pricing has reverted from wholesale Distributor Price (DP) to standard MRP.</li>"
                + "    <li>Personal PV accumulation on new orders is currently paused.</li>"
                + "  </ul>"
                + "</div>"
                + "<div style=\"text-align:center;margin:26px 0 10px;\">"
                + "  <a href=\"" + escapeHtml(renewUrl) + "\" class=\"btn-block\" style=\"background:#00A3E0;color:#ffffff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;\">Renew Your Distributor Membership &rarr;</a>"
                + "</div>";

        String html = wrapEmailHtml("Membership Expired", "Membership Plan Notice", innerContent);
        sendEmailAsync(membership.getCustomerEmail(), name, subject, html);
    }

    // =========================================================================
    // 10. DISTRIBUTOR INVITATION & PORTAL CREDENTIALS EMAIL
    // =========================================================================
    public CompletableFuture<Boolean> sendDistributorInvitationEmail(DistributorUser distributor, String rawPassword) {
        if (distributor == null || distributor.getEmail() == null || distributor.getEmail().trim().isEmpty()) {
            log.warn("Cannot send distributor invitation: email is empty");
            return CompletableFuture.completedFuture(false);
        }

        String recipientName = (distributor.getContactPerson() != null && !distributor.getContactPerson().trim().isEmpty())
                ? distributor.getContactPerson().trim()
                : (distributor.getBusinessName() != null ? distributor.getBusinessName() : "Regional Distributor Partner");

        String hubName = (distributor.getBusinessName() != null && !distributor.getBusinessName().trim().isEmpty())
                ? distributor.getBusinessName().trim() : "Atomy Regional Logistics Hub";
        String pincode = (distributor.getPrimaryPincode() != null) ? distributor.getPrimaryPincode() : "Territory";
        String pinsList = (distributor.getAssignedPincodes() != null && !distributor.getAssignedPincodes().isEmpty())
                ? String.join(", ", distributor.getAssignedPincodes()) : pincode;
        String commRate = (distributor.getCommissionRate() != null) ? String.format("%.1f", distributor.getCommissionRate()) : "7.5";
        String loginPortalUrl = getEffectiveAdminUrl();
        String passwordDisplay = (rawPassword != null && !rawPassword.trim().isEmpty()) ? rawPassword.trim() : "Admin@123";

        String subject = "Official Invitation: Regional Logistics Partner & Portal Access (PIN " + pincode + ")";

        String innerContent = "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Dear " + escapeHtml(recipientName) + ",</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">We are pleased to onboard <strong>" + escapeHtml(hubName) + "</strong> as an authorized <strong>Atomy Regional Logistics & Territory Distributor</strong> partner for Indian Postal Code <strong>" + escapeHtml(pincode) + "</strong>.</p>"
                + "<div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #0284c7;border-radius:8px;padding:16px 18px;margin:20px 0;\">"
                + "  <h4 style=\"margin:0 0 10px;color:#0369a1;font-size:13.5px;\">&#128273; Your Regional Sub-Admin Portal Credentials:</h4>"
                + "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"meta-box\" style=\"font-size:13px;line-height:1.9;\">"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;width:130px;\">Portal Link:</td><td><a href=\"" + escapeHtml(loginPortalUrl) + "\" style=\"color:#0284c7;font-weight:bold;word-break:break-all;\">" + escapeHtml(loginPortalUrl) + "</a></td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Login ID / Email:</td><td style=\"font-family:monospace;font-weight:bold;color:#0f172a;\">" + escapeHtml(distributor.getEmail()) + "</td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Assigned Password:</td><td style=\"font-family:monospace;font-weight:bold;color:#0284c7;\">" + escapeHtml(passwordDisplay) + "</td></tr>"
                + "    <tr><td style=\"color:#64748b;padding:3px 0;\">Distributor ID:</td><td style=\"font-family:monospace;color:#64748b;\">" + escapeHtml(distributor.getDistributorId()) + "</td></tr>"
                + "  </table>"
                + "</div>"
                + "<div style=\"background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:16px 18px;margin:20px 0;\">"
                + "  <h4 style=\"margin:0 0 10px;color:#1e293b;font-size:13.5px;\">&#128506;&#65039; Territory Franchised Privileges:</h4>"
                + "  <ul style=\"margin:0;padding-left:18px;color:#475569;font-size:13px;line-height:1.75;\">"
                + "    <li><strong>Franchised PIN Territory:</strong> " + escapeHtml(pinsList) + "</li>"
                + "    <li><strong>Order Commission:</strong> " + escapeHtml(commRate) + "% on all customer orders fulfilled in your territory.</li>"
                + "    <li><strong>Regional Operations:</strong> Real-time parcel packing, tracking status updates, and hub counter handovers.</li>"
                + "  </ul>"
                + "</div>"
                + "<div style=\"text-align:center;margin:26px 0 10px;\">"
                + "  <a href=\"" + escapeHtml(loginPortalUrl) + "\" class=\"btn-block\" style=\"background:#0284c7;color:#ffffff;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 3px 8px rgba(2,132,199,0.3);\">Access Regional Portal &rarr;</a>"
                + "</div>";

        String html = wrapEmailHtml("Regional Distributor Onboarding", "Regional Logistics Franchise", innerContent);
        return sendEmailAsync(distributor.getEmail(), recipientName, subject, html);
    }

    // =========================================================================
    // 9. REGIONAL DISTRIBUTOR ALERT: NEW CUSTOMER SUPPORT TICKET
    // =========================================================================
    public CompletableFuture<Boolean> sendDistributorTicketAlert(com.example.atomy_india.model.SupportTicket ticket, String distributorEmail, String distributorName) {
        if (distributorEmail == null || distributorEmail.trim().isEmpty()) {
            return CompletableFuture.completedFuture(false);
        }

        String recipient = (distributorName != null && !distributorName.trim().isEmpty()) ? distributorName : "Regional Hub Partner";
        String subject = "🎧 [NEW SUPPORT TICKET] #" + ticket.getTicketId() + " from " + ticket.getCustomerName();
        String portalUrl = getEffectiveAdminUrl();

        String innerContent = "<h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">&#127911; Customer Support Inquiry Received</h2>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(recipient) + "</strong>,</p>"
                + "<p style=\"color:#475569;font-size:14px;line-height:1.6;\">A customer in your regional territory has submitted a support inquiry requiring attention.</p>"
                + "<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"meta-box\" style=\"background:#f8fafc;padding:14px 16px;border-radius:8px;border:1px solid #e2e8f0;margin:18px 0;font-size:13px;line-height:1.8;\">"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;width:120px;\">Ticket ID:</td><td style=\"font-weight:bold;color:#0f172a;\">#" + escapeHtml(ticket.getTicketId()) + "</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Customer Name:</td><td style=\"font-weight:bold;color:#0f172a;\">" + escapeHtml(ticket.getCustomerName()) + "</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Email / Phone:</td><td>" + escapeHtml(ticket.getCustomerEmail()) + (ticket.getCustomerPhone() != null ? " / " + escapeHtml(ticket.getCustomerPhone()) : "") + "</td></tr>"
                + (ticket.getOrderId() != null && !ticket.getOrderId().trim().isEmpty() ? "  <tr><td style=\"color:#64748b;padding:3px 0;\">Related Order:</td><td style=\"font-weight:bold;color:#0284c7;\">#" + escapeHtml(ticket.getOrderId()) + "</td></tr>" : "")
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Category / Priority:</td><td><strong>" + escapeHtml(String.valueOf(ticket.getCategory())) + "</strong> (" + escapeHtml(String.valueOf(ticket.getPriority())) + ")</td></tr>"
                + "  <tr><td style=\"color:#64748b;padding:3px 0;\">Subject:</td><td style=\"font-weight:600;color:#1e293b;\">" + escapeHtml(ticket.getSubject()) + "</td></tr>"
                + "</table>"
                + "<div style=\"background:#f0f9ff;border-left:4px solid #00A3E0;padding:14px 16px;border-radius:6px;margin:18px 0;\">"
                + "  <div style=\"font-size:12px;font-weight:bold;color:#0369a1;text-transform:uppercase;margin-bottom:4px;\">Customer Message:</div>"
                + "  <div style=\"font-size:13.5px;color:#0f172a;line-height:1.6;\">" + (ticket.getMessages() != null && !ticket.getMessages().isEmpty() ? escapeHtml(ticket.getMessages().get(0).getMessage()) : "Inquiry submitted") + "</div>"
                + "</div>"
                + "<div style=\"text-align:center;margin:24px 0;\">"
                + "  <a href=\"" + escapeHtml(portalUrl) + "\" class=\"btn-block\" style=\"background:#00A3E0;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;\">Open Distributor Support Desk &rarr;</a>"
                + "</div>";

        String html = wrapEmailHtml("Customer Support Alert", "Regional Logistics Notification", innerContent);
        return sendEmailAsync(distributorEmail, recipient, subject, html);
    }

    // --- Utility JSON & HTML string escapers ---
    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
