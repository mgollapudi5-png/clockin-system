package com.clockin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String employeeId;
    private String employeeName;
    private String role;
}
