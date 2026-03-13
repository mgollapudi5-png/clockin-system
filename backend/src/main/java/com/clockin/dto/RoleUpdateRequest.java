package com.clockin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RoleUpdateRequest {

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "EMPLOYEE|ADMIN", message = "Role must be EMPLOYEE or ADMIN")
    private String role;
}
