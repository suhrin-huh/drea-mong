package com.ssafy.dreamong.domain.entity.user.repository;


import com.ssafy.dreamong.domain.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByProviderUserId(String providerUserId);
}