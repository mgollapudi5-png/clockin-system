package com.clockin.service;

import com.clockin.dto.AttendanceDTO;
import com.clockin.dto.CreateEmployeeRequest;
import com.clockin.dto.DashboardDTO;
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
    public EmployeeDTO updateRole(Long employeeDbId, String newRole) {
        Employee employee = employeeRepository.findById(employeeDbId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setRole(Role.valueOf(newRole.toUpperCase()));
        employeeRepository.save(employee);
        return new EmployeeDTO(employee.getId(), employee.getEmployeeId(), employee.getEmployeeName(), employee.getRole().name());
    }

    @Transactional
    public EmployeeDTO createEmployee(CreateEmployeeRequest req) {
        if (employeeRepository.existsByEmployeeId(req.getEmployeeId())) {
            throw new RuntimeException("Employee ID already exists");
        }
        Employee emp = new Employee();
        emp.setEmployeeId(req.getEmployeeId());
        emp.setEmployeeName(req.getEmployeeName());
        emp.setPassword(passwordEncoder.encode(req.getPassword()));
        emp.setRole(Role.EMPLOYEE);
        employeeRepository.save(emp);
        return new EmployeeDTO(emp.getId(), emp.getEmployeeId(), emp.getEmployeeName(), emp.getRole().name());
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, UpdateEmployeeRequest req) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        if (req.getEmployeeName() != null && !req.getEmployeeName().isBlank()) {
            emp.setEmployeeName(req.getEmployeeName());
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            emp.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        employeeRepository.save(emp);
        return new EmployeeDTO(emp.getId(), emp.getEmployeeId(), emp.getEmployeeName(), emp.getRole().name());
    }

    @Transactional
    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    public DashboardDTO getDashboard() {
        int total = (int) employeeRepository.count();
        List<ClockLog> clockedIn = clockLogRepository.findAllClockedIn();
        List<String> names = clockedIn.stream()
                .map(c -> c.getEmployee().getEmployeeName())
                .collect(Collectors.toList());

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        List<ClockLog> todayLogs = clockLogRepository.findByDateRange(startOfDay, endOfDay);
        List<AttendanceDTO> todayActivity = todayLogs.stream().map(log -> new AttendanceDTO(
                log.getEmployee().getEmployeeName(),
                log.getEmployee().getEmployeeId(),
                log.getClockInTime().format(DATE_FMT),
                log.getClockInTime().format(TIME_FMT),
                log.getClockOutTime() != null ? log.getClockOutTime().format(TIME_FMT) : "In Progress",
                log.getTotalHours()
        )).collect(Collectors.toList());

        return new DashboardDTO(total, clockedIn.size(), names, todayActivity);
    }

    public List<AttendanceDTO> getAttendance(String fromDate, String toDate) {
        LocalDateTime from = LocalDate.parse(fromDate, DATE_FMT).atStartOfDay();
        LocalDateTime to = LocalDate.parse(toDate, DATE_FMT).atTime(23, 59, 59);

        List<ClockLog> logs = clockLogRepository.findByDateRange(from, to);
        return logs.stream().map(log -> new AttendanceDTO(
                log.getEmployee().getEmployeeName(),
                log.getEmployee().getEmployeeId(),
                log.getClockInTime().format(DATE_FMT),
                log.getClockInTime().format(TIME_FMT),
                log.getClockOutTime() != null ? log.getClockOutTime().format(TIME_FMT) : "In Progress",
                log.getTotalHours()
        )).collect(Collectors.toList());
    }
}
