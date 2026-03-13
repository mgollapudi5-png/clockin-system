package com.clockin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClockResponse {
    private String message;
    private String clockInTime;
    private String clockOutTime;
    private Double totalHours;
    private boolean clockedIn;
}
