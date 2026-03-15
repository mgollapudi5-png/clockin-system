package com.clockin.repository;

import com.clockin.entity.Store;
import com.clockin.entity.StoreSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreSessionRepository extends JpaRepository<StoreSession, Long> {
    List<StoreSession> findByStore(Store store);
    Optional<StoreSession> findBySessionToken(String sessionToken);
    long countByStore(Store store);
    void deleteByStore(Store store);
}
