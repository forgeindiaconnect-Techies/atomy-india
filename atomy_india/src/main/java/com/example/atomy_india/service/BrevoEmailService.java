package com.example.atomy_india.service;

import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.OrderItem;
import com.example.atomy_india.model.OrderTracking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

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

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#00A3E0;padding:20px;text-align:center;border-radius:8px 8px 0 0;\">"
                + "  <h1 style=\"color:#ffffff;margin:0;font-size:22px;letter-spacing:0.5px;\">FIC (Atomy India)</h1>"
                + "  <p style=\"color:#e0f2fe;margin:4px 0 0;font-size:13px;\">Forge India Connect E-Commerce Platform</p>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Password Reset Request</h2>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(name) + "</strong>,</p>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">We received a request to reset your password. Use the verification code below to complete your password reset:</p>"
                + "  <div style=\"background:#f0f9ff;border:2px dashed #00A3E0;border-radius:8px;padding:18px;text-align:center;margin:24px 0;\">"
                + "    <span style=\"font-size:32px;font-weight:bold;letter-spacing:8px;color:#00A3E0;font-family:monospace;\">" + escapeHtml(otp) + "</span>"
                + "  </div>"
                + "  <p style=\"color:#64748b;font-size:12.5px;line-height:1.5;\">This verification code is valid for <strong>15 minutes</strong>. For your security, never share this OTP with anyone.</p>"
                + "  <p style=\"color:#94a3b8;font-size:12px;margin-top:20px;border-top:1px solid #f1f5f9;padding-top:14px;\">If you did not request this password reset, please ignore this email. Your existing password will remain safe and unchanged.</p>"
                + "</div>"
                + "<div style=\"text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;\">"
                + "  &copy; 2026 Forge India Connect Pvt Ltd (FIC) &bull; Atomy India Direct-Selling Partner"
                + "</div>"
                + "</div>";

        sendEmailAsync(toEmail, name, subject, html);
    }

    // =========================================================================
    // 2. PASSWORD RESET SUCCESS CONFIRMATION
    // =========================================================================
    public void sendPasswordResetSuccess(String toEmail, String customerName) {
        String name = (customerName != null && !customerName.trim().isEmpty()) ? customerName : "Member";
        String subject = "Password Changed Successfully - FIC (Atomy India)";

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#00A3E0;padding:20px;text-align:center;border-radius:8px 8px 0 0;\">"
                + "  <h1 style=\"color:#ffffff;margin:0;font-size:22px;\">FIC (Atomy India)</h1>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <h2 style=\"color:#059669;font-size:18px;margin-top:0;\">&#10004; Password Updated Successfully</h2>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(name) + "</strong>,</p>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">Your password for your FIC (Atomy India) account has been updated successfully. You can now sign in with your new password.</p>"
                + "  <div style=\"text-align:center;margin:24px 0;\">"
                + "    <a href=\"" + storefrontUrl + "/signin\" style=\"background:#00A3E0;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;\">Sign In to Your Account</a>"
                + "  </div>"
                + "  <p style=\"color:#94a3b8;font-size:12px;border-top:1px solid #f1f5f9;padding-top:14px;\">If you did not make this change, please contact customer support immediately at daggerking7828@gmail.com.</p>"
                + "</div>"
                + "</div>";

        sendEmailAsync(toEmail, name, subject, html);
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
                        .append("<td style=\"padding:10px;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#1e293b;\">").append(escapeHtml(item.getProductName())).append("</td>")
                        .append("<td style=\"padding:10px;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#475569;text-align:center;\">").append(item.getQuantity()).append("</td>")
                        .append("<td style=\"padding:10px;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#1e293b;text-align:right;\">&#8377;").append(item.getPrice()).append("</td>")
                        .append("<td style=\"padding:10px;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#0f172a;font-weight:bold;text-align:right;\">&#8377;").append(item.getSubtotal()).append("</td>")
                        .append("</tr>");
            }
        }

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#00A3E0;padding:20px;text-align:center;border-radius:8px 8px 0 0;\">"
                + "  <h1 style=\"color:#ffffff;margin:0;font-size:22px;\">FIC (Atomy India)</h1>"
                + "  <p style=\"color:#e0f2fe;margin:4px 0 0;font-size:13px;\">Order Confirmation & Tax Invoice</p>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">Thank you for your order!</h2>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(order.getCustomerName()) + "</strong>, we have received your order <strong>#" + escapeHtml(order.getOrderId()) + "</strong>.</p>"
                + "  <table style=\"width:100%;border-collapse:collapse;margin:20px 0;background:#ffffff;\">"
                + "    <thead>"
                + "      <tr style=\"background:#00A3E0;color:#ffffff;\">"
                + "        <th style=\"padding:10px;text-align:left;font-size:12px;\">Product</th>"
                + "        <th style=\"padding:10px;text-align:center;font-size:12px;\">Qty</th>"
                + "        <th style=\"padding:10px;text-align:right;font-size:12px;\">Price</th>"
                + "        <th style=\"padding:10px;text-align:right;font-size:12px;\">Subtotal</th>"
                + "      </tr>"
                + "    </thead>"
                + "    <tbody>" + itemsHtml + "</tbody>"
                + "  </table>"
                + "  <div style=\"background:#f8fafc;padding:14px 18px;border-radius:6px;margin:18px 0;\">"
                + "    <div style=\"display:flex;justify-content:space-between;font-size:13.5px;color:#475569;margin-bottom:6px;\">"
                + "      <span>Delivery Surcharge:</span>"
                + "      <span>" + (order.getShippingFee().doubleValue() == 0 ? "<strong style=\"color:#059669;\">FREE</strong>" : "&#8377;" + order.getShippingFee()) + "</span>"
                + "    </div>"
                + "    <div style=\"display:flex;justify-content:space-between;font-size:16px;color:#0f172a;font-weight:bold;border-top:1px solid #e2e8f0;padding-top:8px;\">"
                + "      <span>Total Amount Paid:</span>"
                + "      <span style=\"color:#00A3E0;\">&#8377;" + order.getTotalAmount() + "</span>"
                + "    </div>"
                + "  </div>"
                + "  <div style=\"margin:20px 0;padding:12px 16px;background:#f0f9ff;border-left:4px solid #00A3E0;border-radius:4px;\">"
                + "    <h4 style=\"margin:0 0 4px;color:#0f172a;font-size:13px;\">Shipping Address:</h4>"
                + "    <p style=\"margin:0;font-size:12.5px;color:#475569;\">" + escapeHtml(order.getShippingAddress()) + ", " + escapeHtml(order.getCity()) + ", " + escapeHtml(order.getState()) + " - " + escapeHtml(order.getPincode()) + "</p>"
                + "    <p style=\"margin:4px 0 0;font-size:12.5px;color:#475569;\">Phone: " + escapeHtml(order.getCustomerPhone()) + "</p>"
                + "  </div>"
                + "  <div style=\"text-align:center;margin:24px 0 10px;\">"
                + "    <a href=\"" + storefrontUrl + "/profile\" style=\"background:#00A3E0;color:#ffffff;padding:11px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13.5px;display:inline-block;\">Track Order Online</a>"
                + "  </div>"
                + "</div>"
                + "</div>";

        sendEmailAsync(order.getCustomerEmail(), order.getCustomerName(), subject, html);
    }

    // =========================================================================
    // 4. ORDER SHIPPED / DISPATCHED EMAIL (CUSTOMER)
    // =========================================================================
    public void sendOrderShipped(CustomerOrder order, OrderTracking tracking) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().trim().isEmpty()) {
            return;
        }

        String courier = (tracking != null && tracking.getCourierPartner() != null) ? tracking.getCourierPartner() : "Blue Dart Express";
        String awb = (tracking != null && tracking.getTrackingNumber() != null) ? tracking.getTrackingNumber() : "AWB-IN-" + order.getOrderId();
        String subject = "Order Dispatched: #" + order.getOrderId() + " via " + courier;

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#00A3E0;padding:20px;text-align:center;border-radius:8px 8px 0 0;\">"
                + "  <h1 style=\"color:#ffffff;margin:0;font-size:22px;\">FIC (Atomy India)</h1>"
                + "  <p style=\"color:#e0f2fe;margin:4px 0 0;font-size:13px;\">Order Shipped Notification</p>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <h2 style=\"color:#0f172a;font-size:18px;margin-top:0;\">&#128666; Your Package is on the Way!</h2>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">Hello <strong>" + escapeHtml(order.getCustomerName()) + "</strong>,</p>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">Great news! Your order <strong>#" + escapeHtml(order.getOrderId()) + "</strong> has been packed and handed over to our delivery partner.</p>"
                + "  <div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin:20px 0;\">"
                + "    <div style=\"margin-bottom:8px;\"><strong style=\"color:#0f172a;\">Courier Partner:</strong> <span style=\"color:#00A3E0;font-weight:bold;\">" + escapeHtml(courier) + "</span></div>"
                + "    <div><strong style=\"color:#0f172a;\">Airway Bill (AWB) Tracking No:</strong> <span style=\"font-family:monospace;font-size:14px;font-weight:bold;color:#0f172a;\">" + escapeHtml(awb) + "</span></div>"
                + "  </div>"
                + "  <div style=\"text-align:center;margin:24px 0;\">"
                + "    <a href=\"" + storefrontUrl + "/profile\" style=\"background:#00A3E0;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;\">Track Live Delivery Milestones</a>"
                + "  </div>"
                + "</div>"
                + "</div>";

        sendEmailAsync(order.getCustomerEmail(), order.getCustomerName(), subject, html);
    }

    // =========================================================================
    // 5. INTERNAL ADMIN ALERT: NEW ORDER PLACED
    // =========================================================================
    public void sendAdminNewOrderAlert(CustomerOrder order) {
        String subject = "\uD83D\uDED2 [NEW ORDER] #" + order.getOrderId() + " - \u20B9" + order.getTotalAmount();

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#0f172a;padding:16px 20px;border-radius:8px 8px 0 0;\">"
                + "  <h2 style=\"color:#ffffff;margin:0;font-size:18px;\">&#128276; Admin Alert: New Customer Order</h2>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <p style=\"font-size:15px;color:#0f172a;margin-top:0;\">A new customer order has been placed on <strong>FIC (Atomy India)</strong>.</p>"
                + "  <ul style=\"color:#475569;font-size:13.5px;line-height:1.8;\">"
                + "    <li><strong>Order ID:</strong> " + escapeHtml(order.getOrderId()) + "</li>"
                + "    <li><strong>Customer Name:</strong> " + escapeHtml(order.getCustomerName()) + "</li>"
                + "    <li><strong>Email:</strong> " + escapeHtml(order.getCustomerEmail()) + "</li>"
                + "    <li><strong>Phone:</strong> " + escapeHtml(order.getCustomerPhone()) + "</li>"
                + "    <li><strong>Total Amount:</strong> &#8377;" + order.getTotalAmount() + "</li>"
                + "    <li><strong>Payment Method:</strong> " + order.getPaymentMethod() + "</li>"
                + "    <li><strong>Destination Pincode:</strong> " + escapeHtml(order.getPincode()) + " (" + escapeHtml(order.getCity()) + ")</li>"
                + "  </ul>"
                + "  <div style=\"text-align:center;margin-top:20px;\">"
                + "    <a href=\"http://localhost:5174/orders\" style=\"background:#00A3E0;color:#ffffff;padding:10px 22px;border-radius:5px;text-decoration:none;font-weight:bold;font-size:13px;display:inline-block;\">Open Admin Dashboard</a>"
                + "  </div>"
                + "</div>"
                + "</div>";

        sendEmailAsync(adminEmail, "Admin", subject, html);
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
