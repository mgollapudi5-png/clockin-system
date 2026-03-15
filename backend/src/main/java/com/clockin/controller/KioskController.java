package com.clockin.controller;

import com.clockin.dto.ClockResponse;
import com.clockin.dto.KioskClockRequest;
import com.clockin.entity.Employee;
import com.clockin.entity.Store;
import com.clockin.repository.EmployeeRepository;
import com.clockin.service.ClockService;
import com.clockin.service.StoreAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/kiosk")
@RequiredArgsConstructor
public class KioskController {

    private final StoreAuthService storeAuthService;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClockService clockService;

    @PostMapping("/clock")
    public ResponseEntity<?> clock(
            @RequestHeader(value = "X-Kiosk-Token", required = false) String kioskToken,
            @RequestBody KioskClockRequest request) {

        // 1. Validate kiosk session and get store
        if (kioskToken == null || !storeAuthService.verifyKioskSession(kioskToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Kiosk session not authorized. Please contact your admin."));
        }

        Store store = storeAuthService.getStoreFromKioskToken(kioskToken);
        if (store == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Kiosk session not authorized."));
        }

        // 2. Validate employee credentials (store-scoped)
        Employee employee = employeeRepository.findByEmployeeIdAndStore(request.getEmployeeId(), store)
                .orElse(null);

        if (employee == null || !passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid employee ID or password"));
        }

        // 3. Clock in or out
        try {
            ClockResponse response;
            if ("IN".equalsIgnoreCase(request.getAction())) {
                response = clockService.clockIn(employee);
            } else if ("OUT".equalsIgnoreCase(request.getAction())) {
                response = clockService.clockOut(employee);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid action. Use IN or OUT."));
            }
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(
            @RequestHeader(value = "X-Kiosk-Token", required = false) String kioskToken,
            @RequestParam String employeeId,
            @RequestParam String password) {

        if (kioskToken == null || !storeAuthService.verifyKioskSession(kioskToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Kiosk session not authorized."));
        }

        Store store = storeAuthService.getStoreFromKioskToken(kioskToken);
        if (store == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Kiosk session not authorized."));
        }

        Employee employee = employeeRepository.findByEmployeeIdAndStore(employeeId, store).orElse(null);
        if (employee == null || !passwordEncoder.matches(password, employee.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid employee ID or password"));
        }

        return ResponseEntity.ok(clockService.getStatus(employee));
    }
}
