package com.clockin.dto;

import lombok.Data;

@Data
public class StoreLoginRequest {
    private String storeId;
    private String password;
    private String deviceInfo;
}
