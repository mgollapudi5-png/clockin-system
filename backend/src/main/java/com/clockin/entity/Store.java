package com.clockin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stores")
@Data
@NoArgsConstructor
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", unique = true, nullable = false, length = 50)
    private String storeId;

    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StoreRole role = StoreRole.STORE_OWNER;

    @Column(nullable = false)
    private Integer deviceLimit = 2;

    @Column(nullable = false)
    private boolean active = true;
}
