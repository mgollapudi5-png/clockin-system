package com.clockin.repository;

import com.clockin.entity.Employee;
import com.clockin.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Store-scoped (all business logic uses these)
    Optional<Employee> findByEmployeeIdAndStore(String employeeId, Store store);
    List<Employee> findAllByStore(Store store);
    boolean existsByEmployeeIdAndStore(String employeeId, Store store);

    // Global lookups (migration / DataInitializer only)
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByEmployeeIdOrEmployeeName(String employeeId, String employeeName);
}
