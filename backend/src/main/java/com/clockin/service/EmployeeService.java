package com.clockin.service;

import com.clockin.dto.AttendanceDTO;
import com.clockin.dto.CreateEmployeeRequest;
import com.clockin.dto.EmployeeDTO;
import com.clockin.dto.UpdateEmployeeRequest;
import com.clockin.entity.ClockLog;
import com.clockin.entity.Employee;
import com.clockin.entity.Role;
import com.clockin.repository.ClockLogRepository;
import com.clockin.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ClockLogRepository clockLogRepository;
    private final PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(e -> new EmployeeDTO(e.getId(), e.getEmployeeId(), e.getEmployeeName(), e.getRole().name()))
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeDTO createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.findByEmployeeIdOrEmployeeName(request.getEmployeeId(), request.getEmployeeId()).isPresent()) {
            throw new IllegalStateException("Employee ID already exists: " + request.getEmployeeId());
        }
        Employee employee = new Employee();
        employee.setEmployeeId(request.getEmployeeId());
        employee.setEmployeeName(request.getEmployeeName());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        String roleStr = (request.getRole() != null && !request.getRole().isBlank()) ? request.getRole().toUpperCase() : "EMPLOYEE";
        employee.setRole(Role.valueOf(roleStr));
        employeeRepository.save(employee);
        return new EmployeeDTO(employee.getId(), employee.getEmployeeId(), employee.getEmployeeName(), employee.getRole().name());
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        if (request.getEmployeeName() != null && !request.getEmployeeName().isBlank()) {
            employee.setEmployeeName(request.getEmployeeName());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            employee.setRole(Role.valueOf(request.getRole().toUpperCase()));
        }
        employeeRepository.save(employee);
        return new EmployeeDTO(employee.getId(), employee.getEmployeeId(), employee.getEmployeeName(), employee.getRole().name());
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        clockLogRepository.deleteByEmployee(employee);
        employeeRepository.delete(employee);
    }

    @Transactional
    public EmployeeDTO updateRole(Long employeeDbId, String newRole) {
        Employee employee = employeeRepository.findById(employeeDbId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setRole(Role.valueOf(newRole.toUpperCase()));
        employeeRepository.save(employee);
        return new EmployeeDTO(employee.getId(), employee.getEmployeeId(), employee.getEmployeeName(), employee.getRole().name());
    }

    public List<AttendanceDTO> getAttendance(String fromDate, String toDate, String employeeId) {
        LocalDateTime from = LocalDate.parse(fromDate, DATE_FMT).atStartOfDay();
        LocalDateTime to = LocalDate.parse(toDate, DATE_FMT).atTime(23, 59, 59);

        List<ClockLog> logs = clockLogRepository.findByDateRange(from, to);
        return logs.stream()
                .filter(log -> employeeId == null || employeeId.isBlank() || log.getEmployee().getEmployeeId().equalsIgnoreCase(employeeId))
                .map(log -> new AttendanceDTO(
                        log.getEmployee().getEmployeeName(),
                        log.getEmployee().getEmployeeId(),
                        log.getClockInTime().format(DATE_FMT),
                        log.getClockInTime().format(TIME_FMT),
                        log.getClockOutTime() != null ? log.getClockOutTime().format(TIME_FMT) : "In Progress",
                        log.getTotalHours()
                )).collect(Collectors.toList());
    }
}
