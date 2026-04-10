package com.sliit.uniconnect.model;

import java.math.BigDecimal;

public class OrderItem {
    private String productId;
    private String productName;
    private int quantity;
    private BigDecimal priceAtPurchase;

    public OrderItem() {}
    public OrderItem(String productId, String productName, int quantity, BigDecimal priceAtPurchase) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.priceAtPurchase = priceAtPurchase;
    }

    public static OrderItemBuilder builder() {
        return new OrderItemBuilder();
    }

    public static class OrderItemBuilder {
        private String productId;
        private String productName;
        private int quantity;
        private BigDecimal priceAtPurchase;

        public OrderItemBuilder productId(String productId) { this.productId = productId; return this; }
        public OrderItemBuilder productName(String productName) { this.productName = productName; return this; }
        public OrderItemBuilder quantity(int quantity) { this.quantity = quantity; return this; }
        public OrderItemBuilder priceAtPurchase(BigDecimal priceAtPurchase) { this.priceAtPurchase = priceAtPurchase; return this; }
        public OrderItem build() {
            return new OrderItem(productId, productName, quantity, priceAtPurchase);
        }
    }

    // Getters and Setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getPriceAtPurchase() { return priceAtPurchase; }
    public void setPriceAtPurchase(BigDecimal priceAtPurchase) { this.priceAtPurchase = priceAtPurchase; }
}
