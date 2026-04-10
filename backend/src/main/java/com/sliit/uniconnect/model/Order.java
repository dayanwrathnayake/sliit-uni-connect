package com.sliit.uniconnect.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String clubId;
    private String telephoneNumber;
    private BigDecimal totalAmount;
    private OrderStatus status = OrderStatus.PENDING;
    private List<OrderItem> items;
    private String paymentSlipUrl;

    @CreatedDate
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Order() {}

    public static OrderBuilder builder() {
        return new OrderBuilder();
    }

    public static class OrderBuilder {
        private String studentId;
        private String studentName;
        private String clubId;
        private String telephoneNumber;
        private BigDecimal totalAmount;
        private OrderStatus status = OrderStatus.PENDING;
        private List<OrderItem> items;
        private String paymentSlipUrl;
        private LocalDateTime createdAt;

        public OrderBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public OrderBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public OrderBuilder clubId(String clubId) { this.clubId = clubId; return this; }
        public OrderBuilder telephoneNumber(String telephoneNumber) { this.telephoneNumber = telephoneNumber; return this; }
        public OrderBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderBuilder status(OrderStatus status) { this.status = status; return this; }
        public OrderBuilder items(List<OrderItem> items) { this.items = items; return this; }
        public OrderBuilder paymentSlipUrl(String paymentSlipUrl) { this.paymentSlipUrl = paymentSlipUrl; return this; }
        public OrderBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Order build() {
            Order o = new Order();
            o.setStudentId(studentId);
            o.setStudentName(studentName);
            o.setClubId(clubId);
            o.setTelephoneNumber(telephoneNumber);
            o.setTotalAmount(totalAmount);
            o.setStatus(status);
            o.setItems(items);
            o.setPaymentSlipUrl(paymentSlipUrl);
            o.setCreatedAt(createdAt);
            return o;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getTelephoneNumber() { return telephoneNumber; }
    public void setTelephoneNumber(String telephoneNumber) { this.telephoneNumber = telephoneNumber; }
    public String getClubId() { return clubId; }
    public void setClubId(String clubId) { this.clubId = clubId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getPaymentSlipUrl() { return paymentSlipUrl; }
    public void setPaymentSlipUrl(String paymentSlipUrl) { this.paymentSlipUrl = paymentSlipUrl; }
}
