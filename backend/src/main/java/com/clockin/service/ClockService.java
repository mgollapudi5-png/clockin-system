package com.clockin.service;

import com.clockin.dto.ClockResponse;
import com.clockin.entity.ClockLog;
import com.clockin.entity.Employee;
import com.clockin.repository.ClockLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClockService {

    private final ClockLogRepository clockLogRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public ClockResponse clockIn(Employee employee) {
        Optional<ClockLog> openLog = clockLogRepository
                .findFirstByEmployeeAndClockOutTimeIsNullOrderByClockInTimeDesc(employee);

        if (openLog.isPresent()) {
            throw new IllegalStateException("Already clocked in. Please clock out first.");
        }

        ClockLog log = new ClockLog();
        log.setEmployee(employee);
        log.setClockInTime(LocalDateTime.now());
        log.setCreatedDate(LocalDateTime.now());
        clockLogRepository.save(log);

        return new ClockResponse(
                "Successfully clocked in",
                log.getClockInTime().format(FORMATTER),
                null, null, true
        );
    }

    @Transactional
    public ClockResponse clockOut(Employee employee) {
        ClockLog openLog = clockLogRepository
                .findFirstByEmployeeAndClockOutTimeIsNullOrderByClockInTimeDesc(employee)
                .orElseThrow(() -> new IllegalStateException("Not clocked in. Please clock in first."));

        LocalDateTime now = LocalDateTime.now();
        openLog.setClockOutTime(now);

        long minutes = Duration.between(openLog.getClockInTime(), now).toMinutes();
        double hours = Math.round((minutes / 60.0) * 100.0) / 100.0;
        openLog.setTotalHours(hours);

        clockLogRepository.save(openLog);

        return new ClockResponse(
                "Successfully clocked out",
                openLog.getClockInTime().format(FORMATTER),
                now.format(FORMATTER),
                hours, false
        );
    }

    public ClockResponse getStatus(Employee employee) {
        Optional<ClockLog> openLog = clockLogRepository
                .findFirstByEmployeeAndClockOutTimeIsNullOrderByClockInTimeDesc(employee);

        if (openLog.isPresent()) {
            return new ClockResponse(
                    "Currently clocked in",
                    openLog.get().getClockInTime().format(FORMATTER),
                    null, null, true
            );
        }
        return new ClockResponse("Not clocked in", null, null, null, false);
    }
}
