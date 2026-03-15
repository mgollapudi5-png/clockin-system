package com.clockin.controller;

import com.clockin.dto.AttendanceDTO;
import com.clockin.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attendance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AttendanceController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getAttendance(
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        return ResponseEntity.ok(employeeService.getAttendance(fromDate, toDate));
    }
}
