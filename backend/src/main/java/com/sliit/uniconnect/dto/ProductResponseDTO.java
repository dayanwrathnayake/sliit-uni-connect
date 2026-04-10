package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.ProductCategory;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponseDTO {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private ProductCategory category;
    private String clubId;
    private String clubName;
    private String imageUrl;
    private boolean active;
    private LocalDateTime createdAt;

    public ProductResponseDTO() {}

    public static ProductResponseDTOBuilder builder() {
        return new ProductResponseDTOBuilder();
    }

    public static class ProductResponseDTOBuilder {
        private String id;
        private String name;
        private String description;
        private BigDecimal price;
        private int stockQuantity;
        private ProductCategory category;
        private String clubId;
        private String clubName;
        private String imageUrl;
        private boolean active;
        private LocalDateTime createdAt;

        public ProductResponseDTOBuilder id(String id) { this.id = id; return this; }
        public ProductResponseDTOBuilder name(String name) { this.name = name; return this; }
        public ProductResponseDTOBuilder description(String description) { this.description = description; return this; }
        public ProductResponseDTOBuilder price(BigDecimal price) { this.price = price; return this; }
        public ProductResponseDTOBuilder stockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; return this; }
        public ProductResponseDTOBuilder category(ProductCategory category) { this.category = category; return this; }
        public ProductResponseDTOBuilder clubId(String clubId) { this.clubId = clubId; return this; }
        public ProductResponseDTOBuilder clubName(String clubName) { this.clubName = clubName; return this; }
        public ProductResponseDTOBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ProductResponseDTOBuilder active(boolean active) { this.active = active; return this; }
        public ProductResponseDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProductResponseDTO build() {
            ProductResponseDTO d = new ProductResponseDTO();
            d.setId(id);
            d.setName(name);
            d.setDescription(description);
            d.setPrice(price);
            d.setStockQuantity(stockQuantity);
            d.setCategory(category);
            d.setClubId(clubId);
            d.setClubName(clubName);
            d.setImageUrl(imageUrl);
            d.setActive(active);
            d.setCreatedAt(createdAt);
            return d;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public ProductCategory getCategory() { return category; }
    public void setCategory(ProductCategory category) { this.category = category; }
    public String getClubId() { return clubId; }
    public void setClubId(String clubId) { this.clubId = clubId; }
    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
