package com.clockin.dto;

import lombok.Data;

@Data
public class KioskClockRequest {
    private String employeeId;
    private String password;
    private String action; // "IN" or "OUT"
}
