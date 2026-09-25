package com.grabrentals.admin.dto;

import com.grabrentals.user.entity.Role;
import com.grabrentals.user.entity.UserStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String phone;

    private String businessName;

    private Role role;

    private UserStatus status;

    private String password;
}
