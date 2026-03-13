package com.clockin.dto;

import lombok.Data;

@Data
public class CreateEmployeeRequest {
    private String employeeId;
    private String employeeName;
    private String password;
    private String role; // "EMPLOYEE" or "ADMIN"
}
