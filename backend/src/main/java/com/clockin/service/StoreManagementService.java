package com.clockin.service;

import com.clockin.dto.CreateStoreRequest;
import com.clockin.dto.StoreDTO;
import com.clockin.dto.StoreSessionDTO;
import com.clockin.entity.Employee;
import com.clockin.entity.Role;
import com.clockin.entity.Store;
import com.clockin.entity.StoreRole;
import com.clockin.repository.EmployeeRepository;
import com.clockin.repository.StoreRepository;
import com.clockin.repository.StoreSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreManagementService {

    private final StoreRepository storeRepository;
    private final StoreSessionRepository storeSessionRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<StoreDTO> getAllStores() {
        return storeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public StoreDTO getStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        return toDTO(store);
    }

    @Transactional
    public StoreDTO createStore(CreateStoreRequest request) {
        if (storeRepository.existsByStoreId(request.getStoreId())) {
            throw new IllegalArgumentException("Store ID already exists: " + request.getStoreId());
        }

        Store store = new Store();
        store.setStoreId(request.getStoreId());
        store.setStoreName(request.getStoreName());
        store.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        store.setDeviceLimit(request.getDeviceLimit() != null ? request.getDeviceLimit() : 2);
        store.setRole(request.getRole() != null && request.getRole().equals("CREATOR")
                ? StoreRole.CREATOR : StoreRole.STORE_OWNER);
        store.setActive(true);

        Store saved = storeRepository.save(store);

        // Auto-create default 'owner' ADMIN for every STORE_OWNER store
        if (saved.getRole() == StoreRole.STORE_OWNER) {
            Employee owner = new Employee();
            owner.setEmployeeId("owner");
            owner.setEmployeeName("Store Owner");
            owner.setPassword(passwordEncoder.encode("owner123"));
            owner.setRole(Role.ADMIN);
            owner.setStore(saved);
            employeeRepository.save(owner);
        }

        return toDTO(saved);
    }

    @Transactional
    public void resetSessions(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        storeSessionRepository.deleteByStore(store);
    }

    @Transactional
    public StoreDTO changeDeviceLimit(Long storeId, Integer limit) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        store.setDeviceLimit(limit);
        return toDTO(storeRepository.save(store));
    }

    @Transactional
    public StoreDTO toggleActive(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        store.setActive(!store.isActive());
        if (!store.isActive()) {
            storeSessionRepository.deleteByStore(store);
        }
        return toDTO(storeRepository.save(store));
    }

    @Transactional
    public StoreDTO promoteToCreator(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        store.setRole(StoreRole.CREATOR);
        storeSessionRepository.deleteByStore(store);
        return toDTO(storeRepository.save(store));
    }

    @Transactional
    public StoreDTO changePassword(Long storeId, String newPassword) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        store.setPasswordHash(passwordEncoder.encode(newPassword));
        storeSessionRepository.deleteByStore(store);
        return toDTO(storeRepository.save(store));
    }

    private StoreDTO toDTO(Store store) {
        StoreDTO dto = new StoreDTO();
        dto.setId(store.getId());
        dto.setStoreId(store.getStoreId());
        dto.setStoreName(store.getStoreName());
        dto.setRole(store.getRole().name());
        dto.setDeviceLimit(store.getDeviceLimit());
        dto.setActive(store.isActive());

        List<StoreSessionDTO> sessions = storeSessionRepository.findByStore(store).stream()
                .map(s -> {
                    StoreSessionDTO sdto = new StoreSessionDTO();
                    sdto.setId(s.getId());
                    sdto.setDeviceInfo(s.getDeviceInfo());
                    sdto.setLastActive(s.getLastActive() != null ? s.getLastActive().format(FORMATTER) : null);
                    sdto.setCreatedAt(s.getCreatedAt().format(FORMATTER));
                    return sdto;
                })
                .collect(Collectors.toList());

        dto.setActiveSessions(sessions.size());
        dto.setDevices(sessions);
        return dto;
    }
}
