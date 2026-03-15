package com.clockin.repository;

import com.clockin.entity.ClockLog;
import com.clockin.entity.Employee;
import com.clockin.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClockLogRepository extends JpaRepository<ClockLog, Long> {

    Optional<ClockLog> findFirstByEmployeeAndClockOutTimeIsNullOrderByClockInTimeDesc(Employee employee);

    @Query("SELECT c FROM ClockLog c JOIN FETCH c.employee WHERE c.clockInTime BETWEEN :from AND :to AND c.employee.store = :store ORDER BY c.employee.employeeName, c.clockInTime")
    List<ClockLog> findByDateRangeAndStore(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("store") Store store
    );

    @Query("SELECT c FROM ClockLog c JOIN FETCH c.employee WHERE c.clockOutTime IS NULL AND c.employee.store = :store")
    List<ClockLog> findAllClockedInByStore(@Param("store") Store store);
}
