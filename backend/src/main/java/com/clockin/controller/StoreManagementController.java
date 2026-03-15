package com.clockin.controller;

import com.clockin.dto.CreateStoreRequest;
import com.clockin.dto.StoreDTO;
import com.clockin.service.StoreAuthService;
import com.clockin.service.StoreManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/creator")
@RequiredArgsConstructor
public class StoreManagementController {

    private final StoreManagementService storeManagementService;
    private final StoreAuthService storeAuthService;

    private void requireCreator(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new SecurityException("Missing authorization token");
        }
        storeAuthService.extractCreatorStoreId(authHeader.substring(7));
    }

    @GetMapping("/stores")
    public ResponseEntity<List<StoreDTO>> getAllStores(
            @RequestHeader("Authorization") String authHeader) {
        requireCreator(authHeader);
        return ResponseEntity.ok(storeManagementService.getAllStores());
    }

    @PostMapping("/stores")
    public ResponseEntity<StoreDTO> createStore(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateStoreRequest request) {
        requireCreator(authHeader);
        return ResponseEntity.ok(storeManagementService.createStore(request));
    }

    @PostMapping("/stores/{id}/reset-sessions")
    public ResponseEntity<Map<String, String>> resetSessions(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        requireCreator(authHeader);
        storeManagementService.resetSessions(id);
        return ResponseEntity.ok(Map.of("message", "Sessions reset successfully"));
    }

    @PostMapping("/stores/{id}/device-limit")
    public ResponseEntity<StoreDTO> changeDeviceLimit(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        requireCreator(authHeader);
        return ResponseEntity.ok(storeManagementService.changeDeviceLimit(id, body.get("limit")));
    }

    @PostMapping("/stores/{id}/toggle-active")
    public ResponseEntity<StoreDTO> toggleActive(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        requireCreator(authHeader);
        return ResponseEntity.ok(storeManagementService.toggleActive(id));
    }

    @PostMapping("/stores/{id}/promote")
    public ResponseEntity<StoreDTO> promoteToCreator(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        requireCreator(authHeader);
        return ResponseEntity.ok(storeManagementService.promoteToCreator(id));
    }

    @PostMapping("/stores/{id}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        requireCreator(authHeader);
        storeManagementService.changePassword(id, body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password changed and sessions reset"));
    }
}
