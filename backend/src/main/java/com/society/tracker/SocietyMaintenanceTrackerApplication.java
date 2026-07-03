package com.society.tracker;

import com.society.tracker.entity.Settings;
import com.society.tracker.entity.User;
import com.society.tracker.entity.UserRole;
import com.society.tracker.repository.SettingsRepository;
import com.society.tracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@SpringBootApplication
public class SocietyMaintenanceTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocietyMaintenanceTrackerApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            SettingsRepository settingsRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Initialize default admin user if not exists
            if (userRepository.findByEmail("admin@society.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@society.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("System Administrator");
                admin.setPhoneNumber("1234567890");
                admin.setFlatNumber("A-000");
                admin.setRole(UserRole.ADMIN);
                admin.setCreatedAt(LocalDateTime.now());
                admin.setUpdatedAt(LocalDateTime.now());
                userRepository.save(admin);
                System.out.println("Default admin user created: admin@society.com / admin123");
            }

            // Initialize default settings if not exists
            if (settingsRepository.findBySettingKey("overdue_threshold_days").isEmpty()) {
                Settings settings = new Settings();
                settings.setSettingKey("overdue_threshold_days");
                settings.setSettingValue("5");
                settings.setDescription("Default days after which a complaint is automatically marked overdue");
                settingsRepository.save(settings);
                System.out.println("Default setting 'overdue_threshold_days' initialized to 5 days.");
            }
        };
    }
}
