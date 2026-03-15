package com.clockin;

import com.clockin.entity.Employee;
import com.clockin.entity.Role;
import com.clockin.entity.Store;
import com.clockin.entity.StoreRole;
import com.clockin.repository.EmployeeRepository;
import com.clockin.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {

        // Drop the old global unique constraint on employee_id (replaced by composite unique per store)
        jdbcTemplate.execute(
            "DO $$ BEGIN " +
            "IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='employees' AND indexname='employees_employee_id_key') THEN " +
            "ALTER TABLE employees DROP CONSTRAINT employees_employee_id_key; " +
            "END IF; END $$"
        );

        // Ensure creator store exists
        Store creatorStore = storeRepository.findByStoreId("CREATOR001").orElseGet(() -> {
            Store s = new Store();
            s.setStoreId("CREATOR001");
            s.setStoreName("Platform Creator");
            s.setPasswordHash(passwordEncoder.encode("creator123"));
            s.setRole(StoreRole.CREATOR);
            s.setDeviceLimit(99);
            s.setActive(true);
            return storeRepository.save(s);
        });

        // Assign any orphan employees (no store) to creator store
        employeeRepository.findAll().stream()
            .filter(e -> e.getStore() == null)
            .forEach(e -> {
                e.setStore(creatorStore);
                employeeRepository.save(e);
            });

        // Auto-create default 'owner' admin for creator store if not present
        if (!employeeRepository.existsByEmployeeIdAndStore("owner", creatorStore)) {
            Employee owner = new Employee();
            owner.setEmployeeId("owner");
            owner.setEmployeeName("Store Owner");
            owner.setPassword(passwordEncoder.encode("owner123"));
            owner.setRole(Role.ADMIN);
            owner.setStore(creatorStore);
            employeeRepository.save(owner);
            System.out.println("Default admin created for CREATOR001 → ID: owner / Password: owner123");
        }
    }
}
