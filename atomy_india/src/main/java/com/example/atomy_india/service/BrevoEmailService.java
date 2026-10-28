package com.example.atomy_india.service;

import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.OrderItem;
import com.example.atomy_india.model.OrderTracking;
import com.example.atomy_india.model.Membership;
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

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#00A3E0;padding:24px 20px;text-align:center;border-radius:8px 8px 0 0;\">"
                + "  <h1 style=\"color:#ffffff;margin:0;font-size:22px;letter-spacing:0.5px;\">FIC (Atomy India)</h1>"
                + "  <p style=\"color:#e0f2fe;margin:6px 0 0;font-size:13.5px;font-weight:500;\">Delivery Status Update & Apology</p>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <div style=\"display:inline-block;background:#fff1f2;border:1px solid #fecdd3;color:#e11d48;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:16px;\">&#9888; Slight Transit Delay</div>"
                + "  <h2 style=\"color:#0f172a;font-size:19px;margin-top:0;line-height:1.4;\">We sincerely apologize for the delay!</h2>"
                + "  <p style=\"color:#334155;font-size:14.5px;line-height:1.6;\">Dear <strong>" + escapeHtml(customerName) + "</strong>,</p>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">We are reaching out with an important delivery update regarding your order <strong>#" + escapeHtml(order.getOrderId()) + "</strong>. We sincerely apologize, as your shipment is experiencing a brief transit delay and is taking slightly longer than our standard delivery window to arrive.</p>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">Please be assured that your 100% authentic Atomy products are safely packed and in active transit. Our logistics team is actively coordinating with <strong>" + escapeHtml(courier) + "</strong> to expedite your delivery so it reaches you as soon as possible.</p>"
                + "  <div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #00A3E0;border-radius:6px;padding:16px 20px;margin:20px 0;\">"
                + "    <h3 style=\"margin:0 0 10px;font-size:14px;color:#0369a1;\">Updated Delivery Details</h3>"
                + "    <div style=\"font-size:13px;color:#334155;line-height:1.9;\">"
                + "      <div><strong>Order ID:</strong> #" + escapeHtml(order.getOrderId()) + "</div>"
                + "      <div><strong>Estimated Arrival:</strong> <span style=\"color:#0284c7;font-weight:bold;\">" + escapeHtml(targetDate) + "</span></div>"
                + "      <div><strong>Carrier Partner:</strong> " + escapeHtml(courier) + "</div>"
                + "      <div><strong>Airway Bill (AWB):</strong> <span style=\"font-family:monospace;font-weight:bold;color:#0f172a;\">" + escapeHtml(awb) + "</span></div>"
                + "      <div><strong>Destination:</strong> " + escapeHtml(order.getShippingAddress()) + ", " + escapeHtml(order.getCity()) + ", " + escapeHtml(order.getState()) + " - " + escapeHtml(order.getPincode()) + "</div>"
                + "    </div>"
                + "  </div>"
                + "  <div style=\"text-align:center;margin:26px 0 14px;\">"
                + "    <a href=\"" + storefrontUrl + "/profile\" style=\"background:#00A3E0;color:#ffffff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;\">Track Live Delivery Milestones &rarr;</a>"
                + "  </div>"
                + "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0;\">"
                + "  <p style=\"color:#64748b;font-size:12.5px;line-height:1.6;margin:0;\">We truly value your patience, understanding, and trust in Forge India Connect (Atomy India). If you have any questions or require urgent help, please reply directly to this email or contact customer care at <a href=\"mailto:daggerking7828@gmail.com\" style=\"color:#00A3E0;\">daggerking7828@gmail.com</a>.</p>"
                + "</div>"
                + "</div>";

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

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#00A3E0;padding:26px 20px;text-align:center;border-radius:8px 8px 0 0;\">"
                + "  <h1 style=\"color:#ffffff;margin:0;font-size:24px;letter-spacing:0.5px;\">Welcome to Atomy India!</h1>"
                + "  <p style=\"color:#e0f2fe;margin:6px 0 0;font-size:14px;\">Forge India Connect (FIC) E-Commerce Platform</p>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <h2 style=\"color:#0f172a;font-size:19px;margin-top:0;\">Hello " + escapeHtml(name) + ",</h2>"
                + "  <p style=\"color:#475569;font-size:14.5px;line-height:1.6;\">Thank you for joining <strong>Atomy India</strong>! We are thrilled to welcome you to our community dedicated to <em>Absolute Quality at Absolute Price</em>.</p>"
                + "  <div style=\"background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #00A3E0;border-radius:6px;padding:16px 20px;margin:22px 0;\">"
                + "    <h4 style=\"margin:0 0 10px;color:#0369a1;font-size:14px;\">What You Can Expect:</h4>"
                + "    <ul style=\"margin:0;padding-left:18px;color:#334155;font-size:13.5px;line-height:1.8;\">"
                + "      <li><strong>100% Genuine Korean Imports:</strong> Premium healthcare (HemoHIM), skincare, and home essentials.</li>"
                + "      <li><strong>Fast Doorstep Delivery:</strong> Live milestone tracking across India via Blue Dart Express.</li>"
                + "      <li><strong>Wholesale Distributor Club:</strong> Optional membership enrollment for DP pricing & PV point rewards.</li>"
                + "    </ul>"
                + "  </div>"
                + "  <div style=\"text-align:center;margin:28px 0 16px;\">"
                + "    <a href=\"" + storefrontUrl + "\" style=\"background:#00A3E0;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;\">Start Exploring Atomy Products &rarr;</a>"
                + "  </div>"
                + "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0;\">"
                + "  <p style=\"color:#94a3b8;font-size:12px;margin:0;text-align:center;\">If you have any questions, feel free to reach out to us at <a href=\"mailto:daggerking7828@gmail.com\" style=\"color:#00A3E0;\">daggerking7828@gmail.com</a>.</p>"
                + "</div>"
                + "<div style=\"text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;\">"
                + "  &copy; 2026 Forge India Connect Pvt Ltd (FIC) &bull; Atomy India Direct-Selling Partner"
                + "</div>"
                + "</div>";

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

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#00A3E0;padding:26px 20px;text-align:center;border-radius:8px 8px 0 0;\">"
                + "  <h1 style=\"color:#ffffff;margin:0;font-size:23px;letter-spacing:0.5px;\">&#127881; Distributor Membership Activated!</h1>"
                + "  <p style=\"color:#e0f2fe;margin:6px 0 0;font-size:14px;\">Atomy India &bull; Forge India Connect</p>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <h2 style=\"color:#0f172a;font-size:19px;margin-top:0;\">Congratulations " + escapeHtml(name) + "!</h2>"
                + "  <p style=\"color:#475569;font-size:14.5px;line-height:1.6;\">Your <strong>" + escapeHtml(planName) + "</strong> is now officially active. You have unlocked full wholesale distributor access across the entire Atomy catalog.</p>"
                + "  <div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin:22px 0;\">"
                + "    <h4 style=\"margin:0 0 12px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;\">Membership Plan Details</h4>"
                + "    <div style=\"font-size:13px;color:#334155;line-height:1.9;\">"
                + "      <div><strong>Membership ID:</strong> <span style=\"font-family:monospace;font-weight:bold;color:#00A3E0;\">" + escapeHtml(membership.getId()) + "</span></div>"
                + "      <div><strong>Selected Plan:</strong> " + escapeHtml(planName) + "</div>"
                + "      <div><strong>Amount Paid:</strong> &#8377;" + membership.getAmountPaid() + " (" + escapeHtml(membership.getPaymentMethod()) + ")</div>"
                + "      <div><strong>Valid Until:</strong> <span style=\"color:#059669;font-weight:bold;\">" + escapeHtml(expiryFormatted) + "</span></div>"
                + "    </div>"
                + "  </div>"
                + "  <div style=\"background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:6px;padding:14px 18px;margin:20px 0;\">"
                + "    <h4 style=\"margin:0 0 6px;color:#15803d;font-size:13.5px;\">Your Active Member Benefits:</h4>"
                + "    <ul style=\"margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.8;\">"
                + "      <li>Instant wholesale <strong>Distributor Price (DP)</strong> discounts on every order.</li>"
                + "      <li><strong>100% Personal PV Point Accumulation</strong> to build mastership credentials.</li>"
                + "      <li>Priority order processing & VIP customer assistance.</li>"
                + "    </ul>"
                + "  </div>"
                + "  <div style=\"text-align:center;margin:28px 0 16px;\">"
                + "    <a href=\"" + storefrontUrl + "/membership\" style=\"background:#00A3E0;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;\">View Your Member Dashboard &rarr;</a>"
                + "  </div>"
                + "</div>"
                + "<div style=\"text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;\">"
                + "  &copy; 2026 Forge India Connect Pvt Ltd (FIC) &bull; Atomy India Direct-Selling Partner"
                + "</div>"
                + "</div>";

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

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:10px;\">"
                + "<div style=\"background:#e11d48;padding:24px 20px;text-align:center;border-radius:8px 8px 0 0;\">"
                + "  <h1 style=\"color:#ffffff;margin:0;font-size:22px;letter-spacing:0.5px;\">&#9888; Membership Plan Expired</h1>"
                + "  <p style=\"color:#ffe4e6;margin:6px 0 0;font-size:13.5px;\">Action Required &bull; Atomy India</p>"
                + "</div>"
                + "<div style=\"background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;\">"
                + "  <h2 style=\"color:#0f172a;font-size:19px;margin-top:0;\">Dear " + escapeHtml(name) + ",</h2>"
                + "  <p style=\"color:#475569;font-size:14.5px;line-height:1.6;\">Your Atomy Distributor Membership (ID: <strong>" + escapeHtml(membership.getId()) + "</strong>) expired on <strong>" + escapeHtml(expiryFormatted) + "</strong>.</p>"
                + "  <div style=\"background:#fff1f2;border:1px solid #fecdd3;border-left:4px solid #e11d48;border-radius:6px;padding:16px 20px;margin:22px 0;\">"
                + "    <h4 style=\"margin:0 0 8px;color:#9f1239;font-size:14px;\">Impact on Your Account:</h4>"
                + "    <ul style=\"margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.8;\">"
                + "      <li>Product pricing has reverted from wholesale Distributor Price (DP) to standard MRP retail.</li>"
                + "      <li>Personal PV accumulation on new orders is currently paused.</li>"
                + "    </ul>"
                + "  </div>"
                + "  <p style=\"color:#475569;font-size:14px;line-height:1.6;\">Don't worry! Your accumulated historical PV points and member profile are safely preserved. Renewing your plan immediately reactivates wholesale DP pricing on all future orders.</p>"
                + "  <div style=\"text-align:center;margin:28px 0 16px;\">"
                + "    <a href=\"" + storefrontUrl + "/membership\" style=\"background:#00A3E0;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;\">Renew Your Distributor Membership &rarr;</a>"
                + "  </div>"
                + "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0;\">"
                + "  <p style=\"color:#94a3b8;font-size:12px;margin:0;text-align:center;\">Need help with renewal? Reply directly or contact <a href=\"mailto:daggerking7828@gmail.com\" style=\"color:#00A3E0;\">daggerking7828@gmail.com</a>.</p>"
                + "</div>"
                + "<div style=\"text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;\">"
                + "  &copy; 2026 Forge India Connect Pvt Ltd (FIC) &bull; Atomy India Direct-Selling Partner"
                + "</div>"
                + "</div>";

        sendEmailAsync(membership.getCustomerEmail(), name, subject, html);
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
