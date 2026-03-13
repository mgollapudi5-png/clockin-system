package com.clockin.dto;

import lombok.Data;

@Data
public class UpdateEmployeeRequest {
    private String employeeName;
    private String password; // optional — blank means no change
    private String role;
}
