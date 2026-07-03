package com.society.tracker.controller;

import com.society.tracker.dto.*;
import com.society.tracker.entity.User;
import com.society.tracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(authService.getProfile(currentUser));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(authService.updateProfile(currentUser, request));
    }

    @PostMapping("/profile/image")
    public ResponseEntity<UserDTO> uploadProfileImage(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(authService.uploadProfileImage(currentUser, file));
    }

    @PutMapping("/profile/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(currentUser, request);
        return ResponseEntity.ok().build();
    }
}
