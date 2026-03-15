package com.clockin.security;

import com.clockin.entity.Employee;
import com.clockin.entity.Store;
import com.clockin.repository.EmployeeRepository;
import com.clockin.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final EmployeeRepository employeeRepository;
    private final StoreRepository storeRepository;

    // Fallback — used by Spring Security internals only
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        Employee employee = employeeRepository
                .findByEmployeeIdOrEmployeeName(identifier, identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
        return new CustomUserDetails(employee);
    }

    // Primary — used by JwtAuthenticationFilter (store-scoped)
    public UserDetails loadByEmployeeIdAndStore(String employeeId, String storeId) throws UsernameNotFoundException {
        Store store = storeRepository.findByStoreId(storeId)
                .orElseThrow(() -> new UsernameNotFoundException("Store not found: " + storeId));
        Employee employee = employeeRepository
                .findByEmployeeIdAndStore(employeeId, store)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + employeeId));
        return new CustomUserDetails(employee);
    }
}
