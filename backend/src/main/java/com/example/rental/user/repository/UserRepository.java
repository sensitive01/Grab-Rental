package com.example.rental.user.repository;

import com.example.rental.user.entity.Role;
import com.example.rental.user.entity.User;
import com.example.rental.user.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByRole(Role role);

    List<User> findByStatus(UserStatus status);

    List<User> findByRoleAndStatus(Role role, UserStatus status);
}
