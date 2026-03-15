package com.clockin.dto;

import lombok.Data;

@Data
public class CreateStoreRequest {
    private String storeName;
    private String storeId;
    private String password;
    private Integer deviceLimit;
    private String role; // STORE_OWNER or CREATOR
}
