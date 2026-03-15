package com.clockin.repository;

import com.clockin.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByStoreId(String storeId);
    boolean existsByStoreId(String storeId);
}
