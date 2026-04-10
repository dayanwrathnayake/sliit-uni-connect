package com.sliit.uniconnect.service;

import com.sliit.uniconnect.dto.*;
import com.sliit.uniconnect.exception.ResourceNotFoundException;
import com.sliit.uniconnect.model.*;
import com.sliit.uniconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShopService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ShopService(ProductRepository productRepository, 
                       OrderRepository orderRepository, 
                       ClubRepository clubRepository, 
                       UserRepository userRepository,
                       EmailService emailService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // ── Product Management ───────────────────────────────────────────────────

    public ProductResponseDTO createProduct(String adminId, ProductCreateDTO dto) {
        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stockQuantity(dto.getStockQuantity())
                .category(dto.getCategory())
                .clubId(dto.getClubId())
                .imageUrl(dto.getImageUrl())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        Product saved = productRepository.save(product);
        return mapToProductResponse(saved);
    }

    public ProductResponseDTO updateProduct(String productId, ProductCreateDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setCategory(dto.getCategory());
        product.setImageUrl(dto.getImageUrl());
        product.setUpdatedAt(LocalDateTime.now());
        
        return mapToProductResponse(productRepository.save(product));
    }

    public void deleteProduct(String productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(productId);
    }

    public List<ProductResponseDTO> getClubProducts(String clubId) {
        return productRepository.findByClubId(clubId).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> getAllActiveProducts(ProductCategory category, String clubId, String eventTag) {
        // Implement soft filtering logic based on parameters provided
        // Since we don't have eventTag or complex criteria out of the box in the repository,
        // we can filter the active stream to accommodate flexible UI requirements.
        List<Product> products = productRepository.findByActive(true);
        
        return products.stream()
                .filter(p -> category == null || p.getCategory() == category)
                .filter(p -> clubId == null || clubId.equals(p.getClubId()))
                // (eventTag filtering goes here if event tags get added to product model)
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public ProductResponseDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return mapToProductResponse(product);
    }

    // ── Order Management ─────────────────────────────────────────────────────

    @Transactional
    public OrderResponseDTO placeOrder(String studentId, OrderRequestDTO dto) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<OrderItem> orderItems = dto.getItems().stream().map(itemDto -> {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

            if (product.getStockQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
            productRepository.save(product);

            return OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemDto.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();
        }).collect(Collectors.toList());

        BigDecimal total = orderItems.stream()
                .map(item -> item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .studentId(studentId)
                .studentName(student.getDisplayName())
                .clubId(dto.getClubId())
                .telephoneNumber(dto.getTelephoneNumber())
                .items(orderItems)
                .totalAmount(total)
                .paymentSlipUrl(dto.getPaymentSlipUrl())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Order saved = orderRepository.save(order);
        
        // Dispatch Order Confirmation Email asynchronously
        emailService.sendOrderConfirmationEmail(student, saved);
        
        return mapToOrderResponse(saved);
    }

    public List<OrderResponseDTO> getStudentOrders(String studentId) {
        return orderRepository.findByStudentId(studentId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getClubOrders(String clubId) {
        return orderRepository.findByClubId(clubId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO updateOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        return mapToOrderResponse(orderRepository.save(order));
    }

    public ShopStatsDTO getShopStats(String clubId) {
        List<Order> orders = orderRepository.findByClubId(clubId);
        
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COLLECTED || o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long pending = orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long completed = orders.stream().filter(o -> o.getStatus() == OrderStatus.COLLECTED || o.getStatus() == OrderStatus.COMPLETED).count();
        
        // Calculate top products
        List<ShopStatsDTO.TopProductDTO> topProducts = List.of();
        if (completed > 0) {
            topProducts = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COLLECTED || o.getStatus() == OrderStatus.COMPLETED)
                .filter(o -> o.getItems() != null)
                .flatMap(o -> o.getItems().stream())
                .collect(Collectors.groupingBy(
                    OrderItem::getProductName,
                    Collectors.summingInt(OrderItem::getQuantity)
                ))
                .entrySet().stream()
                .map(entry -> ShopStatsDTO.TopProductDTO.builder()
                        .productName(entry.getKey())
                        .totalSold(entry.getValue())
                        .revenue(BigDecimal.ZERO)
                        .build())
                .sorted((a, b) -> Integer.compare(b.getTotalSold(), a.getTotalSold()))
                .limit(5)
                .collect(Collectors.toList());
        }
        
        return ShopStatsDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(orders.size())
                .pendingOrders(pending)
                .completedOrders(completed)
                .topProducts(topProducts)
                .build();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private ProductResponseDTO mapToProductResponse(Product p) {
        String clubName = clubRepository.findById(p.getClubId())
                .map(Club::getName).orElse("Unknown Club");

        return ProductResponseDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stockQuantity(p.getStockQuantity())
                .category(p.getCategory())
                .clubId(p.getClubId())
                .clubName(clubName)
                .imageUrl(p.getImageUrl())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private OrderResponseDTO mapToOrderResponse(Order o) {
        String clubName = clubRepository.findById(o.getClubId())
                .map(Club::getName).orElse("Unknown Club");

        return OrderResponseDTO.builder()
                .id(o.getId())
                .studentId(o.getStudentId())
                .studentName(o.getStudentName())
                .clubId(o.getClubId())
                .clubName(clubName)
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .paymentSlipUrl(o.getPaymentSlipUrl())
                .createdAt(o.getCreatedAt())
                .items(o.getItems() == null ? List.of() : o.getItems().stream().map(i -> OrderResponseDTO.OrderItemDTO.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .price(i.getPriceAtPurchase())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
