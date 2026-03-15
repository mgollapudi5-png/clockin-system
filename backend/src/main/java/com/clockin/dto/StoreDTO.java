package com.clockin.dto;

import lombok.Data;

import java.util.List;

@Data
public class StoreDTO {
    private Long id;
    private String storeId;
    private String storeName;
    private String role;
    private Integer deviceLimit;
    private boolean active;
    private long activeSessions;
    private List<StoreSessionDTO> devices;
}
