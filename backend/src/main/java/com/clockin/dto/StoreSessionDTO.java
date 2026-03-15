package com.clockin.dto;

import lombok.Data;

@Data
public class StoreSessionDTO {
    private Long id;
    private String deviceInfo;
    private String lastActive;
    private String createdAt;
}
