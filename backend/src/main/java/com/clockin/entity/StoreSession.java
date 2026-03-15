package com.clockin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_sessions")
@Data
@NoArgsConstructor
public class StoreSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "session_token", unique = true, nullable = false)
    private String sessionToken;

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
