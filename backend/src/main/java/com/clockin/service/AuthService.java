package com.clockin.service;

import com.clockin.dto.LoginRequest;
import com.clockin.dto.LoginResponse;
import com.clockin.entity.Employee;
import com.clockin.entity.Store;
import com.clockin.repository.EmployeeRepository;
import com.clockin.repository.StoreRepository;
import com.clockin.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final StoreAuthService storeAuthService;

    public LoginResponse login(LoginRequest request, String kioskToken) {
        // Resolve store: kiosk session takes priority, then storeId in request body
        Store store = null;
        if (StringUtils.hasText(kioskToken)) {
            store = storeAuthService.getStoreFromKioskToken(kioskToken);
        }
        if (store == null && StringUtils.hasText(request.getStoreId())) {
            store = storeRepository.findByStoreId(request.getStoreId()).orElse(null);
        }
        if (store == null) {
            throw new BadCredentialsException("Store context required. Please provide a Store ID.");
        }

        Employee employee = employeeRepository
                .findByEmployeeIdAndStore(request.getIdentifier(), store)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = tokenProvider.generateToken(employee.getEmployeeId(), employee.getRole().name(), store.getStoreId());
        return new LoginResponse(token, employee.getEmployeeId(), employee.getEmployeeName(), employee.getRole().name(), store.getStoreId());
    }
}
