package com.clockin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AttendanceDTO {
    private String employeeName;
    private String employeeId;
    private String date;
    private String clockInTime;
    private String clockOutTime;
    private Double totalHours;
}
