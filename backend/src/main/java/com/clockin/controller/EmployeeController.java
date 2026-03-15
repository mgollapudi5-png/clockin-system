package com.clockin.controller;

import com.clockin.dto.CreateEmployeeRequest;
import com.clockin.dto.DashboardDTO;
import com.clockin.dto.EmployeeDTO;
import com.clockin.dto.RoleUpdateRequest;
import com.clockin.dto.UpdateEmployeeRequest;
import com.clockin.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(employeeService.getDashboard());
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PostMapping("/employees")
    public ResponseEntity<?> createEmployee(@RequestBody CreateEmployeeRequest req) {
        try {
            return ResponseEntity.ok(employeeService.createEmployee(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody UpdateEmployeeRequest req) {
        try {
            return ResponseEntity.ok(employeeService.updateEmployee(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(Map.of("message", "Employee deleted"));
    }

    @PutMapping("/employees/{id}/role")
    public ResponseEntity<EmployeeDTO> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(employeeService.updateRole(id, request.getRole()));
    }
}
