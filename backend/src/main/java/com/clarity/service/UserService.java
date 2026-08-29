package com.clarity.service;

import com.clarity.model.User;
import com.clarity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** Set or update the diary PIN for the given user */
    @Transactional
    public void setDiaryPin(User user, String rawPin) {
        if (rawPin == null || rawPin.isBlank())
            throw new IllegalArgumentException("PIN must not be blank");
        user.setDiaryPinHash(passwordEncoder.encode(rawPin));
        userRepository.save(user);
    }
}
