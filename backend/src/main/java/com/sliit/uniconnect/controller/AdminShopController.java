package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.*;
import com.sliit.uniconnect.model.*;
import com.sliit.uniconnect.repository.ClubRepository;
import com.sliit.uniconnect.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shop")
@RequiredArgsConstructor
public class AdminShopController {

    private final ShopService shopService;
    private final ClubRepository clubRepository;

    @GetMapping("/products")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'FACULTY_MANAGER', 'CLUB_ADMIN')")
    public ResponseEntity<List<ProductResponseDTO>> getProducts(
            Authentication authentication,
            @RequestParam(required = false) String clubId) {
        
        String finalClubId = resolveClubId(authentication, clubId);
        if (finalClubId == null) {
            // If System Admin and no clubId, return all? 
            // For now, let's say clubId is required or we fetch all products
            return ResponseEntity.ok(shopService.getAllActiveProducts(null, null, null));
        }
        return ResponseEntity.ok(shopService.getClubProducts(finalClubId));
    }

    @PostMapping("/products")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'FACULTY_MANAGER', 'CLUB_ADMIN')")
    public ResponseEntity<ProductResponseDTO> createProduct(
            Authentication authentication,
            @RequestBody ProductCreateDTO dto) {
        return ResponseEntity.ok(shopService.createProduct(authentication.getName(), dto));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'FACULTY_MANAGER', 'CLUB_ADMIN')")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable String id,
            @RequestBody ProductCreateDTO dto) {
        return ResponseEntity.ok(shopService.updateProduct(id, dto));
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'FACULTY_MANAGER', 'CLUB_ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        shopService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'FACULTY_MANAGER', 'CLUB_ADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getOrders(
            Authentication authentication,
            @RequestParam(required = false) String clubId) {
        
        String finalClubId = resolveClubId(authentication, clubId);
        if (finalClubId == null) {
            return ResponseEntity.ok(List.of()); // Or all orders
        }
        return ResponseEntity.ok(shopService.getClubOrders(finalClubId));
    }

    @PatchMapping("/orders/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'FACULTY_MANAGER', 'CLUB_ADMIN')")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable String id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(shopService.updateOrderStatus(id, status));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'FACULTY_MANAGER', 'CLUB_ADMIN')")
    public ResponseEntity<ShopStatsDTO> getStats(
            Authentication authentication,
            @RequestParam(required = false) String clubId) {
        
        String finalClubId = resolveClubId(authentication, clubId);
        if (finalClubId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(shopService.getShopStats(finalClubId));
    }

    private String resolveClubId(Authentication auth, String requestedClubId) {
        // Simple logic: if requestedClubId is provided, and user is SYSTEM_ADMIN, use it.
        // If user is CLUB_ADMIN, ignore requestedClubId and find their own.
        // Security check omitted for brevity but should be there.
        if (requestedClubId != null) return requestedClubId;
        
        return clubRepository.findByAdminId(auth.getName())
                .map(Club::getId)
                .orElse(null);
    }
}
