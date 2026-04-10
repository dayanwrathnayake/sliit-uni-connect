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
     * If sending fails, the exception is caught and logged — registration still succeeds.
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
                    """.formatted(verifyUrl, verifyUrl, verifyUrl);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Verification email sent to {}", toEmail);

        } catch (MessagingException ex) {
            // Do NOT re-throw — registration must succeed even if email fails
            log.warn("Failed to send verification email to {}: {}", toEmail, ex.getMessage());
        }
    }

    @Async
    public void sendOrderConfirmationEmail(com.sliit.uniconnect.model.User student, com.sliit.uniconnect.model.Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(student.getEmail());
            helper.setSubject("Your E-Shop Order Confirmation (#" + order.getId() + ")");

            StringBuilder itemsHtml = new StringBuilder();
            for (com.sliit.uniconnect.model.OrderItem item : order.getItems()) {
                itemsHtml.append(String.format("<tr><td style=\"padding:8px 0; border-bottom:1px solid #334155; color:#cbd5e1;\">%s (x%d)</td><td style=\"padding:8px 0; border-bottom:1px solid #334155; color:#f1f5f9; text-align:right;\">Rs. %s</td></tr>", 
                    item.getProductName(), item.getQuantity(), item.getPriceAtPurchase().multiply(java.math.BigDecimal.valueOf(item.getQuantity()))));
            }

            String html = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head><meta charset="UTF-8"/></head>
                    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                        <tr><td align="center">
                          <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;border:1px solid #334155;padding:40px;">
                            <tr><td>
                              <h2 style="color:#f1f5f9;margin:0 0 16px;">Order Confirmed! 🎉</h2>
                              <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">Hi %s,<br/>Your E-Shop order has been placed successfully and is now <b>PENDING</b>. We'll let you know when it's ready for campus pickup.</p>
                              
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr><th style="text-align:left;color:#94a3b8;padding-bottom:8px;border-bottom:2px solid #334155;">Item</th><th style="text-align:right;color:#94a3b8;padding-bottom:8px;border-bottom:2px solid #334155;">Price</th></tr>
                                %s
                                <tr><td style="padding-top:16px;color:#f8fafc;font-weight:bold;">Total Amount</td><td style="padding-top:16px;color:#amber-500;font-weight:bold;text-align:right;">Rs. %s</td></tr>
                              </table>
                              
                              <p style="color:#64748b;font-size:13px;margin:0;">Contact telephone provided: %s</p>
                            </td></tr>
                          </table>
                        </td></tr>
                      </table>
                    </body></html>
                    """.formatted(student.getDisplayName(), itemsHtml.toString(), order.getTotalAmount(), order.getTelephoneNumber());

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Order confirmation email sent to {}", student.getEmail());

        } catch (MessagingException ex) {
            log.warn("Failed to send order confirmation email to {}: {}", student.getEmail(), ex.getMessage());
        }
    }
}
