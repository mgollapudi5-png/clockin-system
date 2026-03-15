package com.clockin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardDTO {
    private int totalEmployees;
    private int clockedInCount;
    private List<String> clockedInNames;
    private List<AttendanceDTO> todayActivity;
}
