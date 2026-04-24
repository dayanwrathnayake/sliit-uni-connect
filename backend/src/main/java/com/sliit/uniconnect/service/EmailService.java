package com.sliit.uniconnect.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;

  @Value("${app.base-url}")
  private String baseUrl;

  @Value("${spring.mail.username}")
  private String fromAddress;

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  /**
   * Sends an HTML verification email.
   * Marked @Async so registration never blocks on SMTP.
   * If sending fails, the exception is caught and logged — registration still
   * succeeds.
   */
  @Async
  public void sendVerificationEmail(String toEmail, String token) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromAddress);
      helper.setTo(toEmail);
      helper.setSubject("Verify your SLIIT UNI Connect account");

      String verifyUrl = baseUrl + "/verify-email?token=" + token;

      String html = """
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verify Your Email</title>
          </head>
          <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
              <tr>
                <td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                          SLIIT UNI Connect
                        </h1>
                        <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Your Campus Community Platform</p>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <h2 style="margin:0 0 12px;color:#f1f5f9;font-size:20px;font-weight:600;">
                          Welcome aboard! 🎉
                        </h2>
                        <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                          Thanks for joining SLIIT UNI Connect. Please verify your email address
                          to activate your account and start connecting with fellow students.
                        </p>
                        <div style="text-align:center;margin:32px 0;">
                          <a href="%s"
                             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                                    color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;
                                    font-size:15px;font-weight:600;letter-spacing:0.3px;">
                            ✉&nbsp; Verify My Email
                          </a>
                        </div>
                        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">
                          If the button doesn't work, copy and paste this link into your browser:<br/>
                          <a href="%s" style="color:#818cf8;word-break:break-all;">%s</a>
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="border-top:1px solid #334155;padding:20px 40px;text-align:center;">
                        <p style="margin:0;color:#475569;font-size:12px;">
                          This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
          """
          .formatted(verifyUrl, verifyUrl, verifyUrl);

      helper.setText(html, true);
      mailSender.send(message);
      log.info("Verification email sent to {}", toEmail);

    } catch (MessagingException ex) {
      // Do NOT re-throw — registration must succeed even if email fails
      log.warn("Failed to send verification email to {}: {}", toEmail, ex.getMessage());
    }
  }

  @Async
  public void sendOrderConfirmationEmail(com.sliit.uniconnect.model.User student,
      com.sliit.uniconnect.model.Order order) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromAddress);
      helper.setTo(student.getEmail());
      helper.setSubject("🎉 Order Placed Successfully – Pickup Ready | SLIIT UNI Connect");

      StringBuilder itemsHtml = new StringBuilder();
      for (com.sliit.uniconnect.model.OrderItem item : order.getItems()) {
        itemsHtml.append(String.format(
            "<tr><td style=\"padding:10px 0; border-bottom:1px solid #334155; color:#cbd5e1;\">%s <span style=\"color:#94a3b8;\">(x%d)</span></td>"
                + "<td style=\"padding:10px 0; border-bottom:1px solid #334155; color:#f1f5f9; text-align:right; font-weight:600;\">Rs. %s</td></tr>",
            item.getProductName(), item.getQuantity(),
            item.getPriceAtPurchase().multiply(java.math.BigDecimal.valueOf(item.getQuantity()))));
      }

      String orderId = order.getId().length() >= 6
          ? "#" + order.getId().substring(order.getId().length() - 6).toUpperCase()
          : "#" + order.getId().toUpperCase();

      String html = """
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
          <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
              <tr><td align="center">
                <table width="580" cellpadding="0" cellspacing="0"
                       style="background:#1e293b;border-radius:18px;overflow:hidden;border:1px solid #334155;">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                        SLIIT UNI Connect
                      </h1>
                      <p style="margin:6px 0 0;color:#e0e7ff;font-size:13px;">Your Campus Community Platform</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">

                      <!-- Greeting -->
                      <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;">Order Placed! 🎉</h2>
                      <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.7;">
                        Hi <strong style="color:#e2e8f0;">%s</strong>,<br/>
                        Thank you for your order. Your items are confirmed and will be <strong style="color:#a78bfa;">ready for pickup</strong> at the campus.
                        You will be notified once your order is ready.
                      </p>

                      <!-- Order ID Badge -->
                      <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:12px 20px;margin-bottom:28px;display:inline-block;">
                        <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Order Reference</span><br/>
                        <span style="color:#818cf8;font-size:20px;font-weight:700;">%s</span>
                      </div>

                      <!-- Items Table -->
                      <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <th style="text-align:left;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;border-bottom:2px solid #334155;">Item</th>
                          <th style="text-align:right;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;border-bottom:2px solid #334155;">Amount</th>
                        </tr>
                        %s
                        <tr>
                          <td style="padding-top:16px;color:#f1f5f9;font-weight:700;font-size:15px;">Total Amount</td>
                          <td style="padding-top:16px;color:#f59e0b;font-weight:700;font-size:15px;text-align:right;">Rs. %s</td>
                        </tr>
                      </table>

                      <!-- Pickup Info Box -->
                      <div style="background:#0f172a;border:1px solid #6366f1;border-left:4px solid #6366f1;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                        <p style="margin:0 0 6px;color:#a78bfa;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📍 Pickup Location</p>
                        <p style="margin:0;color:#e2e8f0;font-size:16px;font-weight:600;">Room A204, Main Building</p>
                        <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">
                          Please bring your Student ID when collecting your order.<br/>
                          Payment should be made at the time of collection.
                        </p>
                      </div>

                      <!-- Thank you -->
                      <p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.7;">
                        We truly appreciate your support of our student clubs and community. 💜<br/>
                        If you have any questions, feel free to reach out to the club directly.
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="border-top:1px solid #334155;padding:20px 40px;text-align:center;">
                      <p style="margin:0;color:#475569;font-size:12px;">
                        This is an automated message from SLIIT UNI Connect. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td></tr>
            </table>
          </body></html>
          """
          .formatted(
              student.getDisplayName(),
              orderId,
              itemsHtml.toString(),
              order.getTotalAmount());

      helper.setText(html, true);
      mailSender.send(message);
      log.info("Order confirmation email sent to {}", student.getEmail());

    } catch (MessagingException ex) {
      log.warn("Failed to send order confirmation email to {}: {}", student.getEmail(), ex.getMessage());
    }
  }
}
