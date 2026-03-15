package com.clockin.service;

import com.clockin.dto.LoginRequest;
import com.clockin.dto.LoginResponse;
import com.clockin.entity.Employee;
import com.clockin.repository.EmployeeRepository;
import com.clockin.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public LoginResponse login(LoginRequest request) {
        Employee employee = employeeRepository
                .findByEmployeeIdOrEmployeeName(request.getIdentifier(), request.getIdentifier())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = tokenProvider.generateToken(employee.getEmployeeId(), employee.getRole().name());
        return new LoginResponse(token, employee.getEmployeeId(), employee.getEmployeeName(), employee.getRole().name());
    }
}
