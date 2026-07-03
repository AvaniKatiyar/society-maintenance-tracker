package com.society.tracker.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}. Error: {}. Logging HTML body instead:", to, e.getMessage());
            System.out.println("==================================================");
            System.out.println("SIMULATED EMAIL TO: " + to);
            System.out.println("SUBJECT: " + subject);
            System.out.println("CONTENT: ");
            System.out.println(htmlBody);
            System.out.println("==================================================");
        }
    }

    public void sendComplaintCreatedEmail(String to, String residentName, Long complaintId, String category, String description) {
        String subject = "Complaint Registered - #" + complaintId;
        String htmlBody = buildEmailTemplate(
                "Complaint Registered",
                "Hello " + residentName + ",",
                "Your complaint has been successfully registered on the Society Maintenance Tracker.",
                "<strong>Complaint ID:</strong> #" + complaintId + "<br/>" +
                "<strong>Category:</strong> " + category + "<br/>" +
                "<strong>Description:</strong> " + description + "<br/>" +
                "<strong>Status:</strong> OPEN",
                "Our administration team has been notified and will review your request shortly. You will receive updates as the status changes."
        );
        sendHtmlEmail(to, subject, htmlBody);
    }

    public void sendComplaintStatusUpdatedEmail(String to, String residentName, Long complaintId, String oldStatus, String newStatus, String adminNote) {
        String subject = "Complaint Update - #" + complaintId;
        String htmlBody = buildEmailTemplate(
                "Complaint Status Updated",
                "Hello " + residentName + ",",
                "The status of your complaint has been updated from <strong>" + oldStatus + "</strong> to <strong>" + newStatus + "</strong>.",
                "<strong>Complaint ID:</strong> #" + complaintId + "<br/>" +
                "<strong>Admin Update Note:</strong> " + adminNote,
                "You can log in to the portal to view the complete history timeline of your complaint."
        );
        sendHtmlEmail(to, subject, htmlBody);
    }

    public void sendComplaintResolvedEmail(String to, String residentName, Long complaintId, String adminNote) {
        String subject = "Complaint Resolved - #" + complaintId;
        String htmlBody = buildEmailTemplate(
                "Complaint Resolved",
                "Hello " + residentName + ",",
                "We are pleased to inform you that your complaint has been marked as <strong>RESOLVED</strong>.",
                "<strong>Complaint ID:</strong> #" + complaintId + "<br/>" +
                "<strong>Resolution Note:</strong> " + adminNote,
                "Thank you for your patience. No further actions are required. If you feel this was closed in error, please register a new complaint."
        );
        sendHtmlEmail(to, subject, htmlBody);
    }

    public void sendImportantNoticeEmail(String to, String residentName, String noticeTitle, String noticeDescription) {
        String subject = "IMPORTANT NOTICE: " + noticeTitle;
        String htmlBody = buildEmailTemplate(
                "Important Announcement",
                "Hello " + residentName + ",",
                "An important notice has been posted on the Society Notice Board.",
                "<strong>Title:</strong> " + noticeTitle + "<br/>" +
                "<strong>Announcement details:</strong><br/>" + noticeDescription,
                "Please log in to the Society Maintenance Tracker portal to see all active notices."
        );
        sendHtmlEmail(to, subject, htmlBody);
    }

    private String buildEmailTemplate(String heading, String greeting, String bodyIntro, String detailsHtml, String footerNote) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e1e8ed; }" +
                "  .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 30px; text-align: center; color: #ffffff; }" +
                "  .header h1 { margin: 0; font-size: 24px; font-weight: 700; }" +
                "  .content { padding: 30px; color: #333333; line-height: 1.6; }" +
                "  .details { background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 20px; margin: 20px 0; border-radius: 4px; font-size: 15px; }" +
                "  .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }" +
                "  .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>" + heading + "</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <p style='font-size: 16px; font-weight: 600;'>" + greeting + "</p>" +
                "      <p>" + bodyIntro + "</p>" +
                "      <div class='details'>" +
                "        " + detailsHtml + "" +
                "      </div>" +
                "      <p>" + footerNote + "</p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      <p>This is an automated email from the Society Maintenance Tracker.</p>" +
                "      <p>&copy; 2026 Society Administration. All rights reserved.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
