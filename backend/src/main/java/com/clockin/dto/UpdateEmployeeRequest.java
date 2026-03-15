package com.clockin.dto;

import lombok.Data;

@Data
public class UpdateEmployeeRequest {
    private String employeeName;
    private String password;
}
