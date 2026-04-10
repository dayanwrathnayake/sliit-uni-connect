package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDTO {
    private String id;
    private String studentId;
    private String studentName;
    private String clubId;
    private String clubName;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private List<OrderItemDTO> items;
    private String paymentSlipUrl;
    private LocalDateTime createdAt;

    public OrderResponseDTO() {}

    public static OrderResponseDTOBuilder builder() {
        return new OrderResponseDTOBuilder();
    }

    public static class OrderResponseDTOBuilder {
        private String id;
        private String studentId;
        private String studentName;
        private String clubId;
        private String clubName;
        private BigDecimal totalAmount;
        private OrderStatus status;
        private List<OrderItemDTO> items;
        private String paymentSlipUrl;
        private LocalDateTime createdAt;

        public OrderResponseDTOBuilder id(String id) { this.id = id; return this; }
        public OrderResponseDTOBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public OrderResponseDTOBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public OrderResponseDTOBuilder clubId(String clubId) { this.clubId = clubId; return this; }
        public OrderResponseDTOBuilder clubName(String clubName) { this.clubName = clubName; return this; }
        public OrderResponseDTOBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderResponseDTOBuilder status(OrderStatus status) { this.status = status; return this; }
        public OrderResponseDTOBuilder items(List<OrderItemDTO> items) { this.items = items; return this; }
        public OrderResponseDTOBuilder paymentSlipUrl(String paymentSlipUrl) { this.paymentSlipUrl = paymentSlipUrl; return this; }
        public OrderResponseDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public OrderResponseDTO build() {
            OrderResponseDTO d = new OrderResponseDTO();
            d.setId(id);
            d.setStudentId(studentId);
            d.setStudentName(studentName);
            d.setClubId(clubId);
            d.setClubName(clubName);
            d.setTotalAmount(totalAmount);
            d.setStatus(status);
            d.setItems(items);
            d.setPaymentSlipUrl(paymentSlipUrl);
            d.setCreatedAt(createdAt);
            return d;
        }
    }

    public static class OrderItemDTO {
        private String productId;
        private String productName;
        private int quantity;
        private BigDecimal price;

        public OrderItemDTO() {}
        public static OrderItemDTOBuilder builder() { return new OrderItemDTOBuilder(); }

        public static class OrderItemDTOBuilder {
            private String productId;
            private String productName;
            private int quantity;
            private BigDecimal price;
            public OrderItemDTOBuilder productId(String productId) { this.productId = productId; return this; }
            public OrderItemDTOBuilder productName(String productName) { this.productName = productName; return this; }
            public OrderItemDTOBuilder quantity(int quantity) { this.quantity = quantity; return this; }
            public OrderItemDTOBuilder price(BigDecimal price) { this.price = price; return this; }
            public OrderItemDTO build() {
                OrderItemDTO d = new OrderItemDTO();
                d.setProductId(productId);
                d.setProductName(productName);
                d.setQuantity(quantity);
                d.setPrice(price);
                return d;
            }
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getClubId() { return clubId; }
    public void setClubId(String clubId) { this.clubId = clubId; }
    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
    public String getPaymentSlipUrl() { return paymentSlipUrl; }
    public void setPaymentSlipUrl(String paymentSlipUrl) { this.paymentSlipUrl = paymentSlipUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
