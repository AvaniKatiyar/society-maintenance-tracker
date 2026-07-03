package com.society.tracker.service;

import com.society.tracker.config.JwtUtils;
import com.society.tracker.dto.*;
import com.society.tracker.entity.User;
import com.society.tracker.entity.UserRole;
import com.society.tracker.exception.BadRequestException;
import com.society.tracker.exception.ResourceNotFoundException;
import com.society.tracker.mapper.DtoMapper;
import com.society.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final FileStorageService fileStorageService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already in use.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .flatNumber(request.getFlatNumber())
                .role(UserRole.RESIDENT) // Registration is for residents only
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password.");
        }

        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    public UserDTO getProfile(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return DtoMapper.toUserDTO(user);
    }

    public UserDTO updateProfile(User currentUser, ProfileUpdateRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        if (request.getFlatNumber() != null && !request.getFlatNumber().isBlank()) {
            user.setFlatNumber(request.getFlatNumber());
        }

        userRepository.save(user);
        return DtoMapper.toUserDTO(user);
    }

    public UserDTO uploadProfileImage(User currentUser, MultipartFile file) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String fileUrl = fileStorageService.storeFile(file);
        user.setProfileImageUrl(fileUrl);
        userRepository.save(user);

        return DtoMapper.toUserDTO(user);
    }

    public void changePassword(User currentUser, ChangePasswordRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
