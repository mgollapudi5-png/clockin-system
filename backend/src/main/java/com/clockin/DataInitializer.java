package com.clockin;

import com.clockin.entity.Employee;
import com.clockin.entity.Role;
import com.clockin.entity.Store;
import com.clockin.entity.StoreRole;
import com.clockin.repository.EmployeeRepository;
import com.clockin.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (employeeRepository.count() == 0) {
            Employee admin = new Employee();
            admin.setEmployeeId("ADMIN001");
            admin.setEmployeeName("System Admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            employeeRepository.save(admin);

            Employee emp = new Employee();
            emp.setEmployeeId("EMP001");
            emp.setEmployeeName("John Doe");
            emp.setPassword(passwordEncoder.encode("emp123"));
            emp.setRole(Role.EMPLOYEE);
            employeeRepository.save(emp);

            System.out.println("===========================================");
            System.out.println("Default users seeded:");
            System.out.println("  Admin    → ID: ADMIN001 / Password: admin123");
            System.out.println("  Employee → ID: EMP001   / Password: emp123");
            System.out.println("===========================================");
        }

        if (storeRepository.count() == 0) {
            Store creator = new Store();
            creator.setStoreId("CREATOR001");
            creator.setStoreName("Platform Creator");
            creator.setPasswordHash(passwordEncoder.encode("creator123"));
            creator.setRole(StoreRole.CREATOR);
            creator.setDeviceLimit(99);
            creator.setActive(true);
            storeRepository.save(creator);

            System.out.println("===========================================");
            System.out.println("Default store portal users seeded:");
            System.out.println("  Creator → ID: CREATOR001 / Password: creator123");
            System.out.println("===========================================");
        }
    }
}
