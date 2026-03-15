package com.clockin.dto;

import lombok.Data;

@Data
public class CreateEmployeeRequest {
    private String employeeName;
    private String employeeId;
    private String password;
}
