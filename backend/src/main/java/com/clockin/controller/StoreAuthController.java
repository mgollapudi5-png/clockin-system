package com.clockin.controller;

import com.clockin.dto.StoreLoginRequest;
import com.clockin.dto.StoreLoginResponse;
import com.clockin.service.StoreAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
public class StoreAuthController {

    private final StoreAuthService storeAuthService;

    @PostMapping("/login")
    public ResponseEntity<StoreLoginResponse> login(@RequestBody StoreLoginRequest request) {
        StoreLoginResponse response = storeAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/kiosk/verify")
    public ResponseEntity<Map<String, Boolean>> verifyKiosk(
            @RequestHeader(value = "X-Kiosk-Token", required = false) String kioskToken) {
        if (kioskToken == null || kioskToken.isBlank()) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
        boolean valid = storeAuthService.verifyKioskSession(kioskToken);
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
