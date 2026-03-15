package com.clockin.controller;

import com.clockin.dto.ClockResponse;
import com.clockin.security.CustomUserDetails;
import com.clockin.service.ClockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clock")
@RequiredArgsConstructor
public class ClockController {

    private final ClockService clockService;

    @PostMapping("/in")
    public ResponseEntity<ClockResponse> clockIn(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(clockService.clockIn(userDetails.getEmployee()));
    }

    @PostMapping("/out")
    public ResponseEntity<ClockResponse> clockOut(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(clockService.clockOut(userDetails.getEmployee()));
    }

    @GetMapping("/status")
    public ResponseEntity<ClockResponse> getStatus(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(clockService.getStatus(userDetails.getEmployee()));
    }
}
