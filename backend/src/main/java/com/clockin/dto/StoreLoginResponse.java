package com.clockin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StoreLoginResponse {
    private String role;         // STORE_OWNER or CREATOR
    private String storeName;
    private String storeId;
    private String sessionToken; // for STORE_OWNER kiosk session
    private String token;        // JWT for CREATOR panel
}
