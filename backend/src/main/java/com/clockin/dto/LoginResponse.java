package com.clockin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String employeeId;
    private String employeeName;
    private String role;
}
