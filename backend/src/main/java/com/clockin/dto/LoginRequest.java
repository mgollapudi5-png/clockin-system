package com.clockin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Employee ID or name is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;

    // Optional: provided when logging in without an active kiosk session (e.g. admin from home)
    private String storeId;
}
