package com.sliit.uniconnect.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ShopStatsDTO {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private List<TopProductDTO> topProducts;

    @Data
    @Builder
    public static class TopProductDTO {
        private String productName;
        private int totalSold;
        private BigDecimal revenue;
    }
}
