package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.OrderRequestDTO;
import com.sliit.uniconnect.dto.OrderResponseDTO;
import com.sliit.uniconnect.dto.ProductResponseDTO;
import com.sliit.uniconnect.model.ProductCategory;
import com.sliit.uniconnect.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts(
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) String clubId,
            @RequestParam(required = false) String eventTag) {
        return ResponseEntity.ok(shopService.getAllActiveProducts(category, clubId, eventTag));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(shopService.getProductById(id));
    }

    @PostMapping("/orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponseDTO> placeOrder(
            Authentication authentication,
            @RequestBody OrderRequestDTO dto) {
        return ResponseEntity.ok(shopService.placeOrder(authentication.getName(), dto));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(shopService.getStudentOrders(authentication.getName()));
    }
}
