package com.clockin.service;

import com.clockin.dto.StoreLoginRequest;
import com.clockin.dto.StoreLoginResponse;
import com.clockin.entity.Store;
import com.clockin.entity.StoreRole;
import com.clockin.entity.StoreSession;
import com.clockin.repository.StoreRepository;
import com.clockin.repository.StoreSessionRepository;
import com.clockin.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StoreAuthService {

    private final StoreRepository storeRepository;
    private final StoreSessionRepository storeSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public StoreLoginResponse login(StoreLoginRequest request) {
        Store store = storeRepository.findByStoreId(request.getStoreId())
                .orElseThrow(() -> new BadCredentialsException("Invalid store ID or password"));

        if (!store.isActive()) {
            throw new IllegalStateException("This store has been deactivated. Contact your admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), store.getPasswordHash())) {
            throw new BadCredentialsException("Invalid store ID or password");
        }

        if (store.getRole() == StoreRole.CREATOR) {
            String token = jwtTokenProvider.generateToken(store.getStoreId(), "CREATOR", store.getStoreId());
            return new StoreLoginResponse("CREATOR", store.getStoreName(), store.getStoreId(), null, token);
        }

        // STORE_OWNER: check device limit
        long activeSessions = storeSessionRepository.countByStore(store);
        if (activeSessions >= store.getDeviceLimit()) {
            throw new IllegalStateException("Maximum device limit reached (" + store.getDeviceLimit() + "/" + store.getDeviceLimit() + "). Contact your admin.");
        }

        // Create new session
        String sessionToken = UUID.randomUUID().toString();
        StoreSession session = new StoreSession();
        session.setStore(store);
        session.setSessionToken(sessionToken);
        session.setDeviceInfo(request.getDeviceInfo() != null ? request.getDeviceInfo() : "Unknown Device");
        session.setCreatedAt(LocalDateTime.now());
        session.setLastActive(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusYears(1));
        storeSessionRepository.save(session);

        return new StoreLoginResponse("STORE_OWNER", store.getStoreName(), store.getStoreId(), sessionToken, null);
    }

    @Transactional
    public boolean verifyKioskSession(String sessionToken) {
        return storeSessionRepository.findBySessionToken(sessionToken)
                .map(session -> {
                    if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
                        storeSessionRepository.delete(session);
                        return false;
                    }
                    if (!session.getStore().isActive()) {
                        return false;
                    }
                    session.setLastActive(LocalDateTime.now());
                    storeSessionRepository.save(session);
                    return true;
                })
                .orElse(false);
    }

    public String extractCreatorStoreId(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new BadCredentialsException("Invalid or expired token");
        }
        String role = jwtTokenProvider.getRoleFromToken(token);
        if (!"CREATOR".equals(role)) {
            throw new BadCredentialsException("Access denied. Creator role required.");
        }
        return jwtTokenProvider.getEmployeeIdFromToken(token);
    }

    public Store getStoreFromKioskToken(String sessionToken) {
        return storeSessionRepository.findBySessionToken(sessionToken)
                .map(StoreSession::getStore)
                .orElse(null);
    }
}
